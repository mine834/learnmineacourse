
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  old_price: '',
  order_url: '',
  image_url: '',
  published: true,
}

const ALLOWED_TAGS = new Set([
  'P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I',
  'U', 'S', 'H1', 'H2', 'H3', 'UL', 'OL',
  'LI', 'BLOCKQUOTE', 'A', 'SPAN'
])

function cleanHTML(html) {
  if (typeof window === 'undefined') return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html || '', 'text/html')

  function cleanNode(node) {
    if (node.nodeType === 3) {
      return document.createTextNode(node.textContent || '')
    }

    if (node.nodeType !== 1) {
      return document.createDocumentFragment()
    }

    const tag = node.tagName

    if (['SCRIPT', 'STYLE', 'IFRAME', 'SVG', 'MATH', 'OBJECT', 'FORM'].includes(tag)) {
      return document.createDocumentFragment()
    }

    const element = ALLOWED_TAGS.has(tag)
      ? document.createElement(tag.toLowerCase())
      : document.createDocumentFragment()

    if (tag === 'A') {
      const href = node.getAttribute('href') || ''
      if (/^(https?:\/\/|mailto:)/i.test(href)) {
        element.setAttribute('href', href)
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }
    }

    if (tag === 'SPAN') {
      const color = node.style.color
      const background = node.style.backgroundColor

      if (/^(#[0-9a-f]{3,8}|rgb[a]?\([\d\s,.%]+\)|[a-z]+)$/i.test(color)) {
        element.style.color = color
      }

      if (/^(#[0-9a-f]{3,8}|rgb[a]?\([\d\s,.%]+\)|[a-z]+)$/i.test(background)) {
        element.style.backgroundColor = background
      }
    }

    Array.from(node.childNodes).forEach(child => {
      element.appendChild(cleanNode(child))
    })

    return element
  }

  const result = document.createElement('div')

  Array.from(doc.body.childNodes).forEach(node => {
    result.appendChild(cleanNode(node))
  })

  return result.innerHTML
}

function ProductDescription({ html }) {
  const [safeHtml, setSafeHtml] = useState('')

  useEffect(() => {
    setSafeHtml(cleanHTML(html))
  }, [html])

  return (
    <div
      className="minea-description"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}

function RichEditor({ value, onChange, editorRef }) {
  const [color, setColor] = useState('#15263f')

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = cleanHTML(value)
    }
  }, [editorRef])

  function sync() {
    if (!editorRef.current) return
    onChange(cleanHTML(editorRef.current.innerHTML))
  }

  function format(command, argument) {
    editorRef.current?.focus()
    document.execCommand(command, false, argument)
    sync()
  }

  function insertLink() {
    const url = window.prompt('Холбоосын хаяг оруулна уу (https://...)')

    if (!url) return

    if (!/^https?:\/\//i.test(url)) {
      alert('Холбоос https:// эсвэл http:// гэж эхлэх ёстой.')
      return
    }

    format('createLink', url)
  }

  function insertEmoji(emoji) {
    format('insertText', emoji)
  }

  function handlePaste(event) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    sync()
  }

  const tool = (label, title, command, argument) => (
    <button
      type="button"
      title={title}
      className="minea-tool"
      onMouseDown={event => event.preventDefault()}
      onClick={() => format(command, argument)}
    >
      {label}
    </button>
  )

  return (
    <div className="minea-rich-editor">
      <div className="minea-toolbar">
        <select
          aria-label="Текстийн төрөл"
          defaultValue="p"
          onChange={event => {
            format('formatBlock', event.target.value)
          }}
        >
          <option value="p">Энгийн текст</option>
          <option value="h1">Гарчиг 1</option>
          <option value="h2">Гарчиг 2</option>
          <option value="h3">Гарчиг 3</option>
          <option value="blockquote">Ишлэл</option>
        </select>

        {tool(<b>B</b>, 'Тод', 'bold')}
        {tool(<i>I</i>, 'Налуу', 'italic')}
        {tool(<u>U</u>, 'Доогуур зураас', 'underline')}
        {tool(<s>S</s>, 'Дундуур зураас', 'strikeThrough')}

        {tool('• Жагсаалт', 'Цэгтэй жагсаалт', 'insertUnorderedList')}
        {tool('1. Жагсаалт', 'Дугаартай жагсаалт', 'insertOrderedList')}

        {tool('≡', 'Зүүн талд', 'justifyLeft')}
        {tool('☰', 'Голлуулах', 'justifyCenter')}
        {tool('≡', 'Баруун талд', 'justifyRight')}

        <button
          type="button"
          className="minea-tool"
          onMouseDown={event => event.preventDefault()}
          onClick={insertLink}
        >
          🔗 Холбоос
        </button>

        <label className="minea-color-tool">
          Өнгө
          <input
            type="color"
            value={color}
            onChange={event => {
              setColor(event.target.value)
              format('foreColor', event.target.value)
            }}
          />
        </label>

        {tool('✕ Формат', 'Формат арилгах', 'removeFormat')}
      </div>

      <div className="minea-emoji-bar">
        <span>Эможи:</span>
        {['📚', '✨', '✅', '📌', '🎯', '💙', '🇰🇷', '➡️'].map(emoji => (
          <button
            key={emoji}
            type="button"
            onMouseDown={event => event.preventDefault()}
            onClick={() => insertEmoji(emoji)}
            title={`Эможи нэмэх ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        className="minea-editor-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Бүтээгдэхүүний тайлбараа энд бичнэ үү..."
        onInput={sync}
        onBlur={sync}
        onPaste={handlePaste}
        role="textbox"
        aria-label="Бүтээгдэхүүний тайлбар"
        aria-multiline="true"
      />
    </div>
  )
}

export default function ProductsAdmin() {
  const router = useRouter()
  const editorRef = useRef(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      await loadProducts()
    } catch (error) {
      alert(error.message || 'Мэдээлэл ачаалахад алдаа гарлаа.')
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    setProducts(data || [])
  }

  function changeForm(event) {
    const { name, value, type, checked } = event.target

    setForm(previous => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function createSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url

    const extension = imageFile.name.split('.').pop()

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)

    if (error) throw error

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function saveProduct(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      alert('Бүтээгдэхүүний нэр оруулна уу.')
      return
    }

    setSaving(true)

    try {
      const imageUrl = await uploadImage()

      const description = editorRef.current
        ? cleanHTML(editorRef.current.innerHTML)
        : cleanHTML(form.description)

      const productData = {
        title: form.title.trim(),
        slug: form.slug.trim() || createSlug(form.title),
        description,
        price: form.price ? Number(form.price) : 0,
        old_price: form.old_price ? Number(form.old_price) : null,
        order_url: form.order_url,
        image_url: imageUrl,
        published: form.published,
      }

      let error

      if (editingId) {
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)

        error = result.error
      } else {
        const result = await supabase
          .from('products')
          .insert(productData)

        error = result.error
      }

      if (error) throw error

      const wasEditing = Boolean(editingId)

      resetForm()
      await loadProducts()

      alert(
        wasEditing
          ? 'Бүтээгдэхүүн шинэчлэгдлээ.'
          : 'Бүтээгдэхүүн нэмэгдлээ.'
      )
    } catch (error) {
      alert(error.message || 'Хадгалахад алдаа гарлаа.')
    } finally {
      setSaving(false)
    }
  }

  function editProduct(product) {
    setEditingId(product.id)

    const nextForm = {
      title: product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price ?? '',
      old_price: product.old_price ?? '',
      order_url: product.order_url || '',
      image_url: product.image_url || '',
      published: product.published ?? true,
    }

    setForm(nextForm)
    setImageFile(null)

    if (editorRef.current) {
      editorRef.current.innerHTML = cleanHTML(nextForm.description)
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteProduct(id) {
    if (!window.confirm('Энэ бүтээгдэхүүнийг устгах уу?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    if (editingId === id) resetForm()

    try {
      await loadProducts()
    } catch (error) {
      alert(error.message)
    }
  }

  function resetForm() {
    setEditingId(null)
    setImageFile(null)
    setForm({ ...EMPTY_FORM })

    if (editorRef.current) {
      editorRef.current.innerHTML = ''
    }
  }

  if (loading) {
    return (
      <main style={styles.center}>
        <p>Уншиж байна...</p>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.top}>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          style={styles.back}
        >
          ← Удирдлагын самбар
        </button>

        <p style={styles.eyebrow}>LEARN·MINEA ADMIN</p>
        <h1 style={styles.title}>Бүтээгдэхүүн</h1>
        <p style={styles.subtitle}>
          Ном, үнэ, зураг болон форматтай тайлбараа эндээс удирдана.
        </p>
      </div>

      <section style={styles.editor}>
        <h2 style={styles.sectionTitle}>
          {editingId
            ? 'Бүтээгдэхүүн засах'
            : '+ Шинэ бүтээгдэхүүн'}
        </h2>

        <form onSubmit={saveProduct}>
          <label style={styles.label}>
            Бүтээгдэхүүний нэр
          </label>

          <input
            style={styles.input}
            name="title"
            value={form.title}
            onChange={changeForm}
            placeholder="Жишээ: TOPIK II тактик"
          />

          <label style={styles.label}>
            Веб хаягийн нэр
          </label>

          <input
            style={styles.input}
            name="slug"
            value={form.slug}
            onChange={changeForm}
            placeholder="Хоосон үлдээвэл автоматаар үүсгэнэ"
          />

          <div style={styles.twoColumns}>
            <div>
              <label style={styles.label}>Үнэ</label>
              <input
                style={styles.input}
                type="number"
                name="price"
                value={form.price}
                onChange={changeForm}
                placeholder="14900"
              />
            </div>

            <div>
              <label style={styles.label}>Хуучин үнэ</label>
              <input
                style={styles.input}
                type="number"
                name="old_price"
                value={form.old_price}
                onChange={changeForm}
                placeholder="34900"
              />
            </div>
          </div>

          <label style={styles.label}>Тайлбар</label>

          <RichEditor
            editorRef={editorRef}
            value={form.description}
            onChange={value =>
              setForm(previous => ({
                ...previous,
                description: value,
              }))
            }
          />

          <label style={styles.label}>Зураг</label>

          {form.image_url && (
            <img
              src={form.image_url}
              alt="Бүтээгдэхүүний зураг"
              style={styles.preview}
            />
          )}

          <input
            style={styles.file}
            type="file"
            accept="image/*"
            onChange={event =>
              setImageFile(event.target.files?.[0] || null)
            }
          />

          {imageFile && (
            <p style={styles.fileName}>
              Сонгосон: {imageFile.name}
            </p>
          )}

          <label style={styles.label}>
            Захиалгын холбоос
          </label>

          <input
            style={styles.input}
            name="order_url"
            value={form.order_url}
            onChange={changeForm}
            placeholder="Google Form эсвэл захиалгын URL"
          />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={changeForm}
            />
            Сайт дээр харуулах
          </label>

          <div style={styles.buttons}>
            <button
              type="submit"
              disabled={saving}
              style={styles.save}
            >
              {saving
                ? 'Хадгалж байна...'
                : editingId
                  ? 'Өөрчлөлт хадгалах'
                  : 'Бүтээгдэхүүн нэмэх'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancel}
              >
                Болих
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.listSection}>
        <h2 style={styles.sectionTitle}>
          Одоогийн бүтээгдэхүүнүүд
        </h2>

        {products.length === 0 ? (
          <div style={styles.empty}>
            Одоогоор бүтээгдэхүүн байхгүй.
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map(product => (
              <article
                key={product.id}
                style={styles.productCard}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.noImage}>
                    Зураггүй
                  </div>
                )}

                <div style={styles.productBody}>
                  <div style={styles.statusRow}>
                    <span
                      style={
                        product.published
                          ? styles.published
                          : styles.hidden
                      }
                    >
                      {product.published
                        ? 'Нийтлэгдсэн'
                        : 'Нууцалсан'}
                    </span>
                  </div>

                  <h3 style={styles.productTitle}>
                    {product.title}
                  </h3>

                  <ProductDescription
                    html={product.description}
                  />

                  <div style={styles.priceRow}>
                    <strong>
                      ₮{Number(
                        product.price || 0
                      ).toLocaleString()}
                    </strong>

                    {product.old_price && (
                      <del style={styles.oldPrice}>
                        ₮{Number(
                          product.old_price
                        ).toLocaleString()}
                      </del>
                    )}
                  </div>

                  <div style={styles.cardButtons}>
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      style={styles.edit}
                    >
                      Засах
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      style={styles.delete}
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`
        .minea-rich-editor {
          width: 100%;
          border: 1px solid #d5dce5;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          margin: 10px 0 28px;
        }

        .minea-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          padding: 12px;
          border-bottom: 1px solid #d5dce5;
          background: #fbfdff;
        }

        .minea-toolbar select {
          border: 1px solid #d5dce5;
          border-radius: 7px;
          padding: 9px;
          background: white;
          color: #20202a;
          font-size: 14px;
        }

        .minea-tool {
          border: 1px solid transparent;
          border-radius: 7px;
          padding: 8px 10px;
          background: transparent;
          color: #253650;
          cursor: pointer;
          font-size: 14px;
          min-height: 36px;
        }

        .minea-tool:hover {
          background: #e7f2ff;
          border-color: #d5e7fa;
        }

        .minea-color-tool {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #253650;
          padding: 5px;
        }

        .minea-color-tool input {
          width: 32px;
          height: 30px;
          cursor: pointer;
          border: 0;
          background: transparent;
        }

        .minea-emoji-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          padding: 8px 14px;
          border-bottom: 1px solid #e6edf5;
          color: #7b8593;
          font-size: 12px;
        }

        .minea-emoji-bar button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 20px;
          padding: 5px;
          border-radius: 6px;
        }

        .minea-emoji-bar button:hover {
          background: #e7f2ff;
        }

        .minea-editor-area {
          min-height: 320px;
          padding: 22px;
          outline: none;
          font-size: 16px;
          line-height: 1.8;
          color: #15263f;
          overflow-wrap: anywhere;
          font-family: Arial, "Apple Color Emoji",
            "Segoe UI Emoji", sans-serif;
        }

        .minea-editor-area:empty::before {
          content: attr(data-placeholder);
          color: #a0a9b6;
          pointer-events: none;
        }

        .minea-editor-area h1,
        .minea-description h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 12px 0;
        }

        .minea-editor-area h2,
        .minea-description h2 {
          font-size: 23px;
          font-weight: 800;
          margin: 10px 0;
        }

        .minea-editor-area h3,
        .minea-description h3 {
          font-size: 19px;
          font-weight: 700;
          margin: 8px 0;
        }

        .minea-editor-area ul,
        .minea-description ul {
          list-style: disc;
          padding-left: 25px;
          margin: 8px 0;
        }

        .minea-editor-area ol,
        .minea-description ol {
          list-style: decimal;
          padding-left: 25px;
          margin: 8px 0;
        }

        .minea-editor-area blockquote,
        .minea-description blockquote {
          border-left: 3px solid #0879d1;
          padding-left: 14px;
          margin: 12px 0;
          color: #64748b;
        }

        .minea-editor-area a,
        .minea-description a {
          color: #0879d1;
          text-decoration: underline;
        }

        .minea-description {
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: anywhere;
          font-family: Arial, "Apple Color Emoji",
            "Segoe UI Emoji", sans-serif;
        }

        .minea-description p {
          margin: 6px 0;
        }

        @media (max-width: 700px) {
          .minea-editor-area {
            min-height: 260px;
            padding: 14px;
          }
        }
      `}</style>
    </main>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7186a6',
  },

  page: {
    minHeight: '100vh',
    background: '#f5f8fc',
    padding: '45px',
    fontFamily: 'Arial, sans-serif',
    color: '#20202a',
  },

  top: {
    maxWidth: '1100px',
    margin: '0 auto 30px',
  },

  back: {
    border: 'none',
    background: 'transparent',
    color: '#0879d1',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '25px',
    fontSize: '14px',
    fontWeight: '600',
  },

  eyebrow: {
    color: '#0879d1',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  title: {
    fontSize: '38px',
    margin: '5px 0',
  },

  subtitle: {
    color: '#777',
    lineHeight: 1.6,
  },

  editor: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'white',
    padding: '32px',
    borderRadius: '22px',
    border: '1px solid #e3eaf2',
  },

  sectionTitle: {
    fontSize: '23px',
    fontWeight: '800',
    margin: '0 0 22px',
  },

  label: {
    display: 'block',
    fontWeight: '700',
    marginTop: '20px',
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #d5dce5',
    borderRadius: '11px',
    fontSize: '15px',
    background: '#ffffff',
    color: '#20202a',
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
  },

  file: {
    display: 'block',
    marginTop: '8px',
    maxWidth: '100%',
  },

  fileName: {
    fontSize: '13px',
    color: '#0879d1',
  },

  preview: {
    width: '140px',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '12px',
    display: 'block',
    marginBottom: '10px',
  },

  checkbox: {
    display: 'flex',
    gap: '10px',
    marginTop: '22px',
    alignItems: 'center',
    cursor: 'pointer',
  },

  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '28px',
  },

  save: {
    border: 'none',
    background: '#0879d1',
    color: 'white',
    padding: '14px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  cancel: {
    border: '1px solid #ddd',
    background: 'white',
    padding: '14px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  listSection: {
    maxWidth: '1100px',
    margin: '40px auto',
  },

  empty: {
    background: 'white',
    padding: '30px',
    borderRadius: '18px',
    color: '#777',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },

  productCard: {
    background: 'white',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid #e3eaf2',
  },

  productImage: {
    width: '100%',
    height: '260px',
    objectFit: 'cover',
  },

  noImage: {
    height: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#edf3fa',
    color: '#888',
  },

  productBody: {
    padding: '20px',
  },

  statusRow: {
    marginBottom: '10px',
  },

  published: {
    background: '#ecfff5',
    color: '#16794b',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  hidden: {
    background: '#f1f1f1',
    color: '#777',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  productTitle: {
    margin: '0 0 12px',
    fontSize: '18px',
    fontWeight: '800',
  },

  priceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginTop: '15px',
  },

  oldPrice: {
    color: '#999',
    fontSize: '13px',
  },

  cardButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '18px',
  },

  edit: {
    flex: 1,
    border: 'none',
    background: '#0879d1',
    color: 'white',
    padding: '10px',
    borderRadius: '9px',
    cursor: 'pointer',
  },

  delete: {
    flex: 1,
    border: '1px solid #ddd',
    background: 'white',
    padding: '10px',
    borderRadius: '9px',
    cursor: 'pointer',
  },
}
