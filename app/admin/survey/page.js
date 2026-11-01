
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  googleFormUrl,
  PLAN_CONTENT_KEY,
} from '../../lib/googleForm.mjs'
import {
  HOME_CONTENT_KEY,
  normalizeHomeContent,
  parseHomeContent,
} from '../../lib/homeContent.mjs'

const colors = [
  ['background', 'Хэсгийн арын өнгө'],
  ['card_background', 'Баруун картын өнгө'],
  ['card_border', 'Картын хүрээний өнгө'],
  ['eyebrow_color', 'Жижиг гарчгийн өнгө'],
  ['heading_color', 'Том гарчгийн өнгө'],
  ['body_color', 'Тайлбарын өнгө'],
  ['card_text_color', 'Картын бичвэрийн өнгө'],
  ['muted_text_color', 'Минутын нэгжийн өнгө'],
  ['button_background', 'Товчны арын өнгө'],
  ['button_text_color', 'Товчны текстийн өнгө'],
]

const sizes = [
  ['heading_size', 'Том гарчиг', 24, 90],
  ['body_size', 'Тайлбар', 12, 36],
  ['eyebrow_size', 'Жижиг гарчиг', 10, 24],
  ['duration_size', '5–7 тоо', 36, 150],
  ['benefit_size', 'Картын давуу талууд', 12, 36],
  ['button_size', 'Товчны текст', 12, 28],
  ['section_padding', 'Хэсгийн дээд/доод зай', 20, 150],
  ['card_radius', 'Картын булангийн дугуйралт', 0, 80],
]

const fieldStyle = {
  width: '100%',
  padding: '13px 15px',
  border: '1px solid #d8e1ee',
  borderRadius: 12,
  background: '#ffffff',
  color: '#202938',
  fontSize: 15,
  boxSizing: 'border-box',
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{
            ...fieldStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
      ) : (
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle}
        />
      )}
    </label>
  )
}

export default function SurveyAdminPage() {
  const [url, setUrl] = useState('')
  const [rowId, setRowId] = useState(null)
  const [homeRowId, setHomeRowId] = useState(null)

  const [content, setContent] = useState(() =>
    normalizeHomeContent(null)
  )

  const [busy, setBusy] = useState(true)
  const [savingForm, setSavingForm] = useState(false)
  const [savingDesign, setSavingDesign] = useState(false)

  const [formMessage, setFormMessage] = useState('')
  const [designMessage, setDesignMessage] = useState('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      const [planResult, homeResult] = await Promise.all([
        supabase
          .from('site_content')
          .select('id,button_url')
          .eq('content_key', PLAN_CONTENT_KEY)
          .maybeSingle(),

        supabase
          .from('site_content')
          .select('id,body')
          .eq('content_key', HOME_CONTENT_KEY)
          .maybeSingle(),
      ])

      if (!active) return

      if (planResult.error) {
        setFormMessage(planResult.error.message)
      } else {
        setRowId(planResult.data?.id ?? null)
        setUrl(planResult.data?.button_url || '')
      }

      if (homeResult.error) {
        setLoadError(true)
        setDesignMessage(homeResult.error.message)
      } else {
        setHomeRowId(homeResult.data?.id ?? null)
        setContent(parseHomeContent(homeResult.data?.body))
      }

      setBusy(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const assessment = content.assessment
  const style = assessment.style

  function change(field, value) {
    setContent((current) => ({
      ...current,
      assessment: {
        ...current.assessment,
        [field]: value,
      },
    }))
  }

  function changeStyle(field, value) {
    setContent((current) => ({
      ...current,
      assessment: {
        ...current.assessment,
        style: {
          ...current.assessment.style,
          [field]: value,
        },
      },
    }))
  }

  function changeBenefit(index, value) {
    setContent((current) => ({
      ...current,
      assessment: {
        ...current.assessment,
        benefits: current.assessment.benefits.map(
          (item, i) => i === index ? value : item
        ),
      },
    }))
  }

  async function saveForm(event) {
    event.preventDefault()

    const validUrl = googleFormUrl(url)

    if (!validUrl) {
      setFormMessage(
        'Google Form-ийн зөв холбоос оруулна уу.'
      )
      return
    }

    setSavingForm(true)
    setFormMessage('')

    try {
      const payload = {
        content_key: PLAN_CONTENT_KEY,
        title: 'Хувийн нэг сарын төлөвлөгөө',
        button_text: 'Хувийн төлөвлөгөө авах →',
        button_url: validUrl,
        published: true,
        updated_at: new Date().toISOString(),
      }

      const query = rowId
        ? supabase
            .from('site_content')
            .update(payload)
            .eq('id', rowId)
        : supabase
            .from('site_content')
            .insert(payload)

      const { data, error } = await query
        .select('id')
        .single()

      if (error) throw error

      setRowId(data.id)
      setUrl(validUrl)
      setFormMessage('Google Form холбоос хадгалагдлаа.')
    } catch (error) {
      setFormMessage(`Алдаа: ${error.message}`)
    } finally {
      setSavingForm(false)
    }
  }

  async function saveDesign(event) {
    event.preventDefault()

    if (loadError) return

    setSavingDesign(true)
    setDesignMessage('')

    try {
      // Хадгалах үед бусад нүүр хуудасны
      // мэдээллийг алдагдуулахгүй байхын тулд
      // хамгийн сүүлийн өгөгдлийг дахин авна.
      const { data: latest, error: readError } = await supabase
        .from('site_content')
        .select('id,body')
        .eq('content_key', HOME_CONTENT_KEY)
        .maybeSingle()

      if (readError) throw readError

      const latestContent = parseHomeContent(latest?.body)

      const merged = normalizeHomeContent({
        ...latestContent,
        assessment: assessment,
      })

      const payload = {
        content_key: HOME_CONTENT_KEY,
        body: JSON.stringify(merged),
        published: true,
        updated_at: new Date().toISOString(),
      }

      const id = latest?.id ?? homeRowId

      const query = id
        ? supabase
            .from('site_content')
            .update(payload)
            .eq('id', id)
        : supabase
            .from('site_content')
            .insert(payload)

      const { data, error } = await query
        .select('id')
        .single()

      if (error) throw error

      setHomeRowId(data.id)
      setContent(merged)

      setDesignMessage(
        'Амжилттай хадгаллаа. Нүүр хуудсаа refresh хийгээд шалгаарай.'
      )
    } catch (error) {
      setDesignMessage(`Алдаа: ${error.message}`)
    } finally {
      setSavingDesign(false)
    }
  }

  if (busy) {
    return (
      <main className="surveyAdmin">
        <p>Судалгааны тохиргоог ачаалж байна...</p>
      </main>
    )
  }

  return (
    <main className="surveyAdmin">
      <div className="intro">
        <p className="eyebrow">
          LEARNMINEA · СУДАЛГАА
        </p>

        <h1>Сурах арга барилын судалгаа</h1>

        <p>
          Нүүр хуудасны судалгааны хэсгийн
          текст, өнгө, хэмжээ болон холбоосыг
          эндээс удирдана.
        </p>

        <Link
          href="/assessment/questions"
          target="_blank"
          className="testLink"
        >
          Судалгааг нээж турших ↗
        </Link>
      </div>

      <form onSubmit={saveDesign} className="panel">
        <div className="panelHeading">
          <span className="number">01</span>
          <div>
            <h2>Нүүр хуудасны судалгааны хэсэг</h2>
            <p>
              Зүүн талын бичвэр болон баруун
              талын 5–7 минутын карт.
            </p>
          </div>
        </div>

        <h3>Зүүн талын бичвэр</h3>

        <div className="fields">
          <TextField
            label="Жижиг гарчиг"
            value={assessment.eyebrow}
            onChange={(value) =>
              change('eyebrow', value)
            }
          />

          <TextField
            label="Үндсэн гарчиг"
            value={assessment.title}
            onChange={(value) =>
              change('title', value)
            }
            multiline
          />

          <TextField
            label="Тайлбар"
            value={assessment.body}
            onChange={(value) =>
              change('body', value)
            }
            multiline
          />

          <TextField
            label="Товчны бичвэр"
            value={assessment.button_text}
            onChange={(value) =>
              change('button_text', value)
            }
          />

          <TextField
            label="Товчны холбоос"
            value={assessment.button_url}
            onChange={(value) =>
              change('button_url', value)
            }
          />
        </div>

        <h3>Баруун талын карт</h3>

        <div className="twoColumns">
          <TextField
            label="Үргэлжлэх хугацаа"
            value={assessment.duration}
            onChange={(value) =>
              change('duration', value)
            }
          />

          <TextField
            label="Хугацааны нэгж"
            value={assessment.duration_unit}
            onChange={(value) =>
              change('duration_unit', value)
            }
          />
        </div>

        <div className="fields">
          {assessment.benefits.map((benefit, index) => (
            <TextField
              key={index}
              label={`Давуу тал ${index + 1}`}
              value={benefit}
              onChange={(value) =>
                changeBenefit(index, value)
              }
            />
          ))}
        </div>

        <h3>Өнгөний тохиргоо</h3>

        <div className="colorGrid">
          {colors.map(([key, label]) => (
            <label className="colorField" key={key}>
              <span>{label}</span>

              <div className="colorRow">
                <input
                  type="color"
                  value={style[key]}
                  onChange={(event) =>
                    changeStyle(key, event.target.value)
                  }
                />

                <input
                  type="text"
                  value={style[key]}
                  onChange={(event) =>
                    changeStyle(key, event.target.value)
                  }
                  aria-label={`${label} HEX`}
                />
              </div>
            </label>
          ))}
        </div>

        <h3>Бичвэрийн хэмжээ ба зай</h3>

        <div className="sizeGrid">
          {sizes.map(([key, label, min, max]) => (
            <label className="sizeField" key={key}>
              <div className="sizeLabel">
                <span>{label}</span>
                <strong>{style[key]} px</strong>
              </div>

              <input
                type="range"
                min={min}
                max={max}
                value={style[key]}
                onChange={(event) =>
                  changeStyle(
                    key,
                    Number(event.target.value)
                  )
                }
              />
            </label>
          ))}
        </div>

        <h3>Урьдчилсан харагдац</h3>

        <div
          className="preview"
          style={{
            background: style.background,
            padding: `${Math.min(style.section_padding, 65)}px 24px`,
          }}
        >
          <div className="previewLeft">
            <div
              style={{
                color: style.eyebrow_color,
                fontSize: style.eyebrow_size,
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              {assessment.eyebrow}
            </div>

            <h4
              style={{
                color: style.heading_color,
                fontSize: `clamp(24px, 3vw, ${style.heading_size}px)`,
              }}
            >
              {assessment.title}
            </h4>

            <p
              style={{
                color: style.body_color,
                fontSize: Math.min(style.body_size, 20),
              }}
            >
              {assessment.body}
            </p>

            <span
              className="previewButton"
              style={{
                background: style.button_background,
                color: style.button_text_color,
                fontSize: style.button_size,
              }}
            >
              {assessment.button_text}
            </span>
          </div>

          <div
            className="previewCard"
            style={{
              background: style.card_background,
              borderColor: style.card_border,
              borderRadius: style.card_radius,
              color: style.card_text_color,
            }}
          >
            <div className="previewDuration">
              <strong
                style={{
                  fontSize: `clamp(40px, 5vw, ${style.duration_size}px)`,
                }}
              >
                {assessment.duration}
              </strong>

              <span style={{ color: style.muted_text_color }}>
                {assessment.duration_unit}
              </span>
            </div>

            <hr style={{ borderColor: style.card_border }} />

            {assessment.benefits.map((benefit, index) => (
              <p
                key={index}
                style={{
                  fontSize: Math.min(style.benefit_size, 20),
                }}
              >
                ✓ {benefit}
              </p>
            ))}
          </div>
        </div>

        <div className="saveArea">
          <button
            type="submit"
            disabled={savingDesign || loadError}
          >
            {savingDesign
              ? 'Хадгалж байна...'
              : 'Судалгааны хэсгийг хадгалах'}
          </button>

          {designMessage && (
            <p role="status">{designMessage}</p>
          )}
        </div>
      </form>

      <form onSubmit={saveForm} className="panel">
        <div className="panelHeading">
          <span className="number">02</span>
          <div>
            <h2>Нэг сарын төлөвлөгөөний хүсэлт</h2>
            <p>
              Судалгааны үр дүнгээс нээгдэх
              Google Form холбоос.
            </p>
          </div>
        </div>

        <label className="field">
          <span>Google Form-ийн холбоос</span>

          <input
            type="url"
            required
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            placeholder="https://forms.gle/..."
            style={fieldStyle}
          />
        </label>

        <div className="saveArea">
          <button type="submit" disabled={savingForm}>
            {savingForm
              ? 'Хадгалж байна...'
              : 'Google Form холбоос хадгалах'}
          </button>

          {formMessage && (
            <p role="status">{formMessage}</p>
          )}
        </div>
      </form>

      <style jsx>{`
        .surveyAdmin {
          max-width: 1150px;
          margin: 35px auto;
          padding: 24px;
          color: #202938;
        }

        .intro {
          margin-bottom: 30px;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #0879d1;
        }

        h1 {
          font-size: 34px;
          margin: 12px 0;
        }

        .intro p,
        .panelHeading p {
          color: #718096;
          line-height: 1.7;
        }

        .testLink {
          display: inline-block;
          padding: 13px 20px;
          margin-top: 10px;
          background: #0879d1;
          color: #fff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
        }

        .panel {
          background: white;
          border: 1px solid #e1e7ef;
          border-radius: 22px;
          padding: 30px;
          margin-bottom: 25px;
        }

        .panelHeading {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .number {
          display: grid;
          place-items: center;
          min-width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #eaf4ff;
          color: #0879d1;
          font-weight: 800;
        }

        h2 {
          margin: 0;
          font-size: 22px;
        }

        h3 {
          margin: 32px 0 18px;
          font-size: 17px;
          border-bottom: 1px solid #e5eaf1;
          padding-bottom: 12px;
        }

        .fields {
          display: grid;
          gap: 18px;
        }

        .twoColumns,
        .colorGrid,
        .sizeGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .colorField,
        .sizeField,
        .field {
          display: grid;
          gap: 9px;
          color: #344054;
          font-weight: 650;
          font-size: 14px;
        }

        .colorRow {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .colorRow input[type='color'] {
          width: 55px;
          height: 45px;
          padding: 3px;
          border: 1px solid #d8e1ee;
          border-radius: 10px;
          background: white;
          cursor: pointer;
        }

        .colorRow input[type='text'] {
          flex: 1;
          min-width: 0;
          padding: 12px;
          border: 1px solid #d8e1ee;
          border-radius: 10px;
          font: inherit;
        }

        .sizeLabel {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .sizeLabel strong {
          color: #0879d1;
        }

        .sizeField input {
          width: 100%;
          accent-color: #0879d1;
        }

        .preview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          border-radius: 18px;
          overflow: hidden;
        }

        .previewLeft h4 {
          font-family: Georgia, serif;
          font-weight: 500;
          line-height: 1.12;
          margin: 22px 0;
          white-space: pre-line;
        }

        .previewLeft p {
          line-height: 1.65;
          margin-bottom: 26px;
        }

        .previewButton {
          display: inline-block;
          padding: 15px 23px;
          border-radius: 40px;
          font-weight: 700;
        }

        .previewCard {
          border: 1px solid;
          padding: 28px;
          min-width: 0;
        }

        .previewDuration {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .previewDuration strong {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .previewCard hr {
          border: 0;
          border-top: 1px solid;
          margin: 14px 0 25px;
        }

        .previewCard p {
          margin: 20px 0;
          line-height: 1.5;
        }

        .saveArea {
          margin-top: 26px;
        }

        .saveArea button {
          border: 0;
          border-radius: 12px;
          padding: 15px 24px;
          background: #0879d1;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .saveArea button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .saveArea p {
          color: #60758d;
          line-height: 1.6;
        }

        @media (max-width: 750px) {
          .surveyAdmin {
            padding: 15px;
          }

          .panel {
            padding: 20px;
          }

          .twoColumns,
          .colorGrid,
          .sizeGrid,
          .preview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
