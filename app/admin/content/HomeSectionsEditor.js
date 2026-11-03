
'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TopikInfoSection, GksInfoSection } from '../../components/InfoSections'
import {
  HOME_CONTENT_KEY,
  normalizeHomeContent,
  parseHomeContent,
  localizeHomeContent,
  safeImageUrl,
} from '../../lib/homeContent.mjs'

const BUCKET = 'site-images'

const sections = [
  {
    key: 'hero',
    title: 'Эхний нүүр / Hero',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг', true],
      ['body', 'Тайлбар', true],
      ['search_placeholder', 'Хайлтын placeholder'],
      ['search_button', 'Хайлтын товч'],
    ],
  },
  {
    key: 'study',
    title: 'Өнөөдөр юу сурах вэ?',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
      ['body', 'Тайлбар', true],
    ],
    collection: 'cards',
  },
  {
    key: 'topikInfo',
    title: 'TOPIK · 2 мэдээллийн карт',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'], ['title', 'Гарчиг'], ['body', 'Тайлбар', true],
      ['card1_symbol', '1-р картын тэмдэг'], ['card1_title', '1-р картын гарчиг'],
      ['card1_body', '1-р картын тайлбар', true], ['card1_link_text', '1-р картын холбоосын бичвэр'],
      ['card2_symbol', '2-р картын тэмдэг'], ['card2_title', '2-р картын гарчиг'],
      ['card2_body', '2-р картын тайлбар', true], ['card2_link_text', '2-р картын холбоосын бичвэр'],
    ],
  },
  {
    key: 'gksInfo',
    title: 'GKS · Тэтгэлгийн мэдээлэл',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'], ['title', 'Гарчиг'], ['body', 'Тайлбар', true],
      ['summary', 'Дэлгэрэнгүй хэсгийн гарчиг'],
      ['requirements_title', 'Шаардлагын гарчиг'], ['requirements_body', 'Шаардлагын тайлбар', true],
      ['documents_title', 'Материалын гарчиг'], ['documents_list', 'Материалууд (мөр бүр нэг материал)', true],
      ['tracks_title', 'Материал өгөх замын гарчиг'], ['tracks_body', 'Материал өгөх замын тайлбар', true],
      ['selection_title', 'Шалгаруулалтын гарчиг'], ['selection_body', 'Шалгаруулалтын тайлбар', true],
      ['official_link_text', 'Албан ёсны холбоосын бичвэр'],
      ['more_text', 'Дэлгэрэнгүй товчны бичвэр'],
      ['requirements_list', 'Шаардлагын жагсаалт (мөр бүр нэг)', true],
      ['optional_title', 'Нэмэлт материалын гарчиг'],
      ['optional_list', 'Нэмэлт материалууд (мөр бүр нэг)', true],
      ['documents_note', 'Материалын анхааруулга', true],
      ['preparation_title', 'Бэлтгэлийн картын гарчиг'],
      ['preparation_body', 'Бэлтгэлийн картын тайлбар', true],
      ['apostille_title', 'Нотариат / Апостиль картын гарчиг'],
      ['apostille_body', 'Нотариат / Апостиль картын тайлбар', true],
      ['consultation_text', 'Зөвлөгөө авах товчны бичвэр'],
      ['consultation_url', 'Зөвлөгөө авах товчны холбоос'],

    ],
  },
  {
    key: 'conversation',
    title: 'Өнөөдрийн харилцан яриа',
    fields: [
      ['eyebrow', 'Картын гарчиг'],
      ['korean', 'Солонгос өгүүлбэр'],
      ['translation', 'Орчуулга'],
      ['tip', 'Хэллэгийн тайлбар', true],
      ['side_eyebrow', 'Хажуугийн жижиг гарчиг'],
      ['side_title', 'Хажуугийн том гарчиг'],
      ['side_body', 'Хажуугийн тайлбар', true],
      ['button_text', 'Товчны бичвэр'],
    ],
  },
  {
    key: 'books',
    title: 'Цахим ном',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
      ['body', 'Тайлбар', true],
      ['button_text', 'Товчны бичвэр'],
      ['empty_text', 'Ном байхгүй үеийн бичвэр'],
    ],
  },
  {
    key: 'why',
    title: 'Яагаад LEARNMINEA вэ?',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг', true],
    ],
    collection: 'reasons',
  },
  {
    key: 'lifestyle',
    title: 'Бодит хэрэглээний хэсэг',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
      ['body', 'Тайлбар', true],
    ],
    image: true,
  },
  {
    key: 'testimonials',
    title: 'Суралцагчдын сэтгэгдэл',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
    ],
    collection: 'reviews',
  },
  {
    key: 'registration',
    title: 'Онлайн сургалтын бүртгэл',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
      ['body', 'Тайлбар', true],
      ['button_text', 'Товчны бичвэр'],
    ],
  },
  {
    key: 'faq',
    title: 'Түгээмэл асуулт / FAQ',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
    ],
    collection: 'items',
  },
  {
    key: 'finalCta',
    title: 'Сүүлийн уриалга / CTA',
    fields: [
      ['eyebrow', 'Жижиг гарчиг'],
      ['title', 'Том гарчиг'],
      ['body', 'Тайлбар', true],
      ['button_text', 'Товчны бичвэр'],
    ],
  },
]

const linkSections = {
  conversation: 'button_url',
  books: 'button_url',
  registration: 'button_url',
  finalCta: 'button_url',
}

const footerFields = [
  ['description', 'Логоны доорх тайлбар'],
  ['learn_heading', 'Сурах баганын гарчиг'],
  ['topik', 'TOPIK цэс'],
  ['kdrama', 'K-Drama цэс'],
  ['books', 'Цахим ном цэс'],
  ['site_heading', 'Сайтын баганын гарчиг'],
  ['home', 'Нүүр цэс'],
  ['assessment', 'Сурах арга барил цэс'],
  ['faq', 'Түгээмэл асуулт цэс'],
  ['contact', 'Холбоо барих цэс'],
  ['copyright', 'Copyright'],
  ['rights', 'Эрхийн мэдээлэл'],
]

const inputStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '12px 14px',
  border: '1px solid #dce5f0',
  borderRadius: 10,
  color: '#25354a',
  background: '#fff',
  fontFamily: 'inherit',
  fontSize: 14,
}

const buttonStyle = {
  padding: '11px 16px',
  background: '#eaf4ff',
  color: '#0879d1',
  border: '1px solid #cde2f8',
  borderRadius: 10,
  fontWeight: 800,
  cursor: 'pointer',
}

function Field({ label, value, onChange, multiline, type = 'text' }) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={event => onChange(event.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={event => onChange(event.target.value)}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function MiniPreview({ section, data, availableBooks = [], featuredBookIds = [] }) {
  const value = data[section] || {}
  if (section === 'topikInfo') return <div className="sharedSitePreview"><TopikInfoSection value={value} preview /></div>
  if (section === 'gksInfo') return <div className="sharedSitePreview"><GksInfoSection value={value} preview /></div>
  const [gksExpanded, setGksExpanded] = useState(false)
  const lines = key => String(value[key] || '').split('\n').map(x => x.trim()).filter(Boolean)

  return (
    <div className={`miniPreview mini-${section}`}>
      <div className="miniEyebrow">
        {value.eyebrow || 'LEARNMINEA'}
      </div>

      {section === 'gksInfo' ? (
        <div className="gksPreview">
          <div className="gksPreviewHeader">
            <div className="gksPreviewText">
              <div className="gksPreviewEyebrow">{value.eyebrow || 'GLOBAL KOREA SCHOLARSHIP'}</div>
              <h3>{value.title}</h3>
              {value.body && <p>{value.body}</p>}
            </div>
            <button type="button" className="gksPreviewToggle" onClick={() => setGksExpanded(v => !v)} aria-expanded={gksExpanded}>
              {value.more_text || 'Дэлгэрэнгүй'} {gksExpanded ? '↑' : '↓'}
            </button>
          </div>
          {gksExpanded && (
            <div className="gksPreviewDetails">
              <h4>{value.requirements_title}</h4>
              {value.requirements_body && <p>{value.requirements_body}</p>}
              {lines('requirements_list').length > 0 && <ul>{lines('requirements_list').map((line, i) => <li key={i}>{line}</li>)}</ul>}
              <h4>{value.documents_title}</h4>
              <ul className="gksPreviewColumns">{lines('documents_list').map((line, i) => <li key={i}>{line}</li>)}</ul>
              {lines('optional_list').length > 0 && <><h4>{value.optional_title}</h4><ul className="gksPreviewColumns">{lines('optional_list').map((line, i) => <li key={i}>{line}</li>)}</ul></>}
              {value.documents_note && <p className="gksPreviewNote">{value.documents_note}</p>}
              <div className="gksPreviewCards">
                {[
                  ['tracks_title', 'tracks_body'],
                  ['selection_title', 'selection_body'],
                  ['preparation_title', 'preparation_body'],
                  ['apostille_title', 'apostille_body'],
                ].map(([title, body]) => <div key={title}><h4>{value[title]}</h4><p>{value[body]}</p></div>)}
              </div>
              {value.consultation_text && <div className="gksPreviewConsult">{value.consultation_text}</div>}
            </div>
          )}
        </div>
      ) : section === 'conversation' ? (
        <div className="miniConversation">
          <div className="miniTalk">
            <span>▶</span>
            <h3 lang="ko">{value.korean}</h3>
            <p>{value.translation}</p>
            <small>{value.tip}</small>
          </div>
          <div>
            <div className="miniEyebrow">
              {value.side_eyebrow}
            </div>
            <h3>{value.side_title}</h3>
            <p>{value.side_body}</p>
            <strong>{value.button_text}</strong>
          </div>
        </div>
      ) : (
        <>
          <h3>{value.title}</h3>
          {value.body && <p>{value.body}</p>}
        </>
      )}

      {section === 'hero' && (
        <div className="miniSearch">
          <span>{value.search_placeholder}</span>
          <strong>{value.search_button}</strong>
        </div>
      )}

      {section === 'topikInfo' && (
        <div className="miniGrid">
          {[1, 2].map(n => <div className="miniTile" key={n}>
            <b>{value[`card${n}_symbol`]}</b>
            <strong>{value[`card${n}_title`]}</strong>
            <small>{value[`card${n}_body`]}</small>
          </div>)}
        </div>
      )}
      {section === 'study' && (
        <div className="miniGrid">
          {(value.cards || []).map((item, index) => (
            <div className="miniTile" key={index}>
              <b>{item.symbol}</b>
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </div>
          ))}
        </div>
      )}

      {section === 'books' && (
        <div className="miniGrid">
          {[0, 1, 2, 3].map(index => {
            const ids = featuredBookIds
            const book = availableBooks.find(
              item => String(item.id) === String(ids[index] || '')
            )

            return (
              <div className="miniBook" key={index}
                style={{
                  background: book?.image_url ? '#fff' : '#dcecff',
                  overflow: 'hidden',
                  padding: book?.image_url ? 8 : undefined,
                }}
              >
                {book?.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <>
                    <div>LEARNMINEA</div>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {section === 'why' && (
        <div className="miniReasons">
          {(value.reasons || []).map((item, index) => (
            <div key={index}>
              <small>0{index + 1}</small>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      )}

      {section === 'lifestyle' && (
        <>
          {value.image_url ? (
            <img
              src={safeImageUrl(value.image_url)}
              alt="Бодит хэрэглээ"
              className="miniImage"
            />
          ) : (
            <div className="miniScene">
              ☁　✦　CAFE　✦　☁
            </div>
          )}
          <div className="miniTags">
            {(value.tags || []).map((tag, index) => (
              <span key={index}>{tag}</span>
            ))}
          </div>
        </>
      )}

      {section === 'testimonials' && (
        <div className="miniGrid">
          {(value.reviews || [])
            .filter(item => item.published)
            .slice(0, 3)
            .map((item, index) => (
              <div className="miniTile" key={index}>
                <p>“{item.text}”</p>
                <strong>{item.name}</strong>
                <small>{item.caption}</small>
              </div>
            ))}
          {!value.reviews?.some(item => item.published) && (
            <small>Нийтлэгдсэн сэтгэгдэл байхгүй.</small>
          )}
        </div>
      )}

      {section === 'faq' && (
        <div className="miniFaq">
          {(value.items || []).map((item, index) => (
            <div key={index}>
              <strong>{item.question}</strong>
              <span>＋</span>
            </div>
          ))}
        </div>
      )}

      {['registration', 'finalCta', 'books'].includes(section) && (
        <div className="miniButton">
          {value.button_text}
        </div>
      )}
    </div>
  )
}

export default function HomeSectionsEditor({ selectedSection = null }) {
  const [availableBooks, setAvailableBooks] = useState([])
  const [content, setContent] = useState(() =>
    normalizeHomeContent(null)
  )
  const [rowId, setRowId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [language, setLanguage] = useState('MN')
  const [opened, setOpened] = useState({})
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    let active = true
    async function loadAvailableBooks() {
      const { data, error } = await supabase
        .from('products')
        .select('id,title,image_url,published')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Ном ачаалах:', error.message)
      } else if (active) {
        setAvailableBooks(data || [])
      }
    }
    loadAvailableBooks()
    return () => { active = false }
  }, [])

  const localized = useMemo(
    () => localizeHomeContent(content, language),
    [content, language]
  )

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error } = await supabase
        .from('site_content')
        .select('id,body')
        .eq('content_key', HOME_CONTENT_KEY)
        .maybeSingle()

      if (!active) return

      if (error) {
        setLoadError(true)
        setMessage(error.message)
      } else {
        setRowId(data?.id || null)
        setContent(parseHomeContent(data?.body))
      }

      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  function changeFeaturedBook(index, id) {
    setContent(current => {
      const ids = Array.isArray(current.books?.featured_book_ids)
        ? [...current.books.featured_book_ids]
        : ['', '', '', '']

      while (ids.length < 4) ids.push('')
      ids[index] = id

      return {
        ...current,
        books: {
          ...current.books,
          featured_book_ids: ids,
        },
      }
    })
  }

  function change(section, field, value) {
    setContent(current => {
      if (language === 'MN') {
        return {
          ...current,
          [section]: {
            ...current[section],
            [field]: value,
          },
        }
      }

      return {
        ...current,
        translations: {
          ...current.translations,
          [language]: {
            ...current.translations[language],
            [section]: {
              ...current.translations[language]?.[section],
              [field]: value,
            },
          },
        },
      }
    })
  }

  function changeArray(section, field, index, key, value) {
    setContent(current => {
      const original = language === 'MN'
        ? current[section]
        : current.translations[language]?.[section]

      const sourceItems = Array.isArray(original?.[field])
        ? original[field]
        : []

      const baseItems = localized[section]?.[field] || []

      const items = baseItems.map((item, i) => {
        if (i !== index) return item

        if (typeof item === 'string') return value

        return { ...item, [key]: value }
      })

      if (language === 'MN') {
        return {
          ...current,
          [section]: {
            ...current[section],
            [field]: items,
          },
        }
      }

      return {
        ...current,
        translations: {
          ...current.translations,
          [language]: {
            ...current.translations[language],
            [section]: {
              ...current.translations[language]?.[section],
              [field]: items.map((item, i) => {
                const existing = sourceItems[i]
                if (typeof item === 'string') return item

                return {
                  ...(existing || {}),
                  ...item,
                }
              }),
            },
          },
        },
      }
    })
  }

  function replaceArray(section, field, items) {
    setContent(current => {
      if (language === 'MN') {
        return {
          ...current,
          [section]: {
            ...current[section],
            [field]: items,
          },
        }
      }

      return {
        ...current,
        translations: {
          ...current.translations,
          [language]: {
            ...current.translations[language],
            [section]: {
              ...current.translations[language]?.[section],
              [field]: items,
            },
          },
        },
      }
    })
  }

  function changeFooter(field, value, shared = false) {
    setContent(current => ({
      ...current,
      footer: shared
        ? {
            ...current.footer,
            [field]: value,
          }
        : {
            ...current.footer,
            [language]: {
              ...current.footer[language],
              [field]: value,
            },
          },
    }))
  }

  function toggle(key) {
    setOpened(current => ({
      ...current,
      [key]: !current[key],
    }))
  }

  async function uploadImage(selectedFile) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(
      selectedFile.type
    )) {
      throw new Error('JPG, PNG эсвэл WEBP зураг сонгоно уу.')
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      throw new Error('Зураг 5 MB-аас их байж болохгүй.')
    }

    const extension =
      selectedFile.type === 'image/png'
        ? 'png'
        : selectedFile.type === 'image/webp'
          ? 'webp'
          : 'jpg'

    const path = `home/lifestyle-${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, selectedFile, {
        contentType: selectedFile.type,
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    const url = safeImageUrl(data?.publicUrl)

    if (!url) {
      throw new Error('Зургийн URL үүссэнгүй.')
    }

    return url
  }

  async function save() {
    if (saving || loading || loadError) return

    setSaving(true)
    setMessage('')

    try {
      let next = normalizeHomeContent(content)

      if (file) {
        const imageUrl = await uploadImage(file)

        next = normalizeHomeContent({
          ...next,
          lifestyle: {
            ...next.lifestyle,
            image_url: imageUrl,
          },
        })
      }

      const payload = {
        content_key: HOME_CONTENT_KEY,
        body: JSON.stringify(next),
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
      setContent(next)
      setFile(null)
      setMessage('Амжилттай хадгаллаа. Нүүр хуудсаа refresh хийж шалгаарай.')
    } catch (error) {
      setMessage(`Алдаа: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="editorLoading">Мэдээллийг ачаалж байна...</div>
  }

  return (
    <div className="homeEditor">
      <div className="languageBar">
        <div>
          <strong>Засварлах хэл</strong>
          <p>Хэл солиход тухайн хэлний бичвэр, preview гарна.</p>
        </div>

        <div className="languageButtons">
          {['MN', 'EN', 'KR'].map(item => (
            <button
              type="button"
              key={item}
              className={language === item ? 'active' : ''}
              onClick={() => setLanguage(item)}
            >
              {item === 'KR' ? '한국' : item}
            </button>
          ))}
        </div>
      </div>

      {sections.filter(section => !selectedSection || selectedSection === section.key).map((section, index) => {
        const value = localized[section.key] || {}
        const isOpen = Boolean(opened[section.key])

        return (
          <section className="editorCard" key={section.key}>
            <div className="cardHeader">
              <span className="number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div>
                <h2>{section.title}</h2>
                <p>Сайтын бодит хэсгийн жижиг preview</p>
              </div>

              {['lifestyle', 'testimonials', 'registration'].includes(
                section.key
              ) && (
                <span className="state">
                  {content[section.key].enabled ? 'Идэвхтэй' : 'Нуусан'}
                </span>
              )}
            </div>

            <MiniPreview
              section={section.key}
              data={localized}
              featuredBookIds={content.books?.featured_book_ids || []}
              availableBooks={availableBooks}
            />

            <button
              type="button"
              className="editButton"
              onClick={() => toggle(section.key)}
            >
              {isOpen
                ? 'Засварлах хэсгийг хаах −'
                : 'Бичвэрийг засах +'}
            </button>

            {isOpen && (
              <div className="fields">
                {['lifestyle', 'testimonials', 'registration'].includes(
                  section.key
                ) && (
                  <label className="checkRow">
                    <input
                      type="checkbox"
                      checked={content[section.key].enabled}
                      onChange={event => {
                        setContent(current => ({
                          ...current,
                          [section.key]: {
                            ...current[section.key],
                            enabled: event.target.checked,
                          },
                        }))
                      }}
                    />
                    Сайтад харуулах
                  </label>
                )}

                {section.key === 'books' && language === 'MN' && (
                  <div style={{
                    background: '#fff',
                    border: '1px solid #dce5ef',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}>
                    <h3 style={{ margin: '0 0 8px' }}>
                      Нүүр хуудсанд харуулах 4 ном
                    </h3>
                    <p style={{ color: '#718096', fontSize: 13 }}>
                      Номын удирдлагад нийтлэгдсэн номнуудаас сонгоно.
                    </p>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {[0, 1, 2, 3].map(index => {
                        const ids = content.books?.featured_book_ids || []
                        const selectedId = String(ids[index] || '')
                        const book = availableBooks.find(
                          item => String(item.id) === selectedId
                        )
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: 12,
                            background: '#f8fbff',
                            border: '1px solid #e1e8f0',
                            borderRadius: 12,
                          }}>
                            <div style={{ width: 52, flexShrink: 0 }}>
                              {book?.image_url ? (
                                <img src={book.image_url} alt={book.title}
                                  style={{ width: 52, height: 68, objectFit: 'contain' }} />
                              ) : (
                                <div style={{ padding: 12, background: '#e8eef5' }}>📖</div>
                              )}
                            </div>
                            <label style={{ flex: 1 }}>
                              <span style={{ display: 'block', marginBottom: 6 }}>
                                Ном {index + 1}
                              </span>
                              <select
                                value={selectedId}
                                onChange={event => changeFeaturedBook(index, event.target.value)}
                                style={{ width: '100%', padding: 11, borderRadius: 9 }}
                              >
                                <option value="">Автоматаар сонгох</option>
                                {availableBooks.map(item => (
                                  <option key={item.id} value={String(item.id)}>
                                    {item.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {section.fields.map(([key, label, multiline]) => (
                  <Field
                    key={key}
                    label={label}
                    value={value[key]}
                    multiline={Boolean(multiline)}
                    onChange={text =>
                      change(section.key, key, text)
                    }
                  />
                ))}

                {linkSections[section.key] && (
                  <Field
                    label="Товчны холбоос"
                    value={content[section.key]?.button_url}
                    onChange={text => {
                      setContent(current => ({
                        ...current,
                        [section.key]: {
                          ...current[section.key],
                          button_url: text,
                        },
                      }))
                    }}
                  />
                )}

                {section.collection === 'cards' && (
                  <div className="nested">
                    <h3>Сурах 4 карт</h3>
                    {(value.cards || []).map((item, itemIndex) => (
                      <div className="nestedItem" key={itemIndex}>
                        <strong>Карт {itemIndex + 1}</strong>

                        {language === 'MN' && (
                          <>
                            <Field
                              label="Тэмдэг"
                              value={item.symbol}
                              onChange={text =>
                                changeArray('study', 'cards', itemIndex, 'symbol', text)
                              }
                            />
                            <Field
                              label="Холбоос"
                              value={item.url}
                              onChange={text =>
                                changeArray('study', 'cards', itemIndex, 'url', text)
                              }
                            />
                          </>
                        )}

                        <Field
                          label="Гарчиг"
                          value={item.title}
                          onChange={text =>
                            changeArray('study', 'cards', itemIndex, 'title', text)
                          }
                        />
                        <Field
                          label="Тайлбар"
                          value={item.body}
                          onChange={text =>
                            changeArray('study', 'cards', itemIndex, 'body', text)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {section.collection === 'reasons' && (
                  <div className="nested">
                    <h3>Давуу талууд</h3>
                    {(value.reasons || []).map((item, itemIndex) => (
                      <div className="nestedItem" key={itemIndex}>
                        <strong>Шалтгаан {itemIndex + 1}</strong>
                        <Field
                          label="Гарчиг"
                          value={item.title}
                          onChange={text =>
                            changeArray('why', 'reasons', itemIndex, 'title', text)
                          }
                        />
                        <Field
                          label="Тайлбар"
                          value={item.body}
                          multiline
                          onChange={text =>
                            changeArray('why', 'reasons', itemIndex, 'body', text)
                          }
                        />
                        <button
                          type="button"
                          className="smallButton"
                          onClick={() =>
                            replaceArray(
                              'why',
                              'reasons',
                              value.reasons.filter((_, i) => i !== itemIndex)
                            )
                          }
                        >
                          Устгах
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="smallButton"
                      onClick={() =>
                        replaceArray('why', 'reasons', [
                          ...(value.reasons || []),
                          { title: '', body: '' },
                        ])
                      }
                    >
                      + Шалтгаан нэмэх
                    </button>
                  </div>
                )}

                {section.collection === 'items' && (
                  <div className="nested">
                    <h3>Асуулт, хариултууд</h3>
                    {(value.items || []).map((item, itemIndex) => (
                      <div className="nestedItem" key={itemIndex}>
                        <strong>Асуулт {itemIndex + 1}</strong>
                        <Field
                          label="Асуулт"
                          value={item.question}
                          onChange={text =>
                            changeArray('faq', 'items', itemIndex, 'question', text)
                          }
                        />
                        <Field
                          label="Хариулт"
                          value={item.answer}
                          multiline
                          onChange={text =>
                            changeArray('faq', 'items', itemIndex, 'answer', text)
                          }
                        />
                        <button
                          type="button"
                          className="smallButton"
                          onClick={() =>
                            replaceArray(
                              'faq',
                              'items',
                              value.items.filter((_, i) => i !== itemIndex)
                            )
                          }
                        >
                          Устгах
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="smallButton"
                      onClick={() =>
                        replaceArray('faq', 'items', [
                          ...(value.items || []),
                          { question: '', answer: '' },
                        ])
                      }
                    >
                      + Асуулт нэмэх
                    </button>
                  </div>
                )}

                {section.image && (
                  <div className="imageSettings">
                    <h3>Зургийн тохиргоо</h3>
                    <p>JPG, PNG, WEBP · 5 MB хүртэл</p>

                    {language === 'MN' && (
                      <>
                        <label className="uploadButton">
                          <span>↑ Зураг сонгох</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={event => {
                              const selected = event.target.files?.[0] || null
                              if (selected && selected.size > 5 * 1024 * 1024) {
                                setMessage('Зураг 5 MB-аас бага байх ёстой.')
                                event.target.value = ''
                                return
                              }
                              setFile(selected)
                            }}
                          />
                        </label>

                        {(previewUrl || value.image_url) && (
                          <div className="imagePreview">
                            <img
                              src={previewUrl || safeImageUrl(value.image_url)}
                              alt="Сонгосон зураг"
                            />
                            {file && <small>{file.name}</small>}
                          </div>
                        )}

                        <Field
                          label="Зургийн URL (сонголттой)"
                          value={content.lifestyle.image_url}
                          onChange={text =>
                            change('lifestyle', 'image_url', text)
                          }
                        />
                      </>
                    )}

                    <Field
                      label="Сэдвийн шошгууд (таслалаар тусгаарлана)"
                      value={(value.tags || []).join(', ')}
                      onChange={text =>
                        change(
                          'lifestyle',
                          'tags',
                          text.split(',').map(item => item.trim())
                        )
                      }
                    />
                  </div>
                )}

                {section.collection === 'reviews' && (
                  <div className="nested">
                    <h3>Суралцагчдын сэтгэгдэл</h3>

                    {(content.testimonials.reviews || []).map(
                      (item, itemIndex) => (
                        <div className="nestedItem" key={item.id}>
                          <strong>Сэтгэгдэл {itemIndex + 1}</strong>
                          <Field
                            label="Нэр"
                            value={item.name}
                            onChange={text => {
                              const items = content.testimonials.reviews.map(
                                (review, i) =>
                                  i === itemIndex
                                    ? { ...review, name: text }
                                    : review
                              )
                              replaceArray('testimonials', 'reviews', items)
                            }}
                          />
                          <Field
                            label="Сэтгэгдэл"
                            value={item.text}
                            multiline
                            onChange={text => {
                              const items = content.testimonials.reviews.map(
                                (review, i) =>
                                  i === itemIndex
                                    ? { ...review, text }
                                    : review
                              )
                              replaceArray('testimonials', 'reviews', items)
                            }}
                          />
                          <Field
                            label="Тайлбар"
                            value={item.caption}
                            onChange={text => {
                              const items = content.testimonials.reviews.map(
                                (review, i) =>
                                  i === itemIndex
                                    ? { ...review, caption: text }
                                    : review
                              )
                              replaceArray('testimonials', 'reviews', items)
                            }}
                          />
                          <label className="checkRow">
                            <input
                              type="checkbox"
                              checked={item.published}
                              onChange={event => {
                                const items = content.testimonials.reviews.map(
                                  (review, i) =>
                                    i === itemIndex
                                      ? { ...review, published: event.target.checked }
                                      : review
                                )
                                replaceArray('testimonials', 'reviews', items)
                              }}
                            />
                            Нийтлэх
                          </label>
                          <button
                            type="button"
                            className="smallButton"
                            onClick={() =>
                              replaceArray(
                                'testimonials',
                                'reviews',
                                content.testimonials.reviews.filter(
                                  (_, i) => i !== itemIndex
                                )
                              )
                            }
                          >
                            Устгах
                          </button>
                        </div>
                      )
                    )}

                    <button
                      type="button"
                      className="smallButton"
                      onClick={() =>
                        replaceArray('testimonials', 'reviews', [
                          ...content.testimonials.reviews,
                          {
                            id: crypto.randomUUID(),
                            name: '',
                            text: '',
                            caption: '',
                            published: false,
                          },
                        ])
                      }
                    >
                      + Сэтгэгдэл нэмэх
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}

      {(!selectedSection || selectedSection === "footer" || selectedSection === "social") && <section className="editorCard">
        <div className="cardHeader">
          <span className="number">11</span>
          <div>
            <h2>{selectedSection === "social" ? "Сошиал хаягууд" : "Footer / Холбоо барих"}</h2>
            <p>Сайтын хамгийн доод хэсэг</p>
          </div>
        </div>

        <div className="miniFooter">
          <div>
            <h3>{content.footer.logo}<span>.</span></h3>
            <p>{content.footer[language]?.description}</p>
            <small>Instagram　 Facebook　✉</small>
          </div>
          <div>
            <strong>{content.footer[language]?.learn_heading}</strong>
            <p>{content.footer[language]?.topik}</p>
            <p>{content.footer[language]?.kdrama}</p>
            <p>{content.footer[language]?.books}</p>
          </div>
          <div>
            <strong>{content.footer[language]?.site_heading}</strong>
            <p>{content.footer[language]?.home}</p>
            <p>{content.footer[language]?.assessment}</p>
            <p>{content.footer[language]?.faq}</p>
            <p>{content.footer[language]?.contact}</p>
          </div>
          <div className="miniCopyright">
            {content.footer[language]?.copyright}
            <span>{content.footer[language]?.rights}</span>
          </div>
        </div>

        <button
          type="button"
          className="editButton"
          onClick={() => toggle('footer')}
        >
          {opened.footer ? 'Засварлах хэсгийг хаах −' : 'Засах +'}
        </button>

        {opened.footer && (
          <div className="fields">
            {language === 'MN' && selectedSection !== 'social' && (
              <>
                <Field
                  label="Лого"
                  value={content.footer.logo}
                  onChange={text => changeFooter('logo', text, true)}
                />
                {(selectedSection === 'footer' || !selectedSection) && (<>
                <Field
                  label="Instagram холбоос"
                  value={content.footer.instagram}
                  onChange={text => changeFooter('instagram', text, true)}
                />
                <Field
                  label="Facebook холбоос"
                  value={content.footer.facebook}
                  onChange={text => changeFooter('facebook', text, true)}
                />
                <Field
                  label="Gmail / И-мэйл хаяг"
                  value={content.footer.email}
                  onChange={text => changeFooter('email', text, true)}
                />
                </>)}
              </>
            )}

            {selectedSection === 'social' && language === 'MN' && (
              <>
                <Field label="Instagram холбоос" value={content.footer.instagram} onChange={text => changeFooter('instagram', text, true)} />
                <Field label="Facebook холбоос" value={content.footer.facebook} onChange={text => changeFooter('facebook', text, true)} />
                <Field label="И-мэйл хаяг" value={content.footer.email} onChange={text => changeFooter('email', text, true)} />
              </>
            )}
            {selectedSection !== 'social' && footerFields.map(([key, label]) => (
              <Field
                key={`${language}-${key}`}
                label={label}
                value={content.footer[language]?.[key]}
                multiline={['description', 'copyright', 'rights'].includes(key)}
                onChange={text => changeFooter(key, text)}
              />
            ))}
          </div>
        )}
      </section>}

      <div className="saveBar">
        <p role="status">
          {message || 'Өөрчлөлтөө хадгалсны дараа нүүр хуудсаа refresh хийнэ.'}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving || loadError}
        >
          {saving ? 'Хадгалж байна...' : 'Бүгдийг хадгалах'}
        </button>
      </div>

      <style jsx global>{`
        /* CONTENT ADMIN TOP SAVE LAYOUT */

        .contentAdmin .contentWrap {
          position: relative;
        }

        .contentAdmin .top {
          position: relative;
          padding-right: 220px;
          min-height: 130px;
        }

        .contentAdmin .top .viewSite {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 190px;
          min-height: 42px;
          padding: 9px 14px;
          border: 1px solid #d6e0ed;
          border-radius: 12px;
          background: #fff;
          color: #243449;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          box-sizing: border-box;
        }

        .contentAdmin .homeEditor .saveBar {
          position: absolute;
          top: 52px;
          right: 0;
          bottom: auto;
          left: auto;
          z-index: 5;
          width: 190px;
          padding: 0;
          margin: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          display: block;
        }

        .contentAdmin .homeEditor .saveBar p {
          display: none;
        }

        .contentAdmin .homeEditor .saveBar button {
          display: block;
          width: 100%;
          min-height: 44px;
          padding: 11px 14px;
          border: 0;
          border-radius: 12px;
          background: #0879d1;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .contentAdmin .homeEditor .saveBar button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .contentAdmin .top {
            padding-right: 0;
            padding-top: 115px;
          }

          .contentAdmin .top .viewSite {
            top: 0;
            right: 0;
            width: 170px;
          }

          .contentAdmin .homeEditor .saveBar {
            top: 52px;
            right: 0;
            width: 170px;
          }
        }

        /* END CONTENT ADMIN TOP SAVE LAYOUT */

        .homeEditor {
          display: grid;
          gap: 18px;
          color: #24364a;
        }

        .languageBar,
        .editorCard,
        .saveBar {
          background: white;
          border: 1px solid #e0e7f0;
          border-radius: 20px;
          padding: 22px;
        }

        .languageBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .languageBar strong {
          font-size: 17px;
        }

        .languageBar p,
        .cardHeader p {
          color: #8490a2;
          font-size: 12px;
          margin: 5px 0 0;
        }

        .languageButtons {
          display: flex;
          gap: 6px;
        }

        .languageButtons button {
          padding: 10px 14px;
          border: 1px solid #dce5f0;
          background: white;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 800;
        }

        .languageButtons button.active {
          background: #0879d1;
          color: white;
          border-color: #0879d1;
        }

        .cardHeader {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 18px;
        }

        .cardHeader h2 {
          margin: 0;
          font-size: 19px;
        }

        .number {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #e9f4ff;
          color: #0879d1;
          font-weight: 900;
          font-size: 12px;
        }

        .state {
          margin-left: auto;
          color: #0879d1;
          font-size: 11px;
          font-weight: 800;
        }

        .miniPreview {
          padding: 25px;
          border-radius: 16px;
          background: #f5f9fe;
          border: 1px solid #e6eef7;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .mini-gksInfo { padding: 0; border: 0; background: transparent; overflow: visible; }
        .mini-gksInfo > .miniEyebrow { display: none; }
        .gksPreview { border: 1px solid #d7e6ff; border-radius: 18px; background: #f4f8ff; overflow: hidden; }
        .gksPreviewHeader { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 24px; }
        .gksPreviewText { min-width: 0; }
        .gksPreviewEyebrow { display: inline-block; padding: 6px 10px; border-radius: 30px; background: #deefff; color: #0879d1; font-size: 10px; font-weight: 800; letter-spacing: .7px; margin-bottom: 12px; }
        .mini-gksInfo .gksPreview h3 { font-family: Georgia, serif; font-size: clamp(21px, 2.4vw, 27px); line-height: 1.25; color: #20232a; margin: 0 0 8px; }
        .mini-gksInfo .gksPreview p { color: #738399; font-size: 12px; line-height: 1.7; margin: 0; white-space: pre-line; }
        .gksPreviewToggle { flex-shrink: 0; background: #fff; color: #0879d1; border: 1px solid #c9dfff; border-radius: 10px; padding: 11px 14px; font-weight: 800; font-size: 12px; cursor: pointer; }
        .gksPreviewDetails { padding: 24px; border-top: 1px solid #dce8fa; background: #f8f9ff; }
        .gksPreviewDetails h4 { font-size: 15px; margin: 18px 0 10px; color: #25354a; }
        .gksPreviewDetails h4:first-child { margin-top: 0; }
        .gksPreviewDetails ul { margin: 0 0 14px; padding-left: 20px; color: #66768b; font-size: 12px; line-height: 1.8; }
        .gksPreviewColumns { columns: 2; column-gap: 25px; }
        .gksPreviewColumns li { break-inside: avoid; }
        .gksPreviewNote { padding: 12px; background: white; border: 1px solid #dce8fa; border-radius: 10px; }
        .gksPreviewCards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
        .gksPreviewCards > div { background: white; border: 1px solid #dce8fa; border-radius: 12px; padding: 15px; }
        .gksPreviewCards h4 { margin-top: 0; }
        .gksPreviewConsult { margin-top: 15px; color: #0879d1; font-size: 12px; font-weight: 800; }
        @media (max-width: 650px) { .gksPreviewHeader { align-items: flex-start; flex-direction: column; } .gksPreviewColumns { columns: 1; } .gksPreviewCards { grid-template-columns: 1fr; } }

        .miniEyebrow {
          color: #0879d1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .miniPreview h3 {
          font-size: clamp(20px, 3vw, 28px);
          line-height: 1.25;
          margin: 0 0 12px;
          white-space: pre-line;
        }

        .miniPreview p {
          font-size: 13px;
          line-height: 1.7;
          margin: 0 0 14px;
          color: #6c7c90;
        }

        .mini-hero {
          background: linear-gradient(135deg, #0879d1, #79b6fa);
          color: white;
          min-height: 190px;
        }

        .mini-hero .miniEyebrow,
        .mini-hero p {
          color: white;
        }

        .miniSearch {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          background: white;
          color: #66768b;
          padding: 12px;
          border-radius: 10px;
          font-size: 12px;
          margin-top: 16px;
        }

        .miniSearch strong {
          color: #0879d1;
        }

        .miniGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-top: 18px;
        }

        .miniTile {
          display: grid;
          gap: 7px;
          background: white;
          border: 1px solid #e1e9f2;
          padding: 13px;
          border-radius: 11px;
        }

        .miniTile b {
          font-size: 21px;
          color: #0879d1;
        }

        .miniTile strong {
          font-size: 12px;
        }

        .miniTile small {
          font-size: 10px;
          color: #8490a2;
          line-height: 1.5;
        }

        .miniConversation {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: center;
        }

        .miniTalk {
          background: white;
          border-radius: 12px;
          padding: 20px;
        }

        .miniTalk span {
          color: #0879d1;
        }

        .miniTalk h3 {
          font-size: 21px;
          margin-top: 10px;
        }

        .miniTalk small {
          display: block;
          background: #eff7ff;
          border-radius: 8px;
          padding: 10px;
          line-height: 1.6;
        }

        .miniBook {
          display: grid;
          place-items: center;
          min-height: 95px;
          border-radius: 8px;
          background: linear-gradient(145deg, #d8e9ff, #8cbef4);
          color: #264b72;
          font-size: 10px;
        }

        .miniBook strong {
          font-size: 25px;
        }

        .miniReasons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .miniReasons > div {
          border-top: 1px solid #d5e0ed;
          padding-top: 12px;
        }

        .miniReasons small {
          color: #0879d1;
          margin-right: 10px;
        }

        .miniReasons strong {
          font-size: 13px;
        }

        .miniReasons p {
          margin: 8px 0 0;
        }

        .miniImage {
          width: 100%;
          max-height: 180px;
          object-fit: cover;
          border-radius: 12px;
        }

        .miniScene {
          background: #dbeeff;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          color: #0879d1;
          letter-spacing: 3px;
        }

        .miniTags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
        }

        .miniTags span {
          padding: 6px 10px;
          border-radius: 20px;
          background: white;
          font-size: 11px;
        }

        .miniFaq {
          display: grid;
          gap: 8px;
        }

        .miniFaq > div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 13px;
          background: white;
          border-radius: 10px;
          font-size: 12px;
        }

        .miniButton {
          display: inline-block;
          background: #0879d1;
          color: white;
          padding: 10px 15px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 800;
        }

        .mini-registration,
        .mini-finalCta {
          background: #191919;
          color: white;
        }

        .mini-registration .miniEyebrow,
        .mini-finalCta .miniEyebrow {
          color: #e6c9bd;
        }

        .mini-registration p,
        .mini-finalCta p {
          color: #a3a3aa;
        }

        .mini-registration .miniButton,
        .mini-finalCta .miniButton {
          background: white;
          color: #191919;
        }

        .editButton,
        .smallButton {
          background: #eaf4ff;
          color: #0879d1;
          border: 1px solid #cde2f8;
          padding: 11px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 800;
        }

        .fields {
          display: grid;
          gap: 16px;
          border-top: 1px solid #e7edf4;
          margin-top: 20px;
          padding-top: 20px;
        }

        .fields :global(.field) {
          display: grid;
          gap: 7px;
          font-size: 13px;
          font-weight: 800;
        }

        .checkRow {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 13px;
          font-weight: 800;
        }

        .nested {
          display: grid;
          gap: 12px;
          margin-top: 10px;
        }

        .nested h3,
        .imageSettings h3 {
          font-size: 16px;
          margin: 0;
        }

        .nestedItem {
          display: grid;
          gap: 13px;
          padding: 18px;
          border-radius: 13px;
          background: #f7faff;
          border: 1px solid #e7eef7;
        }

        .imageSettings {
          display: grid;
          gap: 16px;
          padding: 18px;
          background: #f7faff;
          border-radius: 13px;
        }

        .imageSettings p {
          margin: 0;
          font-size: 12px;
          color: #7b8ba0;
        }

        .uploadButton {
          position: relative;
          display: inline-flex;
          width: fit-content;
          padding: 13px 18px;
          background: #0879d1;
          color: white;
          border-radius: 11px;
          font-weight: 800;
          cursor: pointer;
          overflow: hidden;
        }

        .uploadButton input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .imagePreview img {
          display: block;
          max-width: 100%;
          max-height: 260px;
          border-radius: 12px;
          object-fit: contain;
        }

        .imagePreview small {
          display: block;
          margin-top: 8px;
        }

        .miniFooter {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
          padding: 25px;
          background: #191919;
          color: white;
          border-radius: 15px;
          margin-bottom: 18px;
        }

        .miniFooter h3 {
          margin: 0 0 10px;
          font-size: 23px;
        }

        .miniFooter h3 span {
          color: #0879d1;
        }

        .miniFooter p,
        .miniFooter small {
          color: #a3a3aa;
          font-size: 12px;
          line-height: 1.6;
        }

        .miniFooter strong {
          font-size: 11px;
          letter-spacing: 1px;
        }

        .miniCopyright {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          border-top: 1px solid #454545;
          padding-top: 14px;
          color: #a3a3aa;
          font-size: 10px;
        }

        .saveBar {
          position: sticky;
          bottom: 12px;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          box-shadow: 0 8px 35px rgba(20,40,70,.1);
        }

        .saveBar p {
          margin: 0;
          color: #66768b;
          font-size: 13px;
        }

        .saveBar button {
          background: #0879d1;
          color: white;
          border: 0;
          border-radius: 11px;
          padding: 14px 22px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .saveBar button:disabled {
          opacity: .5;
        }

        .editorLoading {
          padding: 30px;
          background: white;
          border-radius: 15px;
        }

        @media (max-width: 650px) {
          .languageBar,
          .saveBar {
            flex-direction: column;
            align-items: stretch;
          }

          .miniGrid {
            grid-template-columns: 1fr 1fr;
          }

          .miniConversation,
          .miniReasons,
          .miniFooter {
            grid-template-columns: 1fr;
          }

          .miniCopyright {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
