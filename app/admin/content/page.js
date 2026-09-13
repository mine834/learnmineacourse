'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    setLoading(true)
    setError('')

    const {
      data,
      error,
    } = await supabase
      .from('site_content')
      .select('*')
      .order('content_key')

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

  function updateLocal(id, field, value) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  async function saveItem(item) {
    setSavingId(item.id)

    const { error } = await supabase
      .from('site_content')
      .update({
        title: item.title || null,
        body: item.body || null,
        button_text:
          item.button_text || null,
        button_url:
          item.button_url || null,
        image_url:
          item.image_url || null,
        published: item.published,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', item.id)

    setSavingId(null)

    if (error) {
      alert(error.message)
      return
    }

    alert('Хадгалагдлаа.')
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Content ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              WEBSITE
            </p>

            <h1 style={styles.title}>
              Website Content
            </h1>

            <p style={styles.subtitle}>
              Нүүр хуудасны текст болон
              холбоосуудыг эндээс удирдана.
            </p>
          </div>
        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.list}>
          {items.map((item) => (
            <section
              key={item.id}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.keyLabel}>
                    CONTENT KEY
                  </p>

                  <h2 style={styles.key}>
                    {item.content_key}
                  </h2>
                </div>

                <label style={styles.switchRow}>
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(event) =>
                      updateLocal(
                        item.id,
                        'published',
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    {item.published
                      ? 'Published'
                      : 'Hidden'}
                  </span>
                </label>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Title
                </label>

                <input
                  value={item.title || ''}
                  onChange={(event) =>
                    updateLocal(
                      item.id,
                      'title',
                      event.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Body
                </label>

                <textarea
                  value={item.body || ''}
                  onChange={(event) =>
                    updateLocal(
                      item.id,
                      'body',
                      event.target.value
                    )
                  }
                  rows={5}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Button text
                  </label>

                  <input
                    value={
                      item.button_text || ''
                    }
                    onChange={(event) =>
                      updateLocal(
                        item.id,
                        'button_text',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Button URL
                  </label>

                  <input
                    value={
                      item.button_url || ''
                    }
                    onChange={(event) =>
                      updateLocal(
                        item.id,
                        'button_url',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Image URL
                </label>

                <input
                  value={item.image_url || ''}
                  onChange={(event) =>
                    updateLocal(
                      item.id,
                      'image_url',
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  style={styles.input}
                />
              </div>

              <button
                type="button"
                disabled={
                  savingId === item.id
                }
                onClick={() =>
                  saveItem(item)
                }
                style={styles.saveButton}
              >
                {savingId === item.id
                  ? 'Хадгалж байна...'
                  : 'Хадгалах'}
              </button>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100%',
    background: '#F8F7FF',
    padding: '40px 46px 80px',
  },

  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },

  loading: {
    minHeight: 'calc(100vh - 82px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F7FF',
    color: '#888',
  },

  header: {
    marginBottom: '28px',
  },

  eyebrow: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.6px',
  },

  title: {
    margin: '8px 0 7px',
    color: '#292931',
    fontSize: '38px',
  },

  subtitle: {
    margin: 0,
    color: '#8A8892',
  },

  error: {
    background: '#FFF0F0',
    color: '#B24A4A',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '18px',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    padding: '24px',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    paddingBottom: '20px',
    marginBottom: '20px',
    borderBottom: '1px solid #F0EDF6',
  },

  keyLabel: {
    margin: 0,
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.3px',
  },

  key: {
    margin: '5px 0 0',
    color: '#303038',
    fontSize: '20px',
  },

  switchRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    color: '#6C5CE7',
    fontWeight: '800',
    fontSize: '12px',
  },

  field: {
    marginBottom: '17px',
  },

  label: {
    display: 'block',
    marginBottom: '7px',
    color: '#62606A',
    fontSize: '12px',
    fontWeight: '800',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E2DEEB',
    borderRadius: '11px',
    padding: '12px 13px',
    fontSize: '14px',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E2DEEB',
    borderRadius: '11px',
    padding: '12px 13px',
    fontSize: '14px',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  },

  saveButton: {
    border: 'none',
    borderRadius: '11px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '12px 18px',
    fontWeight: '800',
    cursor: 'pointer',
  },
}