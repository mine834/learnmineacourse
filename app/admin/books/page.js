
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const initialForm = {
  title: '',
  description: '',
  price: '',
  is_published: false,
}

export default function AdminBooksPage() {
  const router = useRouter()

  const [books, setBooks] = useState([])
  const [form, setForm] = useState(initialForm)
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('book_previews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setBooks(data || [])
  }, [])

  useEffect(() => {
    let active = true

    async function init() {
      try {
        const { data: { user } } =
          await supabase.auth.getUser()

        if (!user) {
          router.replace('/login')
          return
        }

        const { data: admin, error: roleError } =
          await supabase.rpc('is_admin')

        if (roleError) throw roleError

        if (admin !== true) {
          router.replace('/')
          return
        }

        if (active) await loadBooks()
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => { active = false }
  }, [router, loadBooks])

  async function uploadFile(file, folder) {
    const extension = file.name.split('.').pop().toLowerCase()
    const path = `${folder}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('book-previews')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error

    return path
  }

  async function handleSave(event) {
    event.preventDefault()
    if (saving) return

    try {
      setSaving(true)
      setError('')
      setMessage('')

      if (!form.title.trim()) {
        throw new Error('Номын нэрийг оруулна уу.')
      }

      if (!editingId && !preview) {
        throw new Error('PDF Preview файлаа сонгоно уу.')
      }

      if (preview && preview.type !== 'application/pdf') {
        throw new Error('Зөвхөн PDF файл оруулна уу.')
      }

      if (preview && preview.size > 20 * 1024 * 1024) {
        throw new Error('PDF файл 20 MB-аас бага байх ёстой.')
      }

      if (cover && !['image/jpeg', 'image/png', 'image/webp'].includes(cover.type)) {
        throw new Error('Хавтас JPG, PNG эсвэл WEBP байх ёстой.')
      }

      const current = books.find(book => book.id === editingId)

      let coverUrl = current?.cover_url || null
      let previewPath = current?.preview_path || null

      if (cover) {
        const path = await uploadFile(cover, 'covers')
        coverUrl = supabase.storage
          .from('book-previews')
          .getPublicUrl(path).data.publicUrl
      }

      if (preview) {
        previewPath = await uploadFile(preview, 'previews')
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price === '' ? null : Number(form.price),
        cover_url: coverUrl,
        preview_path: previewPath,
        is_published: form.is_published,
      }

      if (editingId) {
        const { error } = await supabase
          .from('book_previews')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('book_previews')
          .insert(payload)

        if (error) throw error
      }

      setForm(initialForm)
      setCover(null)
      setPreview(null)
      setEditingId(null)
      setMessage('Ном амжилттай хадгалагдлаа.')
      await loadBooks()
    } catch (err) {
      setError(err.message || 'Алдаа гарлаа.')
    } finally {
      setSaving(false)
    }
  }

  function editBook(book) {
    setEditingId(book.id)
    setForm({
      title: book.title || '',
      description: book.description || '',
      price: book.price ?? '',
      is_published: book.is_published,
    })
    setCover(null)
    setPreview(null)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function togglePublish(book) {
    const { error } = await supabase
      .from('book_previews')
      .update({ is_published: !book.is_published })
      .eq('id', book.id)

    if (error) {
      setError(error.message)
      return
    }

    await loadBooks()
  }

  if (loading) return <main className="wrap">Ачаалж байна...</main>

  return (
    <main className="wrap">
      <div className="eyebrow">LEARN·MINEA / ADMIN</div>
      <h1>Номын удирдлага</h1>
      <p className="subtitle">
        Номын хавтас, тайлбар болон эхний 5–10 хуудастай
        PDF Preview байршуулна.
      </p>

      <div className="layout">
        <form className="panel" onSubmit={handleSave}>
          <h2>{editingId ? 'Ном засах' : 'Шинэ ном нэмэх'}</h2>

          <label>Номын нэр</label>
          <input
            value={form.title}
            onChange={e => setForm({
              ...form, title: e.target.value
            })}
            required
            placeholder="Жишээ: TOPIK Vocabulary"
          />

          <label>Тайлбар</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={e => setForm({
              ...form, description: e.target.value
            })}
            placeholder="Номын тухай..."
          />

          <label>Үнэ (₮) — заавал биш</label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={e => setForm({
              ...form, price: e.target.value
            })}
          />

          <label>Номын хавтас</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={e => setCover(e.target.files?.[0] || null)}
          />

          <label>PDF Preview (эхний 5–10 хуудас)</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={e => setPreview(e.target.files?.[0] || null)}
          />

          <p className="hint">
            Бүтэн ном биш, зөвхөн preview PDF оруулна.
            Файлын хэмжээ 20 MB-аас бага байна.
          </p>

          <label className="check">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm({
                ...form, is_published: e.target.checked
              })}
            />
            Сайт дээр нийтлэх
          </label>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button disabled={saving} className="primary">
            {saving ? 'Хадгалж байна...' : 'Ном хадгалах →'}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                setEditingId(null)
                setForm(initialForm)
                setCover(null)
                setPreview(null)
              }}
            >
              Болих
            </button>
          )}
        </form>

        <section className="panel">
          <h2>Номын жагсаалт ({books.length})</h2>

          {books.length === 0 && <p>Ном нэмэгдээгүй байна.</p>}

          {books.map(book => (
            <div className="book-row" key={book.id}>
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} />
              ) : (
                <div className="no-cover">📖</div>
              )}

              <div className="book-info">
                <strong>{book.title}</strong>
                <span>
                  {book.is_published ? '● Нийтлэгдсэн' : '○ Ноорог'}
                </span>
                <div className="row-actions">
                  <button onClick={() => editBook(book)}>
                    Засах
                  </button>
                  <button onClick={() => togglePublish(book)}>
                    {book.is_published ? 'Нуух' : 'Нийтлэх'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <style jsx>{`
        .wrap {
          max-width: 1180px;
          padding: 36px 28px 80px;
          color: #292535;
        }
        .eyebrow {
          color: #0879D1;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        h1 { font-size: 34px; margin: 12px 0; }
        h2 { font-size: 20px; margin: 0 0 24px; }
        .subtitle { color: #888391; margin-bottom: 30px; }
        .layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        .panel {
          background: white;
          border: 1px solid #e9e5f2;
          border-radius: 22px;
          padding: 26px;
        }
        label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          margin: 18px 0 8px;
        }
        input:not([type="checkbox"]), textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e4dff0;
          border-radius: 11px;
          padding: 13px;
          background: #fcfbff;
          font: inherit;
        }
        .hint {
          font-size: 12px;
          color: #928b9f;
          line-height: 1.6;
        }
        .check {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .check input { width: 17px; height: 17px; }
        .primary {
          width: 100%;
          padding: 15px;
          border: 0;
          border-radius: 12px;
          background: #0879D1;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }
        .cancel {
          margin-top: 10px;
          width: 100%;
          border: 0;
          background: transparent;
          padding: 12px;
          cursor: pointer;
        }
        .error, .success {
          padding: 13px;
          border-radius: 10px;
          margin: 15px 0;
          font-size: 13px;
        }
        .error { background: #fff0f1; color: #b54751; }
        .success { background: #e9f8ee; color: #277a49; }
        .book-row {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #eeeaf5;
        }
        .book-row img, .no-cover {
          width: 72px;
          height: 96px;
          object-fit: cover;
          border-radius: 8px;
          background: #f1edff;
        }
        .no-cover {
          display: grid;
          place-items: center;
          font-size: 25px;
        }
        .book-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .book-info strong { overflow-wrap: anywhere; }
        .book-info span {
          font-size: 12px;
          color: #8a8298;
        }
        .row-actions {
          display: flex;
          gap: 12px;
        }
        .row-actions button {
          border: 0;
          background: transparent;
          color: #0879D1;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          padding: 0;
        }
        @media (max-width: 850px) {
          .layout { grid-template-columns: 1fr; }
          .wrap { padding: 24px 16px 60px; }
        }
      `}</style>
    </main>
  )
}
