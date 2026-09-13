'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
  },
  {
    label: 'Products',
    href: '/admin/products',
  },
  {
    label: 'Courses',
    href: '/admin/courses',
  },
  {
    label: 'Students',
    href: '/admin/students',
  },
  {
    label: 'Payments',
    href: '/admin/payments',
  },
  {
    label: 'Website Content',
    href: '/admin/content',
  },
  {
    label: 'Email',
    href: '/admin/email',
  },
]

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.replace('/dashboard')
      return
    }

    setEmail(
      profile?.email ||
        session.user.email ||
        ''
    )

    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function isActive(path) {
    if (path === '/admin') {
      return pathname === '/admin'
    }

    return pathname.startsWith(path)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Admin ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logo}>
            LEARN·MINEA
          </div>

          <div style={styles.adminBadge}>
            ADMIN PANEL
          </div>

          <p style={styles.sectionLabel}>
            MANAGEMENT
          </p>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const active = isActive(
                item.path
              )

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() =>
                    router.push(item.href)
                  }
                  style={{
                    ...styles.navItem,
                    ...(active
                      ? styles.navItemActive
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.iconBox,
                      ...(active
                        ? styles.iconBoxActive
                        : {}),
                    }}
                  >
                    {item.icon}
                  </span>

                  <span style={styles.navText}>
                    {item.label}
                  </span>

                  {active && (
                    <span style={styles.dot}>
                      •
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div style={styles.bottom}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              A
            </div>

            <div style={styles.userInfo}>
              <strong>Admin</strong>
              <span>{email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={styles.logout}
          >
            Гарах
          </button>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <p style={styles.topLabel}>
              ADMIN
            </p>

            <strong style={styles.topTitle}>
              {getPageTitle(pathname)}
            </strong>
          </div>
        </header>

        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

function getPageTitle(pathname) {
  if (pathname === '/admin') {
    return 'Dashboard'
  }

  if (
    pathname.startsWith(
      '/admin/products'
    )
  ) {
    return 'Products'
  }

  if (
    pathname.startsWith(
      '/admin/courses'
    )
  ) {
    return 'Courses'
  }

  if (
    pathname.startsWith(
      '/admin/students'
    )
  ) {
    return 'Students'
  }

  if (
    pathname.startsWith(
      '/admin/content'
    )
  ) {
    return 'Website Content'
  }

  if (
    pathname.startsWith(
      '/admin/email'
    )
  ) {
    return 'Email'
  }

  return 'Admin'
}

const styles = {
  shell: {
    minHeight: '100vh',
    background: '#F8F7FF',
  },

  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F7FF',
    color: '#777',
  },

  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '270px',
    background: '#FFFFFF',
    borderRight: '1px solid #ECE8F7',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 20,
  },

  logo: {
    color: '#6C5CE7',
    fontWeight: '900',
    letterSpacing: '1.7px',
    fontSize: '18px',
    padding: '4px 8px',
  },

  adminBadge: {
    display: 'inline-block',
    margin: '14px 8px 28px',
    background: '#EFEAFF',
    color: '#6C5CE7',
    borderRadius: '999px',
    padding: '7px 10px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },

  sectionLabel: {
    margin: '0 8px 12px',
    color: '#AAA8B0',
    fontWeight: '900',
    fontSize: '11px',
    letterSpacing: '1.5px',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  navItem: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    borderRadius: '14px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#6F6D77',
    textAlign: 'left',
  },

  navItemActive: {
    background: '#F0ECFF',
    color: '#6C5CE7',
  },

  iconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: '#F5F3FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    flexShrink: 0,
  },

  iconBoxActive: {
    background: '#6C5CE7',
    color: '#FFFFFF',
  },

  navText: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '800',
  },

  dot: {
    fontSize: '20px',
    color: '#6C5CE7',
  },

  bottom: {
    borderTop: '1px solid #F0EDF6',
    paddingTop: '18px',
  },

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },

  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  userInfo: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    color: '#33323A',
    fontSize: '12px',
  },

  logout: {
    width: '100%',
    border: '1px solid #E9E5F2',
    background: '#FFFFFF',
    color: '#77757F',
    borderRadius: '11px',
    padding: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  main: {
    marginLeft: '270px',
    minHeight: '100vh',
  },

  topbar: {
    height: '82px',
    background: '#FFFFFF',
    borderBottom: '1px solid #ECE8F7',
    display: 'flex',
    alignItems: 'center',
    padding: '0 38px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },

  topLabel: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.5px',
  },

  topTitle: {
    display: 'block',
    marginTop: '4px',
    color: '#292931',
    fontSize: '18px',
  },

  content: {
    minHeight: 'calc(100vh - 82px)',
  },
}