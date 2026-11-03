import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedBook } from '../../lib/catalog.mjs'
import { createPublicCatalogClient } from '../../lib/publicCatalog'
import BookPreview from '../BookPreview'

export const dynamic = 'force-dynamic'

export default async function BookDetailPage({ params }) {
  const { id } = await params
  const supabase = createPublicCatalogClient()
  const { book, error } = await getPublishedBook(supabase, id)
  if (error) throw new Error('Номын мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу.')
  if (!book) notFound()

  const previewUrl = book.preview_path
    ? supabase.storage.from(book.preview_bucket).getPublicUrl(book.preview_path).data.publicUrl
    : null
  const formatPrice = price => `${Number(price).toLocaleString('en-US')}₮`

  return <main className="bookDetail">
    <header className="detailHeader">
      <Link href="/" className="brand">learnminea<span>.</span></Link>
      <Link href="/books" prefetch={false} className="back">← Бүх ном</Link>
    </header>
    <div className="detailColumns">
      <section className="purchasePanel" aria-label="Ном болон захиалга">
        <div className="coverFrame">
          {book.cover_url ? <img src={book.cover_url} alt={book.title} className="cover" /> : <div className="coverPlaceholder">{book.title}</div>}
        </div>
        <p className="bookType">ЦАХИМ НОМ · PDF</p>
        <h1>{book.title}</h1>
        <div className="prices">
          {book.old_price > book.price && <del>{formatPrice(book.old_price)}</del>}
          {book.price != null && <strong className={book.old_price > book.price ? 'salePrice' : ''}>{formatPrice(book.price)}</strong>}
        </div>
        <div className="purchaseActions">
          {book.order_url
            ? <a href={book.order_url} className="buyButton" target="_blank" rel="noopener noreferrer">Худалдан авах</a>
            : <button type="button" className="buyButton" disabled>Худалдан авах</button>}
          <BookPreview url={previewUrl} title={book.title} />
        </div>
        {!book.order_url && <p className="unavailableOrder">Захиалгын 

с хараахан нэмэгдээгүй байна.</p>}
      </section>
      <section className="descriptionPanel" aria-label="Номын дэлгэрэнгүй тайлбар">
        {book.description_html
          ? <div className="richDescription" dangerouslySetInnerHTML={{ __html: book.description_html }} />
          : <p>Энэ номын дэлгэрэнгүй тайлбар хараахан нэмэгдээгүй байна.</p>}
      </section>
    </div>
    <style>{`

      /* LEARNMINEA_DESCRIPTION_REFINED_V1 */

      @media (min-width: 1001px) {
        .bookDetail .detailColumns {
          max-width: 1440px;
          grid-template-columns:
            minmax(0, 0.78fr)
            minmax(0, 1.55fr);
          gap: clamp(40px, 4.5vw, 76px);
          align-items: start;
        }

        .bookDetail .coverFrame {
          max-width: 430px;
        }
      }

      .bookDetail .descriptionPanel {
        min-width: 0;
        max-width: 790px;
        padding-top: 4px;
      }

      .bookDetail .richDescription {
        color: #303640;
        font-size: 16px;
        line-height: 1.85;
        letter-spacing: 0;
        white-space: normal;
        overflow-wrap: break-word;
      }

      .bookDetail .richDescription h1,
      .bookDetail .richDescription h2,
      .bookDetail .richDescription h3,
      .bookDetail .richDescription h4 {
        color: #192538;
        font-weight: 750;
        line-height: 1.4;
        letter-spacing: -0.35px;
        margin: 36px 0 18px;
      }

      .bookDetail .richDescription > :first-child {
        margin-top: 0;
      }

      .bookDetail .richDescription h1 {
        font-size: 25px;
      }

      .bookDetail .richDescription h2 {
        font-size: 21px;
      }

      .bookDetail .richDescription h3,
      .bookDetail .richDescription h4 {
        font-size: 18px;
      }

      .bookDetail .richDescription p {
        margin: 0 0 18px;
        line-height: 1.85;
      }

      .bookDetail .richDescription ul,
      .bookDetail .richDescription ol {
        padding-left: 26px;
        margin: 12px 0 32px;
      }

      .bookDetail .richDescription li {
        padding-left: 7px;
        margin-bottom: 13px;
        line-height: 1.8;
      }

      .bookDetail .richDescription li::marker {
        color: #0879d1;
      }

      .bookDetail .richDescription strong,
      .bookDetail .richDescription b {
        color: #172235;
        font-weight: 750;
      }

      .bookDetail .richDescription blockquote {
        margin: 28px 0;
        padding: 18px 22px;
        border-left: 3px solid #0879d1;
        border-radius: 0 12px 12px 0;
        background: #f1f7ff;
        color: #33465e;
      }

      .bookDetail .richDescription img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
      }

      @media (max-width: 700px) {
        .bookDetail .richDescription {
          font-size: 15px;
          line-height: 1.75;
        }

        .bookDetail .richDescription h2 {
          font-size: 20px;
        }

        .bookDetail .richDescription li {
          margin-bottom: 10px;
        }
      }

      /* LEARNMINEA_RICH_DESCRIPTION_START */
      .descriptionPanel {
        min-width: 0;
      }
      .richDescription {
        color: #202124;
        font-size: 15px;
        line-height: 1.55;
        overflow-wrap: anywhere;
      }
      .richDescription h1,
      .richDescription h2,
      .richDescription h3,
      .richDescription h4 {
        color: #151515;
        font-weight: 700;
        line-height: 1.35;
        margin: 0 0 12px;
      }
      .richDescription h1 { font-size: 21px; }
      .richDescription h2 { font-size: 19px; }
      .richDescription h3,
      .richDescription h4 { font-size: 17px; }
      .richDescription p {
        margin: 0 0 12px;
        white-space: normal;
      }
      .richDescription ul,
      .richDescription ol {
        margin: 4px 0 22px;
        padding-left: 25px;
      }
      .richDescription li {
        padding-left: 3px;
        margin: 0 0 7px;
        line-height: 1.55;
      }
      .richDescription li::marker {
        color: #cbd0d8;
        font-size: 0.8em;
      }
      .richDescription strong,
      .richDescription b {
        color: #171717;
        font-weight: 700;
      }
      .richDescription ul + h2,
      .richDescription ul + h3,
      .richDescription p + h2,
      .richDescription p + h3 {
        margin-top: 22px;
      }
      .richDescription img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
      }
      /* LEARNMINEA_RICH_DESCRIPTION_END */
      .bookDetail { min-height:100vh;background:#fff;color:#18191b;font-family:Arial,sans-serif; }
      .bookDetail * { box-sizing:border-box; }
      .detailHeader { max-width:1400px;padding:24px 32px;margin:auto;display:flex;justify-content:space-between;align-items:center;gap:20px;border-bottom:1px solid #f0f1f3; }
      .brand { color:#18191b;font:30px Georgia,serif;text-decoration:none;letter-spacing:-1px; }
      .brand span { color:#009dff; }.back { color:#687080;text-decoration:none;font-size:14px; }
      .detailColumns { max-width:1400px;margin:42px auto 100px;padding:0 32px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.7fr);gap:64px;align-items:start; }
      .purchasePanel { min-width:0; }.coverFrame { width:100%;background:#fafbfc;border-radius:18px;overflow:hidden; }
      .cover { width:100%;max-height:590px;object-fit:contain;display:block; }
      .coverPlaceholder { aspect-ratio:.8;display:grid;place-items:center;padding:30px;background:#d9eaff;font:36px Georgia,serif;text-align:center; }
      .bookType { margin:25px 0 12px;font-size:12px;letter-spacing:1.3px;color:#969aa5; }
      .purchasePanel h1 { font-size:28px;line-height:1.3;margin:0 0 24px;font-weight:750; }
      .prices { display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 0 28px; }
      .prices strong { font-size:32px;font-weight:800; }.prices .salePrice { color:#ff3348; }.prices del { color:#8b8e99;font-size:22px; }
      .purchaseActions { display:flex;align-items:stretch;flex-wrap:wrap;gap:12px; }
      .buyButton { flex:1;min-width:160px;display:flex;align-items:center;justify-content:center;padding:17px 24px;min-height:56px;border:0;border-radius:10px;background:#18191b;color:#fff!important;text-decoration:none;font:600 16px Arial,sans-serif;text-align:center; }
      .buyButton:hover { background:#303238; }.buyButton:disabled { background:#ccc;cursor:default; }
      .unavailableOrder { font-size:12px;color:#818592;margin-top:12px; }
      .descriptionPanel { min-width:0;font-size:18px;line-height:1.85;overflow-wrap:anywhere; }
      .descriptionPanel>p { color:#818592; }.richDescription { white-space:pre-line; }
      .richDescription h1,.richDescription h2,.richDescription h3 { font-size:22px;line-height:1.5;margin:0 0 18px;font-weight:750; }
      .richDescription p,.richDescription div { margin:0 0 16px; }.richDescription strong,.richDescription b { font-weight:750; }
      .richDescription ul { list-style:disc;padding-left:28px;margin:0 0 28px; }.richDescription ol { list-style:decimal;padding-left:28px;margin:0 0 28px; }
      .richDescription li { padding-left:6px;margin:0 0 14px; }.richDescription li::marker { color:#cbd0d9; }
      .richDescription a { color:#0879d1;text-decoration:underline; }.richDescription blockquote { border-left:3px solid #d6eaff;padding-left:20px;margin:20px 0;color:#687080; }
      @media(max-width:1000px) { .detailColumns { gap:32px;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr); }.descriptionPanel { font-size:16px; }.purchasePanel h1 { font-size:24px; } }
      @media(max-width:700px) { .detailHeader { padding:20px; }.brand { font-size:26px; }.detailColumns { grid-template-columns:1fr;padding:0 20px;gap:36px;margin:28px auto 60px; }.coverFrame { max-width:420px;margin:auto; }.purchasePanel h1 { font-size:26px; }.descriptionPanel { border-top:1px solid #eee;padding-top:30px; }.prices strong { font-size:30px; } }

      /* LEARNMINEA_DETAIL_LAYOUT_FINAL */

      .bookDetail {
        background: #fff;
        color: #191919;
      }

      .detailColumns {
        max-width: 1550px;
        margin: 42px auto 90px;
        padding: 0 48px;
        display: grid;
        grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.65fr);
        gap: 64px;
        align-items: start;
      }

      .purchasePanel {
        min-width: 0;
      }

      .coverFrame {
        background: #fff;
        border-radius: 0;
        overflow: hidden;
      }

      .cover {
        width: 100%;
        max-height: 470px;
        object-fit: contain;
        object-position: center;
      }

      .bookType {
        margin: 18px 0 8px;
        font-size: 12px;
        color: #8b8f99;
      }

      .purchasePanel h1 {
        font-size: 21px;
        line-height: 1.35;
        font-weight: 750;
        margin: 0 0 16px;
      }

      .prices {
        gap: 10px;
        margin: 0 0 20px;
      }

      .prices strong {
        font-size: 25px;
      }

      .prices del {
        font-size: 18px;
      }

      .purchaseActions {
        gap: 10px;
      }

      .buyButton {
        min-height: 48px;
        padding: 12px 18px;
        font-size: 14px;
        border-radius: 7px;
      }

      .descriptionPanel {
        min-width: 0;
        font-size: 16px;
        line-height: 1.55;
        padding: 0;
        border: 0;
      }

      .richDescription {
        font-size: 16px;
        line-height: 1.55;
        white-space: normal;
        color: #202124;
        overflow-wrap: anywhere;
      }

      .richDescription h1,
      .richDescription h2,
      .richDescription h3,
      .richDescription h4 {
        font-size: 20px;
        line-height: 1.35;
        font-weight: 750;
        margin: 0 0 15px;
        color: #161616;
      }

      .richDescription p,
      .richDescription div {
        margin: 0 0 12px;
        line-height: 1.55;
      }

      .richDescription ul,
      .richDescription ol {
        margin: 5px 0 25px;
        padding-left: 27px;
      }

      .richDescription li {
        margin: 0 0 9px;
        padding-left: 5px;
        line-height: 1.55;
      }

      .richDescription li::marker {
        color: #cdd2da;
      }

      .richDescription strong,
      .richDescription b {
        font-weight: 750;
        color: #171717;
      }

      .richDescription ul + h2,
      .richDescription ul + h3,
      .richDescription ol + h2,
      .richDescription ol + h3 {
        margin-top: 24px;
      }

      @media (max-width: 1000px) {
        .detailColumns {
          padding: 0 28px;
          gap: 32px;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        }
      }

      @media (max-width: 700px) {
        .detailColumns {
          grid-template-columns: 1fr;
          padding: 0 20px;
          gap: 30px;
          margin: 26px auto 60px;
        }

        .coverFrame {
          max-width: 420px;
          margin: auto;
        }

        .descriptionPanel {
          border-top: 1px solid #eee;
          padding-top: 26px;
        }

        .richDescription {
          font-size: 15px;
        }
      }


      /* LEARNMINEA_COVER_FIT_START */
      .bookDetail .coverFrame {
        width: 100%;
        aspect-ratio: 3 / 4;
        border-radius: 24px;
        overflow: hidden;
        background: #fff;
      }

      .bookDetail .coverFrame .cover {
        display: block;
        width: 100%;
        height: 100%;
        max-height: none;
        object-fit: cover;
        object-position: center;
        border-radius: inherit;
      }

      .bookDetail .coverPlaceholder {
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }
      /* LEARNMINEA_COVER_FIT_END */

      
      /* LEARNMINEA_BOOK_DETAIL_CLEAN_LAYOUT */

      @media (min-width: 1001px) {
        .bookDetail .detailColumns {
          max-width: 1250px;
          margin: 48px auto 90px;
          padding: 0 36px;
          display: grid;
          grid-template-columns: minmax(0, 290px) minmax(0, 1fr);
          gap: 64px;
          align-items: start;
        }

        .bookDetail .coverFrame {
          max-width: 290px;
        }

        .bookDetail .descriptionPanel {
          max-width: 760px;
          padding-top: 4px;
        }
      }

      .bookDetail .richDescription {
        color: #30343b;
        font-size: 16px;
        line-height: 1.8;
        letter-spacing: 0;
        white-space: normal;
        overflow-wrap: break-word;
      }

      .bookDetail .richDescription h1,
      .bookDetail .richDescription h2,
      .bookDetail .richDescription h3,
      .bookDetail .richDescription h4 {
        color: #172235;
        line-height: 1.4;
        font-weight: 750;
        margin: 32px 0 16px;
      }

      .bookDetail .richDescription > :first-child {
        margin-top: 0;
      }

      .bookDetail .richDescription h1 { font-size: 24px; }
      .bookDetail .richDescription h2 { font-size: 21px; }
      .bookDetail .richDescription h3,
      .bookDetail .richDescription h4 { font-size: 18px; }

      .bookDetail .richDescription p {
        margin: 0 0 18px;
        line-height: 1.8;
      }

      .bookDetail .richDescription ul,
      .bookDetail .richDescription ol {
        padding-left: 26px;
        margin: 12px 0 30px;
      }

      .bookDetail .richDescription li {
        margin-bottom: 12px;
        padding-left: 6px;
        line-height: 1.75;
      }

      .bookDetail .richDescription li::marker {
        color: #0879d1;
      }

      .bookDetail .richDescription strong,
      .bookDetail .richDescription b {
        color: #172235;
        font-weight: 750;
      }

      @media (max-width: 700px) {
        .bookDetail .coverFrame {
          max-width: 290px;
          margin-left: auto;
          margin-right: auto;
        }

        .bookDetail .richDescription {
          font-size: 15px;
          line-height: 1.75;
        }
      }
`}</style>
  </main>
}
