
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const DEFAULTS = {
  heroTitle: 'Хэл сурахад ихийг биш, зөвийг сур.',
  heroSubtitle:
    'Хэл сурахад ихийг биш, зөвийг сур. Өөрийн түвшин, зорилго, сурах арга барилдаа тохирсон материалуудаа нэг дороос олоорой.',
  heroEyebrow: 'ӨӨРИЙН ХЭМНЭЛЭЭР, БОДИТ ХЭРЭГЛЭЭНЭЭС',
  heroImage: '',
  heroFontSize: 72,
  heroTextSize: 18,
  headingFontSize: 48,
  primaryColor: '#0879D1',
  heroColor: '#79B6FA',
  ticketTop: 44,
  ticketLeft: 58,
  ticketScale: 0.68,
  ticketRotate: 5,
  heroTitleHtml: '',
  heroSubtitleHtml: '',
  heroEyebrowHtml: '',
}

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')

function RichEditor({ label, value, html, onChange }) {
  const ref = useRef(null)
  const selection = useRef(null)

  useEffect(() => {
    if (ref.current && !ref.current.dataset.initialized) {
      ref.current.innerHTML = html || escapeHtml(value)
      ref.current.dataset.initialized = 'true'
    }
  }, [html, value])

  function rememberSelection() {
    const sel = window.getSelection()
    if (
      sel?.rangeCount &&
      ref.current?.contains(sel.anchorNode)
    ) {
      selection.current = sel.getRangeAt(0).cloneRange()
    }
  }

  function sync() {
    if (!ref.current) return
    onChange(ref.current.innerText, ref.current.innerHTML)
  }

  function command(name, argument) {
    ref.current?.focus()

    if (selection.current) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(selection.current)
    }

    document.execCommand(name, false, argument)
    sync()
    rememberSelection()
  }

  function addLink() {
    const url = window.prompt('Холбоосын URL (https://...)')
    if (!url) return

    if (!/^https?:\/\//i.test(url)) {
      window.alert('https:// эсвэл http:// холбоос оруулна уу.')
      return
    }

    command('createLink', url)
  }

  function addImage() {
    const url = window.prompt('Зургийн URL (https://...)')
    if (!url) return

    if (!/^https:\/\//i.test(url)) {
      window.alert('https:// зургийн холбоос оруулна уу.')
      return
    }

    command('insertImage', url)
  }

  return (
    <div className="richField">
      <label className="fieldLabel">{label}</label>

      <div className="richBox">
        <div
          className="toolbar"
          onMouseUp={rememberSelection}
        >
          <select
            aria-label="Фонт"
            defaultValue="Arial"
            onChange={e =>
              command('fontName', e.target.value)
            }
          >
            <option value="Arial">Sans Serif</option>
            <option value="Georgia">Serif</option>
            <option value="Times New Roman">
              Times New Roman
            </option>
            <option value="Courier New">Monospace</option>
          </select>

          <select
            aria-label="Бичвэрийн формат"
            defaultValue="p"
            onChange={e =>
              command('formatBlock', e.target.value)
            }
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <select
            aria-label="Фонтын хэмжээ"
            defaultValue="3"
            onChange={e =>
              command('fontSize', e.target.value)
            }
          >
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Extra large</option>
          </select>

          <button
            type="button"
            title="Bold"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('bold')}
          >
            <b>B</b>
          </button>

          <button
            type="button"
            title="Italic"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('italic')}
          >
            <i>I</i>
          </button>

          <button
            type="button"
            title="Underline"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('underline')}
          >
            <u>U</u>
          </button>

          <button
            type="button"
            title="Quote"
            onMouseDown={e => e.preventDefault()}
            onClick={() =>
              command('formatBlock', 'blockquote')
            }
          >
            ❞
          </button>

          <button
            type="button"
            title="Code"
            onMouseDown={e => e.preventDefault()}
            onClick={() =>
              command('formatBlock', 'pre')
            }
          >
            {'</>'}
          </button>

          <button
            type="button"
            title="Холбоос"
            onMouseDown={e => e.preventDefault()}
            onClick={addLink}
          >
            🔗
          </button>

          <button
            type="button"
            title="Зураг"
            onMouseDown={e => e.preventDefault()}
            onClick={addImage}
          >
            ▣
          </button>

          <button
            type="button"
            title="Дугаартай жагсаалт"
            onMouseDown={e => e.preventDefault()}
            onClick={() =>
              command('insertOrderedList')
            }
          >
            ☷
          </button>

          <button
            type="button"
            title="Жагсаалт"
            onMouseDown={e => e.preventDefault()}
            onClick={() =>
              command('insertUnorderedList')
            }
          >
            ≡
          </button>

          <button
            type="button"
            title="Зүүн талд"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('justifyLeft')}
          >
            ☰
          </button>

          <button
            type="button"
            title="Голлуулах"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('justifyCenter')}
          >
            ≡
          </button>

          <button
            type="button"
            title="Баруун талд"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('justifyRight')}
          >
            ☷
          </button>

          <label
            className="colorTool"
            title="Бичвэрийн өнгө"
          >
            A
            <input
              type="color"
              defaultValue="#242237"
              onChange={e =>
                command('foreColor', e.target.value)
              }
            />
          </label>

          <label
            className="colorTool"
            title="Тодруулагч"
          >
            ▧
            <input
              type="color"
              defaultValue="#fff3b0"
              onChange={e =>
                command('hiliteColor', e.target.value)
              }
            />
          </label>

          <button
            type="button"
            title="Формат арилгах"
            onMouseDown={e => e.preventDefault()}
            onClick={() => command('removeFormat')}
          >
            Tx
          </button>
        </div>

        <div
          ref={ref}
          className="editableArea"
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          role="textbox"
          aria-label={label}
          aria-multiline="true"
        />
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function SiteEditorPage() {
  const router = useRouter()

  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function initialize() {
      const { data: auth } =
        await supabase.auth.getUser()

      if (!auth?.user) {
        router.replace('/login')
        return
      }

      const {
        data: allowed,
        error: roleError,
      } = await supabase.rpc('is_admin')

      if (roleError || allowed !== true) {
        router.replace('/')
        return
      }

      const { data, error } = await supabase
        .from('site_editor_settings')
        .select('content')
        .eq('id', 'homepage')
        .maybeSingle()

      if (error) {
        setMessage(error.message)
      } else if (data?.content) {
        setSettings({
          ...DEFAULTS,
          ...data.content,
        })
      }

      setLoading(false)
    }

    initialize()
  }, [router])

  function change(key, value) {
    setSettings(previous => ({
      ...previous,
      [key]: value,
    }))
    setMessage('')
  }

  function changeRich(key, text, html) {
    setSettings(previous => ({
      ...previous,
      [key]: text,
      [`${key}Html`]: html,
    }))
    setMessage('')
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp',
      ].includes(file.type)
    ) {
      setMessage(
        'JPG, PNG эсвэл WEBP зураг сонгоно уу.'
      )
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        'Зураг 10 MB-аас бага байх ёстой.'
      )
      return
    }

    setUploading(true)
    setMessage('')

    const extension =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'

    const path =
      `homepage/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('site-images')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      setMessage(
        `Зураг оруулахад алдаа гарлаа: ${error.message}`
      )
    } else {
      const { data } = supabase.storage
        .from('site-images')
        .getPublicUrl(path)

      change('heroImage', data.publicUrl)

      setMessage(
        'Зураг орлоо. Доорх ногоон Хадгалах товчийг дарна уу.'
      )
    }

    setUploading(false)
  }

  async function save() {
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('site_editor_settings')
      .upsert(
        {
          id: 'homepage',
          content: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    setSaving(false)

    setMessage(
      error
        ? `Хадгалахад алдаа гарлаа: ${error.message}`
        : 'Тохиргоо Supabase-д амжилттай хадгалагдлаа.'
    )
  }

  if (loading) {
    return (
      <div style={{ padding: 60 }}>
        Admin эрх шалгаж байна...
      </div>
    )
  }

  return (
    <main className="siteEditor">
      <header className="pageHeading">
        <Link href="/admin">
          ← Admin руу буцах
        </Link>

        <h1>Сайтын редактор</h1>
        <p>LEARN·MINEA · Homepage Settings</p>
      </header>

      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}

      <div className="editorGrid">
        <div className="controls">
          <section className="panel">
            <h2>01. Нүүр хуудасны текст</h2>

            <RichEditor
              label="Жижиг гарчиг"
              value={settings.heroEyebrow}
              html={settings.heroEyebrowHtml}
              onChange={(text, html) =>
                changeRich('heroEyebrow', text, html)
              }
            />

            <RichEditor
              label="Үндсэн гарчиг"
              value={settings.heroTitle}
              html={settings.heroTitleHtml}
              onChange={(text, html) =>
                changeRich('heroTitle', text, html)
              }
            />

            <RichEditor
              label="Тайлбар"
              value={settings.heroSubtitle}
              html={settings.heroSubtitleHtml}
              onChange={(text, html) =>
                changeRich('heroSubtitle', text, html)
              }
            />
          </section>

          <section className="panel">
            <h2>02. Үсгийн хэмжээ</h2>

            <Field
              label={`Үндсэн гарчиг — ${settings.heroFontSize}px`}
            >
              <input
                type="range"
                min="32"
                max="110"
                value={settings.heroFontSize}
                onChange={e =>
                  change(
                    'heroFontSize',
                    Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field
              label={`Тайлбар — ${settings.heroTextSize}px`}
            >
              <input
                type="range"
                min="12"
                max="28"
                value={settings.heroTextSize}
                onChange={e =>
                  change(
                    'heroTextSize',
                    Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field
              label={`Бусад гарчиг — ${settings.headingFontSize}px`}
            >
              <input
                type="range"
                min="24"
                max="76"
                value={settings.headingFontSize}
                onChange={e =>
                  change(
                    'headingFontSize',
                    Number(e.target.value)
                  )
                }
              />
            </Field>
          </section>

          <section className="panel">
            <h2>03. Өнгө</h2>

            <Field label="Үндсэн цэнхэр">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e =>
                  change('primaryColor', e.target.value)
                }
              />
            </Field>

            <Field label="Hero дэвсгэр">
              <input
                type="color"
                value={settings.heroColor}
                onChange={e =>
                  change('heroColor', e.target.value)
                }
              />
            </Field>
          </section>

          <section className="panel">
            <h2>04. Зураг</h2>

            <Field label="Зураг оруулах">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadImage}
                disabled={uploading}
              />
            </Field>

            {uploading && (
              <p>Зураг оруулж байна...</p>
            )}

            <Field label="Зургийн URL">
              <input
                type="url"
                value={settings.heroImage}
                onChange={e =>
                  change('heroImage', e.target.value)
                }
                placeholder="https://..."
              />
            </Field>

            {settings.heroImage && (
              <img
                className="uploadedImage"
                src={settings.heroImage}
                alt="Hero preview"
              />
            )}

            <button
              type="button"
              className="secondaryButton"
              onClick={() =>
                change('heroImage', '')
              }
            >
              Зургийг тохиргооноос хасах
            </button>
          </section>

          <section className="panel">
            <h2>05. Ticket байрлал</h2>

            <Field
              label={`Дээрээс — ${settings.ticketTop}%`}
            >
              <input
                type="range"
                min="0"
                max="100"
                value={settings.ticketTop}
                onChange={e =>
                  change(
                    'ticketTop',
                    Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field
              label={`Зүүнээс — ${settings.ticketLeft}%`}
            >
              <input
                type="range"
                min="0"
                max="100"
                value={settings.ticketLeft}
                onChange={e =>
                  change(
                    'ticketLeft',
                    Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field
              label={`Хэмжээ — ${settings.ticketScale}`}
            >
              <input
                type="range"
                min="0.3"
                max="1.2"
                step="0.01"
                value={settings.ticketScale}
                onChange={e =>
                  change(
                    'ticketScale',
                    Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field
              label={`Хазайлт — ${settings.ticketRotate}°`}
            >
              <input
                type="range"
                min="-20"
                max="20"
                value={settings.ticketRotate}
                onChange={e =>
                  change(
                    'ticketRotate',
                    Number(e.target.value)
                  )
                }
              />
            </Field>
          </section>

          <div className="saveFooter">
            <button
              type="button"
              className="saveButton"
              onClick={save}
              disabled={saving || uploading}
            >
              {saving
                ? 'Хадгалж байна...'
                : 'Хадгалах'}
            </button>
          </div>
        </div>

        <aside className="previewPanel">
          <div className="previewHeading">
            <h2>Live Preview</h2>
            <p>Зөв хэмжээтэй багасгасан жишээ</p>
          </div>

          <div
            className="heroPreview"
            style={{
              background: settings.heroColor,
            }}
          >
            <div className="previewText">
              <small>
                {settings.heroEyebrow}
              </small>

              <h2
                style={{
                  fontSize: `clamp(24px, ${
                    Number(settings.heroFontSize) *
                    0.45
                  }px, 42px)`,
                }}
              >
                {settings.heroTitle}
              </h2>

              <p
                style={{
                  fontSize: `${Math.max(
                    11,
                    Number(settings.heroTextSize) *
                      0.75
                  )}px`,
                }}
              >
                {settings.heroSubtitle}
              </p>
            </div>

            {settings.heroImage && (
              <img
                className="heroPreviewImage"
                src={settings.heroImage}
                alt=""
              />
            )}

            <div className="ticketArea">
              <div
                className="ticketPreview"
                style={{
                  transform: `rotate(${
                    settings.ticketRotate
                  }deg) scale(${Math.min(
                    1,
                    Math.max(
                      0.5,
                      Number(settings.ticketScale)
                    )
                  )})`,
                }}
              >
                <strong>
                  LEARN <span>✦</span> MINEA
                </strong>

                <small>
                  KOREAN LEARNING · STUDENT PASS
                </small>

                <hr />

                <div>
                  <span>Суралцагч</span>
                  <b>Таны нэр</b>
                </div>

                <div>
                  <span>Сургалт</span>
                  <b>Таны сонголт</b>
                </div>

                <div>
                  <span>Систем</span>
                  <b>Видео + Quiz</b>
                </div>

                <div>
                  <span>Ахиц</span>
                  <b>Progress tracking</b>
                </div>

                <hr />

                <em>START LEARNING →</em>
              </div>
            </div>
          </div>

          <p className="previewNote">
            Энэ бол редакторын багасгасан жишээ.
            Нүүр хуудасны яг ижил rendering биш.
            Бичвэрийн формат нийтэд харагдахын
            тулд нүүр хуудасны код мөн HTML
            форматыг унших шаардлагатай.
          </p>
        </aside>
      </div>

      <style>{`
        .siteEditor {
          --blue: #0879d1;
          --brown: #592d1f;
          background: #f5f7fa;
          color: #202126;
          min-height: 100vh;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .siteEditor * {
          box-sizing: border-box;
        }

        .pageHeading {
          margin-bottom: 25px;
        }

        .pageHeading a {
          color: var(--blue);
          text-decoration: none;
          font-size: 13px;
        }

        .pageHeading h1 {
          font-size: 30px;
          font-weight: 750;
          margin: 12px 0 8px;
        }

        .pageHeading p {
          color: #818793;
          font-size: 13px;
          margin: 0;
        }

        .notice {
          background: #e7f2ff;
          border: 1px solid #b9dbfb;
          padding: 13px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .editorGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .panel,
        .previewPanel {
          background: #fff;
          border: 1px solid #dfe5ed;
          border-radius: 18px;
          padding: 25px;
          min-width: 0;
        }

        .panel h2,
        .previewHeading h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 24px;
        }

        .field,
        .richField {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 23px;
        }

        .field > span,
        .fieldLabel {
          font-size: 13px;
          font-weight: 700;
          color: #25272d;
        }

        .field input:not([type=range]):not([type=color]) {
          width: 100%;
          max-width: 100%;
          border: 1px solid #dfe5ed;
          border-radius: 10px;
          padding: 12px;
          background: white;
          color: #202126;
          font-size: 14px;
        }

        .field input[type=range] {
          width: 100%;
          accent-color: var(--blue);
        }

        .field input[type=color] {
          width: 78px;
          height: 44px;
          padding: 3px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
          background: white;
        }

        .richBox {
          border: 1px solid #cbd0d5;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #e1e4e8;
        }

        .toolbar select {
          background: white;
          border: 0;
          padding: 7px 5px;
          font-size: 13px;
          color: #454545;
          max-width: 145px;
        }

        .toolbar button {
          border: 0;
          background: white;
          min-width: 29px;
          height: 30px;
          padding: 4px;
          border-radius: 5px;
          font-size: 15px;
          cursor: pointer;
          color: #454545;
        }

        .toolbar button:hover {
          background: #e7f2ff;
          color: var(--blue);
        }

        .colorTool {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          width: 30px;
          height: 32px;
          cursor: pointer;
        }

        .colorTool input {
          width: 28px;
          height: 7px;
          border: 0;
          padding: 0;
          cursor: pointer;
        }

        .editableArea {
          min-height: 135px;
          padding: 16px;
          outline: none;
          color: #222;
          font-size: 15px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .editableArea:focus {
          box-shadow:
            inset 0 0 0 2px #b7dafa;
        }

        .editableArea img {
          max-width: 100%;
          height: auto;
        }

        .editableArea a {
          color: var(--blue);
        }

        .uploadedImage {
          display: block;
          width: 100%;
          max-height: 180px;
          object-fit: contain;
          margin-bottom: 15px;
        }

        .secondaryButton {
          border: 0;
          background: #e7f2ff;
          color: var(--blue);
          padding: 11px 14px;
          border-radius: 9px;
          cursor: pointer;
        }

        .saveFooter {
          display: flex;
          justify-content: flex-start;
          padding: 3px 0 30px;
        }

        .saveButton {
          background: #00d67b;
          color: white;
          border: 0;
          padding: 15px 25px;
          border-radius: 11px;
          font-size: 19px;
          font-weight: 750;
          cursor: pointer;
        }

        .saveButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .previewPanel {
          position: sticky;
          top: 20px;
        }

        .previewHeading p,
        .previewNote {
          color: #818793;
          font-size: 12px;
          line-height: 1.6;
        }

        .heroPreview {
          position: relative;
          min-height: 390px;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          padding: 32px;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 18px;
          align-items: center;
        }

        .previewText {
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        .previewText small {
          color: #fff;
          display: block;
          font-size: 9px;
          letter-spacing: 1.3px;
          margin-bottom: 15px;
        }

        .previewText h2 {
          color: #fff;
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.15;
          overflow-wrap: anywhere;
          margin: 0 0 17px;
        }

        .previewText p {
          color: #344d64;
          line-height: 1.6;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .heroPreviewImage {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 35%;
          max-height: 60%;
          object-fit: contain;
          pointer-events: none;
        }

        .ticketArea {
          min-width: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .ticketPreview {
          width: 280px;
          flex-shrink: 0;
          background: white;
          color: #242237;
          border-radius: 14px;
          padding: 23px;
          box-shadow: 0 12px 30px #00000020;
          transform-origin: center;
        }

        .ticketPreview > strong {
          font-size: 22px;
          letter-spacing: -0.8px;
          display: block;
          white-space: nowrap;
        }

        .ticketPreview strong span {
          color: #ff777e;
        }

        .ticketPreview > small {
          display: block;
          font-size: 7px;
          color: #8c8b99;
          letter-spacing: 1.4px;
          margin: 12px 0;
        }

        .ticketPreview hr {
          border: 0;
          border-top: 2px dashed #d9d4e4;
          margin: 16px 0;
        }

        .ticketPreview div {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin: 10px 0;
          font-size: 10px;
        }

        .ticketPreview div span {
          color: #8c8b99;
        }

        .ticketPreview div b {
          text-align: right;
        }

        .ticketPreview em {
          font-size: 11px;
          font-style: normal;
          font-weight: 800;
          color: var(--blue);
        }

        @media (max-width: 1150px) {
          .editorGrid {
            grid-template-columns: 1fr;
          }

          .previewPanel {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .siteEditor {
            padding: 15px;
          }

          .panel,
          .previewPanel {
            padding: 17px;
          }

          .heroPreview {
            grid-template-columns: 1fr;
            padding: 24px;
            gap: 25px;
          }

          .ticketPreview {
            width: 260px;
          }
        }
      `}</style>
    </main>
  )
}
