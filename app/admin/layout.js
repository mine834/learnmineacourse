'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function NavIcon({ name, size = 20 }) {
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

    content: (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    ),

    email: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
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

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  const navItems = useMemo(
    () => [
      {
        label: 'Dashboard',
        path: '/admin',
        icon: 'dashboard',
      },
      {
        label: 'Products',
        path: '/admin/products',
        icon: 'products',
      },
      {
        label: 'Courses',
        path: '/admin/courses',
        icon: 'courses',
      },
      {
        label: 'Students',
        path: '/admin/students',
        icon: 'students',
      },
      {
        label: 'Payments',
        path: '/admin/payments',
        icon: 'payments',
      },
      {
        label: 'Website Content',
        path: '/admin/content',
        icon: 'content',
      },
      {
        label: 'Email',
        path: '/admin/email',
        icon: 'email',
      },
    ],
    []
  )

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      router.replace('/login')
      return
    }

    setEmail(session.user.email || '')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (error || profile?.role !== 'admin') {
      router.replace('/dashboard')
      return
    }

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

    return pathname?.startsWith(path)
  }

  function getPageTitle() {
    if (pathname === '/admin') {
      return 'Dashboard'
    }

    if (pathname?.startsWith('/admin/products')) {
      return 'Products'
    }

    if (pathname?.startsWith('/admin/courses')) {
      return 'Courses'
    }

    if (pathname?.startsWith('/admin/students')) {
      return 'Students'
    }

    if (pathname?.startsWith('/admin/payments')) {
      return 'Payments'
    }

    if (pathname?.startsWith('/admin/content')) {
      return 'Website Content'
    }

    if (pathname?.startsWith('/admin/email')) {
      return 'Email'
    }

    return 'Admin'
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Admin эрхийг шалгаж байна...

        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f7ff;
            color: #8b8799;
            font-size: 14px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <button
          type="button"
          className="brand"
          onClick={() => router.push('/admin')}
          aria-label="LEARN MINEA Admin"
        >
          <span className="brand-dot" />
          <span className="brand-letter">M</span>
        </button>

        <nav className="nav">
          {navItems.map((item) => (
            <div
              className="nav-item-wrap"
              key={item.path}
            >
              <button
                type="button"
                className={`nav-button ${
                  isActive(item.path) ? 'active' : ''
                }`}
                onClick={() => router.push(item.path)}
                aria-label={item.label}
              >
                <NavIcon
                  name={item.icon}
                  size={20}
                />
              </button>

              <div className="tooltip">
                {item.label}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">
            A
          </div>

          <div className="nav-item-wrap">
            <button
              type="button"
              className="nav-button logout-button"
              onClick={logout}
              aria-label="Logout"
            >
              <NavIcon
                name="logout"
                size={19}
              />
            </button>

            <div className="tooltip tooltip-bottom">
              Logout
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div>
            <div className="top-label">
              ADMIN
            </div>

            <h1>
              {getPageTitle()}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="admin-info">
              <div className="admin-name">
                Admin
              </div>

              <div className="admin-email">
                {email}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-shell {
          min-height: 100vh;
          background: #f8f7ff;
          color: #292933;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;

          width: 72px;

          z-index: 100;

          display: flex;
          flex-direction: column;
          align-items: center;

          background: #ffffff;

          border-right:
            1px solid
            #ece9f5;

          padding:
            18px
            11px;
        }

        .brand {
          appearance: none;
          width: 44px;
          height: 44px;

          border: 0;
          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          background: #6c5ce7;
          color: white;

          cursor: pointer;

          margin-bottom: 30px;
        }

        .brand-letter {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .brand-dot {
          position: absolute;

          width: 6px;
          height: 6px;

          right: 7px;
          top: 7px;

          border-radius: 999px;

          background: rgba(255, 255, 255, 0.75);
        }

        .nav {
          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 8px;
        }

        .nav-item-wrap {
          width: 100%;

          display: flex;
          justify-content: center;

          position: relative;
        }

        .nav-button {
          appearance: none;

          width: 46px;
          height: 46px;

          flex-shrink: 0;

          border: 0;
          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #9995a8;
          background: transparent;

          cursor: pointer;

          transition:
            background 0.16s ease,
            color 0.16s ease,
            transform 0.16s ease;
        }

        .nav-button:hover {
          background: #f4f2ff;
          color: #6c5ce7;
        }

        .nav-button.active {
          background: #6c5ce7;
          color: #ffffff;

          box-shadow:
            0 8px 20px
            rgba(108, 92, 231, 0.2);
        }

        .tooltip {
          pointer-events: none;

          position: absolute;

          left: 58px;
          top: 50%;

          transform:
            translateY(-50%)
            translateX(-4px);

          white-space: nowrap;

          opacity: 0;
          visibility: hidden;

          background: #28272f;
          color: #ffffff;

          font-size: 12px;
          font-weight: 600;

          padding: 8px 10px;

          border-radius: 8px;

          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.12);

          transition:
            opacity 0.15s ease,
            transform 0.15s ease,
            visibility 0.15s ease;
        }

        .nav-item-wrap:hover
        .tooltip {
          opacity: 1;
          visibility: visible;

          transform:
            translateY(-50%)
            translateX(0);
        }

        .sidebar-bottom {
          margin-top: auto;

          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 11px;
        }

        .admin-avatar {
          width: 36px;
          height: 36px;

          border-radius: 999px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f0edff;
          color: #6c5ce7;

          font-size: 13px;
          font-weight: 800;
        }

        .logout-button {
          color: #aaa6b6;
        }

        .logout-button:hover {
          background: #fff2f3;
          color: #df6671;
        }

        .admin-main {
          margin-left: 72px;
          min-height: 100vh;
        }

        .topbar {
          height: 94px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            0
            34px;

          background: #ffffff;

          border-bottom:
            1px solid
            #ece9f5;

          position: sticky;
          top: 0;
          z-index: 50;
        }

        .top-label {
          margin-bottom: 6px;

          color: #6c5ce7;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.16em;
        }

        .topbar h1 {
          margin: 0;

          font-size: 21px;
          line-height: 1.2;

          font-weight: 700;

          letter-spacing: -0.025em;

          color: #292933;
        }

        .topbar-right {
          display: flex;
          align-items: center;
        }

        .admin-info {
          text-align: right;
        }

        .admin-name {
          color: #34333c;

          font-size: 13px;
          font-weight: 700;
        }

        .admin-email {
          margin-top: 3px;

          color: #aaa7b3;

          font-size: 11px;
        }

        .page-content {
          width: 100%;
          min-height: calc(100vh - 94px);

          /*
            ЭНЭ НЬ ӨМНӨХ ТОМ SIDEBAR-ААС
            CONTENT-ИЙГ ЗҮҮН ТИЙШ ТАТНА.
          */
          padding: 0;
        }

        @media (max-width: 760px) {
          .sidebar {
            position: fixed;

            left: 10px;
            right: 10px;
            bottom: 10px;
            top: auto;

            width: auto;
            height: 64px;

            flex-direction: row;

            justify-content: center;

            padding:
              8px
              10px;

            border:
              1px solid
              #ebe8f5;

            border-radius: 18px;

            box-shadow:
              0 10px 30px
              rgba(50, 40, 100, 0.12);
          }

          .brand {
            display: none;
          }

          .nav {
            width: auto;

            flex-direction: row;

            gap: 3px;

            overflow-x: auto;
          }

          .nav-button {
            width: 42px;
            height: 42px;

            border-radius: 11px;
          }

          .tooltip {
            display: none;
          }

          .sidebar-bottom {
            display: none;
          }

          .admin-main {
            margin-left: 0;

            padding-bottom: 84px;
          }

          .topbar {
            height: 78px;

            padding:
              0
              18px;
          }

          .topbar h1 {
            font-size: 18px;
          }

          .admin-email {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}