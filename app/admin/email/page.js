'use client'

import {
  useEffect,
  useState,
} from 'react'
import {
  useSearchParams,
} from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AdminEmailPage() {
  const searchParams =
    useSearchParams()

  const emailFromUrl =
    searchParams.get('to') || ''

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [students, setStudents] =
    useState([])

  const [messages, setMessages] =
    useState([])

  const [recipient, setRecipient] =
    useState(emailFromUrl)

  const [subject, setSubject] =
    useState('')

  const [message, setMessage] =
    useState('')

  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {
    await Promise.all([
      loadStudents(),
      loadMessages(),
    ])

    setLoading(false)
  }

  async function loadStudents() {
    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, role'
      )
      .eq('role', 'student')
      .order('email')

    if (error) {
      console.error(error)
      return
    }

    setStudents(data || [])
  }

  async function loadMessages() {
    const {
      data,
      error,
    } = await supabase
      .from('email_messages')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(30)

    if (error) {
      console.error(error)
      return
    }

    setMessages(data || [])
  }

  function validate() {
    if (!recipient.trim()) {
      alert(
        'Хүлээн авагч сонгоно уу.'
      )
      return false
    }

    if (!subject.trim()) {
      alert('Subject оруулна уу.')
      return false
    }

    if (!message.trim()) {
      alert('Message оруулна уу.')
      return false
    }

    return true
  }

  async function saveDraft() {
    if (!validate()) return

    setSaving(true)

    const { error } = await supabase
      .from('email_messages')
      .insert({
        recipient_email:
          recipient.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'draft',
      })

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    await loadMessages()

    alert('Draft хадгалагдлаа.')
  }

  async function sendEmail() {
    if (!validate()) return

    const confirmed =
      window.confirm(
        `${recipient} руу email илгээх үү?`
      )

    if (!confirmed) return

    setSending(true)

    try {
      const {
  data: { session },
} = await supabase.auth.getSession()

if (!session) {
  alert('Session олдсонгүй.')
  return
}

const response = await fetch(
  '/api/send-email',
  {
    method: 'POST',

    headers: {
      'Content-Type':
        'application/json',

      Authorization:
        `Bearer ${session.access_token}`,
    },

    body: JSON.stringify({
      to: recipient.trim(),
      subject: subject.trim(),
      message: message.trim(),
    }),
  }
)

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Email илгээж чадсангүй.'
        )
      }

      const {
        error: saveError,
      } = await supabase
        .from('email_messages')
        .insert({
          recipient_email:
            recipient.trim(),
          subject:
            subject.trim(),
          message:
            message.trim(),
          status: 'sent',
        })

      if (saveError) {
        console.error(saveError)
      }

      setRecipient('')
      setSubject('')
      setMessage('')

      await loadMessages()

      alert(
        'Email амжилттай илгээгдлээ.'
      )
    } catch (error) {
      alert(error.message)
    } finally {
      setSending(false)
    }
  }

  async function deleteMessage(id) {
    const confirmed =
      window.confirm(
        'Энэ email history-г устгах уу?'
      )

    if (!confirmed) return

    const { error } = await supabase
      .from('email_messages')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadMessages()
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Email ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>
            COMMUNICATION
          </p>

          <h1 style={styles.title}>
            Email
          </h1>

          <p style={styles.subtitle}>
            Сурагчдад email бэлдэх,
            хадгалах болон илгээх.
          </p>
        </header>

        <div style={styles.grid}>
          <section
            style={
              styles.composeCard
            }
          >
            <p style={styles.smallLabel}>
              NEW MESSAGE
            </p>

            <h2 style={styles.cardTitle}>
              Email илгээх
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>
                Хүлээн авагч
              </label>

              <input
  list="student-emails"
  value={recipient}
  onChange={(event) =>
    setRecipient(event.target.value)
  }
  placeholder="Email бичих эсвэл student сонгох"
  style={styles.input}
/>

<datalist id="student-emails">
  {students.map((student) => (
    <option
      key={student.id}
      value={student.email}
    >
      {student.full_name || student.email}
    </option>
  ))}
</datalist>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Subject
              </label>

              <input
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value
                  )
                }
                placeholder="Email subject"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Message
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                rows={14}
                placeholder="Email текст..."
                style={styles.textarea}
              />
            </div>

            <div
              style={styles.actions}
            >
              <button
                type="button"
                onClick={saveDraft}
                disabled={
                  saving ||
                  sending
                }
                style={
                  styles.draftButton
                }
              >
                {saving
                  ? 'Хадгалж байна...'
                  : 'Draft хадгалах'}
              </button>

              <button
                type="button"
                onClick={sendEmail}
                disabled={
                  sending ||
                  saving
                }
                style={
                  styles.sendButton
                }
              >
                {sending
                  ? 'Илгээж байна...'
                  : 'Email илгээх →'}
              </button>
            </div>
          </section>

          <section
            style={
              styles.historyCard
            }
          >
            <div
              style={
                styles.historyHeader
              }
            >
              <div>
                <p
                  style={
                    styles.smallLabel
                  }
                >
                  HISTORY
                </p>

                <h2
                  style={
                    styles.cardTitle
                  }
                >
                  Emails
                </h2>
              </div>

              <span
                style={
                  styles.countBadge
                }
              >
                {messages.length}
              </span>
            </div>

            {messages.length === 0 ? (
              <div style={styles.empty}>
                Email байхгүй.
              </div>
            ) : (
              <div
                style={
                  styles.messageList
                }
              >
                {messages.map(
                  (item) => (
                    <article
                      key={item.id}
                      style={
                        styles.messageCard
                      }
                    >
                      <div
                        style={
                          styles.messageTop
                        }
                      >
                        <span
                          style={{
                            ...styles.status,
                            ...(item.status ===
                            'sent'
                              ? styles.sentStatus
                              : styles.draftStatus),
                          }}
                        >
                          {item.status ===
                          'sent'
                            ? 'SENT'
                            : 'DRAFT'}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            deleteMessage(
                              item.id
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          Устгах
                        </button>
                      </div>

                      <h3
                        style={
                          styles.messageSubject
                        }
                      >
                        {item.subject}
                      </h3>

                      <p
                        style={
                          styles.recipient
                        }
                      >
                        To:{' '}
                        {
                          item.recipient_email
                        }
                      </p>

                      <p
                        style={
                          styles.preview
                        }
                      >
                        {item.message}
                      </p>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
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
    maxWidth: '1120px',
    margin: '0 auto',
  },

  loading: {
    minHeight: 'calc(100vh - 82px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F7FF',
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
    fontSize: '38px',
    color: '#292931',
  },

  subtitle: {
    margin: 0,
    color: '#8B8993',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) 400px',
    gap: '20px',
    alignItems: 'start',
  },

  composeCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    padding: '24px',
  },

  historyCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    padding: '22px',
  },

  smallLabel: {
    margin: 0,
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.4px',
  },

  cardTitle: {
    margin: '6px 0 20px',
    color: '#303038',
    fontSize: '22px',
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
    background: '#FFFFFF',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E2DEEB',
    borderRadius: '11px',
    padding: '13px',
    fontSize: '14px',
    lineHeight: 1.7,
    resize: 'vertical',
  },

  actions: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '10px',
  },

  draftButton: {
    border: '1px solid #DDD8EA',
    background: '#FFFFFF',
    color: '#67656F',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  sendButton: {
    border: 'none',
    background: '#6C5CE7',
    color: '#FFFFFF',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  historyHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
  },

  countBadge: {
    width: '36px',
    height: '36px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },

  messageCard: {
    border: '1px solid #EEEAF6',
    borderRadius: '14px',
    padding: '15px',
  },

  messageTop: {
    display: 'flex',
    justifyContent:
      'space-between',
  },

  status: {
    borderRadius: '999px',
    padding: '5px 8px',
    fontSize: '9px',
    fontWeight: '900',
  },

  sentStatus: {
    background: '#EAF8EE',
    color: '#218647',
  },

  draftStatus: {
    background: '#F0ECFF',
    color: '#6C5CE7',
  },

  deleteButton: {
    border: 'none',
    background: 'transparent',
    color: '#C45A5A',
    cursor: 'pointer',
  },

  messageSubject: {
    margin: '13px 0 5px',
    fontSize: '15px',
    color: '#33323A',
  },

  recipient: {
    margin: 0,
    fontSize: '11px',
    color: '#96949D',
  },

  preview: {
    margin: '10px 0 0',
    fontSize: '12px',
    color: '#77757F',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    maxHeight: '80px',
    overflow: 'hidden',
  },

  empty: {
    textAlign: 'center',
    color: '#9997A0',
    padding: '35px',
  },
}