
'use client'

import Link from 'next/link'
import HomeSectionsEditor from './HomeSectionsEditor'

export default function AdminContentPage() {
  return (
    <main className="contentAdmin">
      <div className="contentWrap">
        <div className="top">
          <div>
            <p className="eyebrow">
              LEARN·MINEA / ADMIN
            </p>
            <h1>Нүүр хуудасны удирдлага</h1>
            <p className="description">
              Сайтын хэсэг бүрийг жижиг харагдацаар
              шалгаж, текст, зураг, товч, холбоос болон
              MN / EN / 한국 орчуулгыг засна.
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="viewSite"
          >
            Сайтыг нээх ↗
          </Link>
        </div>

        <div className="info">
          <span>✓</span>
          <p>
            Энд зассан мэдээлэл нүүр хуудсанд
            харагдана. Судалгааны өнгө, хэмжээ болон
            Google Form-ийн тохиргоо
            <Link href="/admin/survey">
              {' '}Судалгаа{' '}
            </Link>
            хэсэгт тусдаа байна.
          </p>
        </div>

        <HomeSectionsEditor />
      </div>

      <style jsx>{`
        .contentAdmin {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 34px 24px 100px;
        }

        .contentWrap {
          max-width: 1100px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .eyebrow {
          color: #0879d1;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.7px;
          margin: 0 0 12px;
        }

        h1 {
          font-size: clamp(27px, 4vw, 38px);
          color: #1d2939;
          margin: 0 0 12px;
        }

        .description {
          color: #718096;
          font-size: 15px;
          line-height: 1.8;
          max-width: 700px;
          margin: 0;
        }

        .viewSite {
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #0879d1;
          color: white;
          text-decoration: none;
          padding: 13px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
        }

        .info {
          display: flex;
          gap: 12px;
          padding: 16px 18px;
          border: 1px solid #d6e8fa;
          border-radius: 14px;
          background: #edf6ff;
          color: #37516c;
          margin-bottom: 24px;
        }

        .info span {
          color: #0879d1;
          font-weight: 900;
        }

        .info p {
          margin: 0;
          line-height: 1.7;
          font-size: 13px;
        }

        .info :global(a) {
          color: #0879d1;
          font-weight: 800;
        }

        @media (max-width: 650px) {
          .contentAdmin {
            padding: 20px 12px 90px;
          }

          .top {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  )
}
