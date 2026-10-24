
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function BookDetailPage({ params }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: book, error } = await supabase
    .from('book_previews')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (error || !book) notFound()

  const previewUrl = book.preview_path
    ? supabase.storage
        .from('book-previews')
        .getPublicUrl(book.preview_path).data.publicUrl
    : null

  return (
    <main className="page">
      <header>
        <Link href="/" className="brand">
          LEARN<span>·</span>MINEA
        </Link>
        <Link href="/books" className="back">
          ← Бүх ном
        </Link>
      </header>

      <section className="book-info">
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt={book.title}
            className="cover"
          />
        )}

        <div>
          <div className="eyebrow">BOOK PREVIEW</div>
          <h1>{book.title}</h1>
          <p>{book.description}</p>

          {book.price != null && (
            <strong>
              {Number(book.price).toLocaleString('en-US')}₮
            </strong>
          )}
        </div>
      </section>

      <section className="reader-section">
        <div className="reader-heading">
          <div>
            <div className="eyebrow">READ ONLINE</div>
            <h2>Номын жишээ хуудсууд</h2>
            <p>Эхний 5–10 хуудсыг сайт дотроо уншаарай.</p>
          </div>
        </div>

        {previewUrl ? (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
            title={`${book.title} PDF Preview`}
            className="pdf"
          />
        ) : (
          <div className="empty">
            Энэ номын Preview хараахан нэмэгдээгүй байна.
          </div>
        )}

        <p className="notice">
          PDF Preview нь зөвхөн танилцах зориулалттай.
          Татаж авах товчийг нуусан ч browser-оос
          preview файлыг хадгалах боломжтой.
        </p>
      </section>

      <style>{`
        .page { min-height:100vh; background:#f8f7ff; color:#292535; }
        header {
          max-width:1150px; margin:auto; padding:25px;
          display:flex; justify-content:space-between; align-items:center;
        }
        .brand { font-size:20px; font-weight:900; color:#292535; text-decoration:none; }
        .brand span { color:#0879D1; }
        .back { color:#0879D1; font-size:13px; text-decoration:none; font-weight:800; }
        .book-info {
          max-width:1100px; margin:35px auto; padding:35px;
          display:flex; align-items:center; gap:38px;
          background:white; border:1px solid #e9e5f2; border-radius:22px;
        }
        .cover {
          width:185px; height:245px; object-fit:contain;
          background:#f2eeff; border-radius:12px;
        }
        .eyebrow { color:#0879D1; font-size:11px; font-weight:900; letter-spacing:2px; }
        h1 { font-size:38px; margin:12px 0; }
        .book-info p { color:#81798e; line-height:1.8; }
        .reader-section {
          max-width:1100px; margin:25px auto 90px;
          background:white; border:1px solid #e9e5f2;
          border-radius:22px; padding:28px;
        }
        h2 { margin:10px 0; }
        .reader-heading p { color:#8a8298; font-size:13px; }
        .pdf {
          display:block; width:100%; height:800px;
          border:1px solid #e6e1f0; border-radius:12px;
          margin-top:25px; background:#f1eff7;
        }
        .notice { color:#9a92a5; font-size:12px; line-height:1.6; }
        .empty { padding:65px 15px; text-align:center; color:#938ba0; }
        @media(max-width:650px) {
          header { padding:18px; }
          .book-info { margin:15px; padding:22px; flex-direction:column; align-items:flex-start; }
          .reader-section { margin:15px; padding:15px; }
          .pdf { height:65vh; }
          h1 { font-size:28px; }
        }
      `}</style>
    </main>
  )
}
