
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function NavIcon({ name, size = 21 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    dashboard: (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),

    books: (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M9 7h7" />
        <path d="M9 11h5" />
      </svg>
    ),

    products: (
      <svg {...common}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),

    courses: (
      <svg {...common}>
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5" />
        <path d="M22 10v6" />
      </svg>
    ),

    students: (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    payments: (
      <svg {...common}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h2" />
      </svg>
    ),

    editor: (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    ),

    survey: (
      <svg {...common}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5" />
        <path d="M9 10h6" />
        <path d="M9 14h6" />
        <path d="M9 18h3" />
      </svg>
    ),

    email: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),

    website: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18" />
        <path d="M12 3a15 15 0 0 0 0 18" />
      </svg>
    ),

    logout: (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </svg>
    ),
  }

  return icons[name] || null
}

const menuGroups = [
  {
    title: 'ҮНДСЭН УДИРДЛАГА',
    items: [
      {
        label: 'Хянах самбар',
        path: '/admin',
        icon: 'dashboard',
      },
      {
        label: 'Номын удирдлага',
        path: '/admin/books',
        icon: 'books',
      },
      {
        label: 'Сайтын редактор',
        path: '/admin/editor',
        icon: 'editor',
      },
      {
        label: 'Судалгаа',
        path: '/admin/survey',
        icon: 'survey',
      },
    ],
  },
  {
    title: 'БУСАД УДИРДЛАГА',
    items: [
      {
        label: 'Бүтээгдэхүүн',
        path: '/admin/products',
        icon: 'products',
      },
      {
        label: 'Сургалт',
        path: '/admin/courses',
        icon: 'courses',
      },
      {
        label: 'Сурагчид',
        path: '/admin/students',
        icon: 'students',
      },
      {
        label: 'Төлбөр',
        path: '/admin/payments',
        icon: 'payments',
      },
      {
        label: 'Website Content',
        path: '/admin/content',
        icon: 'editor',
      },
      {
        label: 'Email',
        path: '/admin/email',
        icon: 'email',
      },
    ],
  },
]

const allItems = menuGroups.flatMap(group => group.items)

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkAdmin() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          router.replace('/login')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (error || profile?.role !== 'admin') {
          router.replace('/dashboard')
          return
        }

        if (mounted) {
          setEmail(session.user.email || '')
          setLoading(false)
        }
      } catch (error) {
        console.error('Admin auth error:', error)
        router.replace('/login')
      }
    }

    checkAdmin()

    return () => {
      mounted = false
    }
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function isActive(path) {
    if (path === '/admin') {
      return pathname === '/admin'
    }

    return (
      pathname === path ||
      pathname?.startsWith(path + '/')
    )
  }

  const currentItem = allItems.find(item =>
    isActive(item.path)
  )

  const pageTitle = currentItem?.label || 'Удирдлага'

  if (loading) {
    return (
      <div className="admin-loading">
        Admin эрхийг шалгаж байна...

        <style jsx>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f8fc;
            color: #7186a6;
            font-size: 14px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button
          type="button"
          className="admin-brand"
          onClick={() => router.push('/admin')}
        >
          <span className="brand-logo">M</span>

          <span className="brand-text">
            <strong>LEARN·MINEA</strong>
            <small>ADMIN PANEL</small>
          </span>
        </button>

        <nav className="admin-navigation">
          {menuGroups.map(group => (
            <section
              className="menu-group"
              key={group.title}
            >
              <div className="menu-heading">
                {group.title}
              </div>

              {group.items.map(item => (
                <button
                  key={item.path}
                  type="button"
                  className={`menu-link ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                  onClick={() => router.push(item.path)}
                >
                  <span className="menu-icon">
                    <NavIcon name={item.icon} size={21} />
                  </span>

                  <span className="menu-label">
                    {item.label}
                  </span>
                </button>
              ))}
            </section>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="menu-link"
            onClick={() => router.push('/')}
          >
            <span className="menu-icon">
              <NavIcon name="website" size={21} />
            </span>

            <span className="menu-label">
              Сайт руу очих
            </span>
          </button>

          <div className="sidebar-user">
            <span className="user-avatar">A</span>

            <span className="user-details">
              <strong>Admin</strong>
              <small title={email}>{email}</small>
            </span>
          </div>

          <button
            type="button"
            className="menu-link logout-link"
            onClick={logout}
          >
            <span className="menu-icon">
              <NavIcon name="logout" size={21} />
            </span>

            <span className="menu-label">
              Гарах
            </span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-title">
            <div className="top-label">
              LEARN·MINEA / ADMIN
            </div>

            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-user">
            <span className="topbar-avatar">A</span>

            <div>
              <strong>Admin</strong>
              <small>{email}</small>
            </div>
          </div>
        </header>

        <main className="admin-page-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-shell {
          min-height: 100vh;
          background: #f5f8fc;
          color: #292521;
        }

        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          width: 260px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e3eaf2;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .admin-brand {
          appearance: none;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 25px 19px 23px;
          border: 0;
          border-bottom: 1px solid #edf1f5;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0879d1;
          color: #ffffff;
          border-radius: 12px;
          font-size: 19px;
          font-weight: 800;
        }

        .brand-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .brand-text strong {
          font-size: 15px;
          letter-spacing: -0.02em;
          color: #592d1f;
          white-space: nowrap;
        }

        .brand-text small {
          font-size: 10px;
          letter-spacing: 0.13em;
          color: #95a5bb;
          font-weight: 700;
        }

        .admin-navigation {
          flex: 1;
          padding: 20px 12px 16px;
        }

        .menu-group {
          margin-bottom: 24px;
        }

        .menu-heading {
          padding: 0 13px;
          margin: 0 0 11px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.075em;
          color: #93a6c0;
        }

        .menu-link {
          appearance: none;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 45px;
          padding: 10px 12px;
          margin-bottom: 4px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #7186a6;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .menu-link:hover {
          background: #f0f7ff;
          color: #0879d1;
        }

        .menu-link.active {
          background: #e7f2ff;
          color: #0879d1;
          font-weight: 750;
        }

        .menu-icon {
          width: 24px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .menu-label {
          flex: 1;
          white-space: nowrap;
        }

        .sidebar-footer {
          padding: 13px 12px 20px;
          border-top: 1px solid #edf1f5;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 12px 2px;
          padding: 12px 8px;
          border-top: 1px solid #edf1f5;
          border-bottom: 1px solid #edf1f5;
        }

        .user-avatar,
        .topbar-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e7f2ff;
          color: #0879d1;
          font-size: 14px;
          font-weight: 800;
        }

        .user-details {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-details strong {
          color: #292521;
          font-size: 13px;
        }

        .user-details small {
          max-width: 170px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #929eae;
          font-size: 11px;
        }

        .logout-link:hover {
          background: #fff1f1;
          color: #d64d57;
        }

        .admin-main {
          margin-left: 260px;
          min-height: 100vh;
          min-width: 0;
        }

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          min-height: 88px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 34px;
          background: #ffffff;
          border-bottom: 1px solid #e3eaf2;
        }

        .top-label {
          margin-bottom: 6px;
          color: #0879d1;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .topbar-title h1 {
          margin: 0;
          color: #292521;
          font-size: 21px;
          line-height: 1.25;
          font-weight: 700;
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .topbar-user > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: right;
        }

        .topbar-user strong {
          color: #292521;
          font-size: 13px;
        }

        .topbar-user small {
          color: #929eae;
          font-size: 11px;
        }

        .admin-page-content {
          width: 100%;
          min-height: calc(100vh - 88px);
          padding: 0;
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            width: 225px;
          }

          .admin-main {
            margin-left: 225px;
          }

          .admin-topbar {
            padding: 16px 22px;
          }

          .menu-link {
            font-size: 13px;
            gap: 9px;
          }
        }

        @media (max-width: 600px) {
          .admin-sidebar {
            width: 190px;
          }

          .admin-main {
            margin-left: 190px;
          }

          .admin-brand {
            padding: 18px 10px;
            gap: 8px;
          }

          .brand-logo {
            width: 34px;
            height: 34px;
          }

          .brand-text strong {
            font-size: 11px;
          }

          .brand-text small {
            font-size: 8px;
          }

          .admin-navigation {
            padding: 15px 7px;
          }

          .menu-heading {
            font-size: 9px;
            padding: 0 8px;
          }

          .menu-link {
            font-size: 11px;
            gap: 7px;
            padding: 9px 7px;
          }

          .menu-icon {
            width: 21px;
          }

          .admin-topbar {
            padding: 12px;
            min-height: 72px;
          }

          .topbar-title h1 {
            font-size: 16px;
          }

          .topbar-user {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
