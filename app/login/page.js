'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkExistingSession()
  }, [])

  async function checkExistingSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setChecking(false)
      return
    }

    await redirectByRole(session.user.id)
  }

  async function redirectByRole(userId) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error(profileError)

      setError(
        'Хэрэглэгчийн мэдээлэл уншиж чадсангүй.'
      )

      setChecking(false)
      setLoading(false)

      return
    }

    if (profile?.role === 'admin') {
      router.replace('/admin')
      return
    }

    router.replace('/dashboard')
  }

  async function handleLogin(event) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const {
      data,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (!data?.user) {
      setError('Нэвтрэхэд алдаа гарлаа.')
      setLoading(false)
      return
    }

    await redirectByRole(data.user.id)
  }

  if (checking) {
    return (
      <div style={styles.loadingPage}>
        Ачаалж байна...
      </div>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brand}>
          LEARN<span style={styles.dot}>·</span>MINEA
        </div>

        <p style={styles.label}>
          WELCOME BACK
        </p>

        <h1 style={styles.title}>
          Нэвтрэх
        </h1>

        <p style={styles.subtitle}>
          Сургалтын системдээ нэвтэрнэ үү.
        </p>

        <form
          onSubmit={handleLogin}
          style={styles.form}
        >
          <div>
            <label style={styles.inputLabel}>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="name@email.com"
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.inputLabel}>
              Нууц үг
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.65 : 1,
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            {loading
              ? 'Нэвтэрч байна...'
              : 'Нэвтрэх →'}
          </button>
        </form>
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8F7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
  },

  loadingPage: {
    minHeight: '100vh',
    background: '#F8F7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888690',
  },

  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#FFFFFF',
    border: '1px solid #EAE6F5',
    borderRadius: '26px',
    padding: '42px',
    boxShadow:
      '0 20px 60px rgba(48, 40, 100, 0.07)',
  },

  brand: {
    fontWeight: '900',
    fontSize: '19px',
    letterSpacing: '-0.5px',
    color: '#24242B',
    marginBottom: '42px',
  },

  dot: {
    color: '#6C5CE7',
  },

  label: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.7px',
  },

  title: {
    margin: '8px 0 8px',
    color: '#27272F',
    fontSize: '38px',
  },

  subtitle: {
    margin: '0 0 30px',
    color: '#8D8B94',
    lineHeight: 1.6,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  inputLabel: {
    display: 'block',
    marginBottom: '7px',
    color: '#62616A',
    fontSize: '12px',
    fontWeight: '800',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E1DDEC',
    borderRadius: '12px',
    padding: '13px 14px',
    outline: 'none',
    fontSize: '14px',
    background: '#FFFFFF',
  },

  button: {
    border: 'none',
    borderRadius: '13px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '14px 18px',
    fontWeight: '800',
    fontSize: '14px',
    marginTop: '3px',
  },

  error: {
    background: '#FFF1F1',
    color: '#B64A4A',
    borderRadius: '11px',
    padding: '12px',
    fontSize: '13px',
  },
}