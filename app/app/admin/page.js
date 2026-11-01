
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function Icon({ name, size = 20 }) {
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
    products: (
      <svg {...common}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
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

    editor: (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
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

    payments: (
      <svg {...common}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h2" />
      </svg>
    ),

    arrow: (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    ),
  }

  return icons[name] || null
}

function StatCard({ title, value, description, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon name={icon} size={18} />
        </div>
        <span className="stat-title">{title}</span>
      </div>

      <div className="stat-value">
        {value === null ? '—' : value}
      </div>

      <div className="stat-description">
        {description}
      </div>
    </article>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()

  const [stats, setStats] = useState({
    students: null,
    courses: null,
    products: null,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          studentsResult,
          coursesResult,
          productsResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student'),

          supabase
            .from('courses')
            .select('*', { count: 'exact', head: true }),

          supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),
        ])

        setStats({
          students: studentsResult.count ?? 0,
          courses: coursesResult.count ?? 0,
          products: productsResult.count ?? 0,
        })
      } catch (error) {
        console.error('Dashboard stats error:', error)
      }
    }

    loadStats()
  }, [])

  const actions = [
    {
      title: 'Номын удирдлага',
      description:
        'Ном нэмэх, хавтасны зураг болон эхний 5–10 хуудасны PDF Preview оруулах.',
      path: '/admin/books',
      icon: 'books',
      featured: true,
    },
    {
      title: 'Сайтын редактор',
      description:
        'Нүүр хуудасны текст, зураг, фонт, өнгө болон ticket-ийн тохиргоо.',
      path: '/admin/editor',
      icon: 'editor',
      featured: true,
    },
    {
      title: 'Бүтээгдэхүүн',
      description:
        'Ном нэмэх, зураг солих, үнэ болон тайлбар засах',
      path: '/admin/products',
      icon: 'products',
    },
    {
      title: 'Сургалт',
      description:
        'Course, module, lesson болон quiz нэмэх',
      path: '/admin/courses',
      icon: 'courses',
    },
    {
      title: 'Сурагчид',
      description:
        'Сурагчийн course access нэмэх, хаах',
      path: '/admin/students',
      icon: 'students',
    },
    {
      title: 'Website Content',
      description:
        'Нүүр хуудасны контент, FAQ засах',
      path: '/admin/content',
      icon: 'content',
    },
    {
      title: 'Email',
      description:
        'Хэрэглэгчдэд announcement болон email илгээх',
      path: '/admin/email',
      icon: 'email',
    },
    {
      title: 'Payments',
      description:
        'Төлбөрийн хүсэлтүүдийг шалгаж, зөвшөөрөх',
      path: '/admin/payments',
      icon: 'payments',
    },
  ]

  return (
    <main className="dashboard-page">
      <div className="dashboard-inner">
        <section className="dashboard-hero">
          <div className="eyebrow">
            ADMIN DASHBOARD
          </div>

          <h1>
            Сайн байна уу <span>👋</span>
          </h1>

          <p>
            Learn Minea сайтын арын удирдлага
          </p>
        </section>

        <section className="stats-grid">
          <StatCard
            title="Students"
            value={stats.students}
            description="Бүртгэлтэй сурагчид"
            icon="students"
          />

          <StatCard
            title="Courses"
            value={stats.courses}
            description="Нийт сургалт"
            icon="courses"
          />

          <StatCard
            title="Products"
            value={stats.products}
            description="Ном, цахим материал"
            icon="products"
          />
        </section>

        <section className="quick-panel">
          <div className="section-eyebrow">
            QUICK ACTIONS
          </div>

          <h2>Хурдан удирдлага</h2>

          <div className="actions-grid">
            {actions.map(action => (
              <button
                key={action.path}
                type="button"
                className={
                  action.featured
                    ? 'action-card featured'
                    : 'action-card'
                }
                onClick={() =>
                  router.push(action.path)
                }
              >
                <div className="action-top">
                  <div className="action-icon">
                    <Icon
                      name={action.icon}
                      size={19}
                    />
                  </div>

                  <div className="action-arrow">
                    <Icon
                      name="arrow"
                      size={17}
                    />
                  </div>
                </div>

                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-page {
          width: 100%;
          min-height: 100%;
          background: #f5f8fc;
        }

        .dashboard-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0;
          padding: 58px 34px 80px 42px;
        }

        .dashboard-hero {
          margin-bottom: 38px;
        }

        .eyebrow,
        .section-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.09em;
          color: #0879d1;
        }

        .dashboard-hero h1 {
          margin: 17px 0 8px;
          font-size: clamp(34px, 4vw, 46px);
          line-height: 1.12;
          letter-spacing: -0.035em;
          font-weight: 500;
          color: #292521;
        }

        .dashboard-hero h1 span {
          font-size: 0.8em;
        }

        .dashboard-hero p {
          margin: 0;
          color: #818793;
          font-size: 17px;
          line-height: 1.6;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 34px;
        }

        .stat-card {
          min-height: 174px;
          padding: 25px 27px;
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #dfe7f0;
          border-radius: 21px;
          box-shadow: 0 7px 24px rgba(0,0,0,0.025);
        }

        .stat-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e7f2ff;
          border-radius: 9px;
          color: #0879d1;
        }

        .stat-title {
          color: #858b95;
          font-size: 14px;
          font-weight: 500;
        }

        .stat-value {
          margin-top: 20px;
          color: #292521;
          font-size: 29px;
          line-height: 1;
          font-weight: 650;
          letter-spacing: -0.03em;
        }

        .stat-description {
          margin-top: auto;
          padding-top: 19px;
          color: #9299a3;
          font-size: 13px;
        }

        .quick-panel {
          width: 100%;
          background: #fff;
          border: 1px solid #dfe7f0;
          border-radius: 22px;
          padding: 31px 34px 35px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.025);
        }

        .quick-panel h2 {
          margin: 10px 0 25px;
          color: #292521;
          font-size: 20px;
          font-weight: 650;
          letter-spacing: -0.02em;
        }

        .actions-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .action-card {
          appearance: none;
          width: 100%;
          min-height: 164px;
          border: 1px solid #e1e7ed;
          border-radius: 17px;
          background: #fff;
          padding: 20px;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .action-card:hover {
          transform: translateY(-2px);
          border-color: #7db7f7;
          background: #f8fbff;
          box-shadow: 0 10px 24px rgba(8,121,209,0.07);
        }

        .action-card.featured {
          background: #f0f7ff;
          border-color: #b9dcff;
        }

        .action-card.featured:hover {
          background: #e7f2ff;
        }

        .action-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .action-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d6e8fa;
          border-radius: 10px;
          background: #e7f2ff;
          color: #0879d1;
        }

        .action-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0879d1;
          opacity: 0;
          transform: translateX(-5px);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
        }

        .action-card:hover .action-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .action-card h3 {
          margin: 0 0 7px;
          color: #292521;
          font-size: 17px;
          line-height: 1.35;
          font-weight: 700;
        }

        .action-card p {
          margin: 0;
          max-width: 250px;
          color: #818793;
          font-size: 13.5px;
          line-height: 1.55;
        }

        @media (max-width: 1100px) {
          .dashboard-inner {
            max-width: 100%;
            padding: 46px 28px 70px;
          }

          .actions-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .dashboard-inner {
            padding: 32px 18px 60px;
          }

          .dashboard-hero {
            margin-bottom: 28px;
          }

          .dashboard-hero h1 {
            font-size: 34px;
          }

          .dashboard-hero p {
            font-size: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .quick-panel {
            border-radius: 18px;
            padding: 24px 18px 25px;
          }

          .actions-grid {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .action-card {
            min-height: 145px;
          }
        }
      `}</style>
    </main>
  )
}
