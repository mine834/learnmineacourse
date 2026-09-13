'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    setLoading(true)
    setErrorMessage('')

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('SESSION ERROR:', sessionError)
        setErrorMessage('Session шалгах үед алдаа гарлаа.')
        setLoading(false)
        return
      }

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', currentUser.id)
        .single()

      console.log('CURRENT USER:', currentUser)
      console.log('PROFILE:', profileData)

      if (profileError) {
        console.error('PROFILE ERROR:', profileError)

        setErrorMessage(
          'Profile мэдээлэл олдсонгүй. Supabase profiles table-ээ шалгана уу.'
        )

        setLoading(false)
        return
      }

      if (!profileData) {
        setErrorMessage('Profile мэдээлэл байхгүй байна.')
        setLoading(false)
        return
      }

      setProfile(profileData)

      if (profileData.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Тодорхойгүй алдаа гарлаа.')
      setLoading(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <h2>LEARN·MINEA</h2>
          <p>Admin эрхийг шалгаж байна...</p>
        </div>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <h2>Admin page нээгдсэнгүй</h2>

          <p style={styles.errorText}>{errorMessage}</p>

          <p style={styles.helpText}>
            Supabase → Table Editor → profiles дээр одоо нэвтэрсэн
            хэрэглэгчийн role яг admin байгаа эсэхийг шалгаарай.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard руу буцах
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>LEARN·MINEA</h2>
          <p style={styles.adminBadge}>ADMIN PANEL</p>
        </div>

        <nav style={styles.nav}>
          <button
            style={styles.activeNav}
            onClick={() => router.push('/admin')}
          >
            Dashboard
          </button>

          <button
            style={styles.navButton}
            onClick={() => router.push('/admin/products')}
          >
            Products
          </button>

          <button
            style={styles.navButton}
            onClick={() => router.push('/admin/courses')}
          >
            Courses
          </button>

          <button
            style={styles.navButton}
            onClick={() => router.push('/admin/students')}
          >
            Students
          </button>

          <button
            style={styles.navButton}
            onClick={() => router.push('/admin/content')}
          >
            Website Content
          </button>

          <button
            style={styles.navButton}
            onClick={() => router.push('/admin/email')}
          >
            Email
          </button>
        </nav>

        <div style={styles.sidebarBottom}>
          <p style={styles.adminEmail}>
            {profile?.email || user?.email}
          </p>

          <button style={styles.logoutButton} onClick={logout}>
            Гарах
          </button>
        </div>
      </aside>

      <section style={styles.content}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>ADMIN DASHBOARD</p>

            <h1 style={styles.title}>
              Сайн байна уу{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
            </h1>

            <p style={styles.subtitle}>
              Learn Minea сайтын арын удирдлага
            </p>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Students</p>
            <h2 style={styles.statNumber}>—</h2>
            <p style={styles.statHint}>Бүртгэлтэй сурагчид</p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Courses</p>
            <h2 style={styles.statNumber}>—</h2>
            <p style={styles.statHint}>Нийт сургалт</p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Products</p>
            <h2 style={styles.statNumber}>—</h2>
            <p style={styles.statHint}>Ном, цахим материал</p>
          </div>
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.eyebrow}>QUICK ACTIONS</p>
              <h2 style={styles.panelTitle}>Хурдан удирдлага</h2>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.actionCard}
              onClick={() => router.push('/admin/products')}
            >
              <span style={styles.actionIcon}>📚</span>
              <strong style={styles.actionTitle}>
                Бүтээгдэхүүн
              </strong>
              <span style={styles.actionText}>
                Ном нэмэх, зураг солих, үнэ болон тайлбар засах
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => router.push('/admin/courses')}
            >
              <span style={styles.actionIcon}>🎓</span>
              <strong style={styles.actionTitle}>
                Сургалт
              </strong>
              <span style={styles.actionText}>
                Course, module, lesson болон quiz нэмэх
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => router.push('/admin/students')}
            >
              <span style={styles.actionIcon}>👥</span>
              <strong style={styles.actionTitle}>
                Сурагчид
              </strong>
              <span style={styles.actionText}>
                Сурагчийн course access нээх, хаах
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => router.push('/admin/content')}
            >
              <span style={styles.actionIcon}>✏️</span>
              <strong style={styles.actionTitle}>
                Website Content
              </strong>
              <span style={styles.actionText}>
                Нүүр хуудасны бичвэр, FAQ, testimonial засах
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => router.push('/admin/email')}
            >
              <span style={styles.actionIcon}>✉️</span>
              <strong style={styles.actionTitle}>
                Email
              </strong>
              <span style={styles.actionText}>
                Сурагчдад announcement болон notification явуулах
              </span>
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}

const styles = {
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8f7ff',
    fontFamily: 'Arial, sans-serif',
    padding: '30px',
  },

  loadingCard: {
    background: '#ffffff',
    padding: '35px',
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.07)',
  },

  errorCard: {
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    padding: '35px',
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.07)',
  },

  errorText: {
    color: '#d63031',
    lineHeight: '1.6',
  },

  helpText: {
    color: '#666',
    lineHeight: '1.6',
  },

  primaryButton: {
    marginTop: '15px',
    padding: '13px 20px',
    border: 'none',
    borderRadius: '11px',
    background: '#6c5ce7',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '700',
  },

  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#f8f7ff',
    color: '#20202a',
    fontFamily: 'Arial, sans-serif',
  },

  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '260px',
    padding: '30px 22px',
    boxSizing: 'border-box',
    background: '#191926',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },

  logo: {
    margin: 0,
    fontSize: '20px',
    letterSpacing: '1.5px',
  },

  adminBadge: {
    marginTop: '8px',
    color: '#9f94ff',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '38px',
  },

  navButton: {
    width: '100%',
    textAlign: 'left',
    padding: '13px 14px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: '#ccccd6',
    cursor: 'pointer',
    fontSize: '15px',
  },

  activeNav: {
    width: '100%',
    textAlign: 'left',
    padding: '13px 14px',
    border: 'none',
    borderRadius: '10px',
    background: '#6c5ce7',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
  },

  sidebarBottom: {
    marginTop: 'auto',
  },

  adminEmail: {
    color: '#9999a8',
    fontSize: '12px',
    wordBreak: 'break-all',
  },

  logoutButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #444454',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
  },

  content: {
    marginLeft: '260px',
    width: 'calc(100% - 260px)',
    padding: '48px',
    boxSizing: 'border-box',
  },

  header: {
    maxWidth: '1180px',
    margin: '0 auto 32px',
  },

  eyebrow: {
    color: '#6c5ce7',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  title: {
    margin: '7px 0',
    fontSize: '36px',
  },

  subtitle: {
    margin: 0,
    color: '#777',
  },

  stats: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
  },

  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '18px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
  },

  statLabel: {
    margin: 0,
    color: '#777',
    fontSize: '14px',
  },

  statNumber: {
    margin: '12px 0 7px',
    fontSize: '32px',
  },

  statHint: {
    margin: 0,
    color: '#999',
    fontSize: '12px',
  },

  panel: {
    maxWidth: '1180px',
    margin: '28px auto 0',
    background: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
  },

  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  panelTitle: {
    margin: '5px 0 0',
  },

  actions: {
    marginTop: '22px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },

  actionCard: {
    textAlign: 'left',
    border: '1px solid #eeeeF4',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },

  actionIcon: {
    fontSize: '24px',
  },

  actionTitle: {
    fontSize: '16px',
  },

  actionText: {
    color: '#777',
    lineHeight: '1.5',
    fontSize: '13px',
  },
}