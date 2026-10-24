'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  {
    title: 'ҮНДСЭН',
    items: [
      { name: 'Хянах самбар', href: '/admin', icon: '▦' },
      { name: 'Номын удирдлага', href: '/admin/books', icon: '▤' },
      { name: 'Сайтын редактор', href: '/admin/editor', icon: '✎' },
      { name: 'Судалгаа', href: '/admin/survey', icon: '☷' },
    ],
  },
  {
    title: 'БУСАД УДИРДЛАГА',
    items: [
      { name: 'Бүтээгдэхүүн', href: '/admin/products', icon: '⬡' },
      { name: 'Сургалт', href: '/admin/courses', icon: '▱' },
      { name: 'Сурагчид', href: '/admin/students', icon: '♙' },
      { name: 'Төлбөр', href: '/admin/payments', icon: '▣' },
      { name: 'Контент', href: '/admin/content', icon: '✎' },
      { name: 'Email', href: '/admin/email', icon: '✉' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="minea-sidebar">
      <Link href="/admin" className="minea-logo">
        <span className="minea-logo-icon">M</span>
        <span>LEARN·MINEA</span>
      </Link>

      <nav className="minea-navigation">
        {menu.map(group => (
          <div className="minea-menu-group" key={group.title}>
            <p className="minea-group-title">{group.title}</p>

            {group.items.map(item => {
              const active =
                pathname === item.href ||
                (item.href !== '/admin' &&
                  pathname.startsWith(item.href + '/'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`minea-menu-item ${active ? 'active' : ''}`}
                >
                  <span className="minea-menu-icon">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="minea-sidebar-bottom">
        <Link href="/" className="minea-menu-item">
          <span className="minea-menu-icon">↗</span>
          <span>Сайт руу буцах</span>
        </Link>
      </div>

      <style jsx global>{`
        .minea-sidebar {
          width: 260px;
          flex: 0 0 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e3eaf2;
          overflow-y: auto;
        }

        .minea-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 28px 22px;
          text-decoration: none;
          color: #592d1f;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.02em;
        }

        .minea-logo-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0879d1;
          color: white;
          border-radius: 11px;
          font-size: 20px;
        }

        .minea-navigation {
          flex: 1;
          padding: 8px 13px;
        }

        .minea-menu-group {
          margin-bottom: 25px;
        }

        .minea-group-title {
          padding: 0 13px;
          margin: 10px 0 12px;
          color: #93a4bd;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .minea-menu-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 13px;
          margin-bottom: 4px;
          border-radius: 10px;
          text-decoration: none;
          color: #7186a6;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s, color 0.2s;
        }

        .minea-menu-item:hover {
          background: #f0f7ff;
          color: #0879d1;
        }

        .minea-menu-item.active {
          background: #e7f2ff;
          color: #0879d1;
          font-weight: 750;
        }

        .minea-menu-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          font-size: 21px;
          flex-shrink: 0;
        }

        .minea-sidebar-bottom {
          padding: 14px 13px 20px;
          border-top: 1px solid #e3eaf2;
        }

        @media (max-width: 760px) {
          .minea-sidebar {
            width: 210px;
            flex-basis: 210px;
          }

          .minea-logo {
            padding: 20px 12px;
            font-size: 12px;
          }

          .minea-menu-item {
            font-size: 12px;
            gap: 8px;
          }
        }
      `}</style>
    </aside>
  )
}