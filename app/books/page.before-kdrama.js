
import Link from 'next/link'
import PublicHeader, { PageIntro } from '../components/PublicHeader'
import { getPublishedCatalog } from '../lib/catalog.mjs'
import { createPublicCatalogClient } from '../lib/publicCatalog'

export const dynamic = 'force-dynamic'

const colors = {
  blue: '#009DFF',
  lightBlue: '#D9EAFC',
  text: '#18191B',
  muted: '#818592',
}

const categoryOptions = [
  ['all', 'Бүгд'],
  ['vocabulary', 'Үг'],
  ['grammar', 'Дүрэм'],
  ['conversation', 'Харилцан яриа'],
  ['topik', 'TOPIK'],
]

function canonicalCategory(value) {
  const key = String(value || '').trim().toLowerCase()
  const aliases = {
    'үг': 'vocabulary', 'үгийн сан': 'vocabulary', 'vocab': 'vocabulary',
    'дүрэм': 'grammar', 'яриа': 'conversation', 'харилцан яриа': 'conversation',
    'topik ii': 'topik', 'топик': 'topik',
  }
  return aliases[key] || key
}

export default async function BooksPage({ searchParams }) {
  const params = await searchParams
  const selectedCategory = canonicalCategory(params?.category || 'all')
  const search = String(params?.search || '').trim().toLocaleLowerCase()

  const { books, errors } = await getPublishedCatalog(createPublicCatalogClient())
  if (errors.length) console.error('Public catalog query failed', errors)
  const filteredBooks = books.filter(book =>
    (selectedCategory === 'all' || canonicalCategory(book.category) === selectedCategory) &&
    (!search || `${book.title || ''} ${book.description || ''} ${book.short_description || ''}`.toLocaleLowerCase().includes(search))
  )

  return (
    <main className="booksPage">
      <PublicHeader active="/books" />
      {/* LEARNMINEA BOOKS SUPER INTRO */}
      <section className="mineabooksIntro">
        <div className="mineabooksIntroInner">
          <div className="mineabooksIntroCopy">
            <div className="mineabooksEyebrow">
              LEARNMINEA · DIGITAL LIBRARY
            </div>

            <h1>
              Сурах зүйлээ
              <br />
              <span>өөрийнхөөрөө</span> сонго.
            </h1>

            <p>
              Үгийн сан, дүрэм, TOPIK болон өдөр тутмын
              хэрэглээний цахим ном, материалаа нэг дороос
              олж, өөрийн хурдаар суралцаарай.
            </p>

            <a className="mineabooksExplore" href="#book-catalog">
              Номуудыг үзэх <span>↗</span>
            </a>

            <div className="mineabooksNote">
              Өөрийн түвшинд тохирсон материалаас эхлээрэй.
            </div>
          </div>

          <div className="mineabooksArtwork" aria-hidden="true">
            <div className="mineabooksSticker stickerOne">가</div>
            <div className="mineabooksSticker stickerTwo">✦</div>

            <div className="mineabooksBook bookBack">
              <span>LEARNMINEA</span>
              <strong>TOPIK</strong>
              <small>STUDY NOTES</small>
            </div>

            <div className="mineabooksBook bookFront">
              <span>LEARNMINEA</span>
              <strong>나의 한국어</strong>
              <small>MY KOREAN NOTEBOOK</small>
              <div className="mineabooksBookLabel">
                <span>NAME</span>
                <b>my study journey</b>
                <span>LEVEL</span>
                <b>01 — 06</b>
              </div>
            </div>

            <div className="mineabooksScribble">
              made for your learning journey ↗
            </div>
          </div>
        </div>
      </section>

      {/* BOOK CATALOG */}
      <section className="booksCatalog" id="book-catalog">
        <div className="booksContainer">
          {errors.length > 0 && (
            <div className="booksMessage" role="alert">
              Номын мэдээллийг бүрэн ачаалж чадсангүй. Түр хүлээгээд дахин оролдоно уу.
            </div>
          )}
          <nav className="mineabooksCategoryNav" aria-label="Номын ангилал">
            {categoryOptions.map(([key, label]) => (
              <Link key={key} href={key === 'all' ? '/books#book-catalog' : `/books?category=${key}#book-catalog`}
                className={selectedCategory === key ? 'selected' : ''}
                aria-current={selectedCategory === key ? 'page' : undefined}>{label}</Link>
            ))}
          </nav>
          {!filteredBooks.length ? (errors.length ? null : (
            <div className="booksEmpty">
              <div className="emptyIcon">📖</div>
              <h3>Тун удахгүй</h3>
              <p>
                {selectedCategory !== 'all' || search ? 'Энэ ангилалд тохирох ном одоогоор алга байна.' : 'Одоогоор ном нэмэгдээгүй байна. Шинэ материалууд удахгүй нийтлэгдэнэ.'}
              </p>
            </div>
          )) : (
            <div className="booksGrid">
              {filteredBooks.map((book, index) => (
                <article className="bookItem" key={book.source + book.id}>
                  <Link
                    prefetch={false}
                    href={`/books/${book.id}`}
                    className={`bookCover cover${index % 4}`}
                    aria-label={`${book.title} номыг үзэх`}
                  >
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="placeholderCover">
                        <span className="coverLabel">
                          ДИЖИТАЛ МАТЕРИАЛ
                        </span>
                        <strong>{book.title}</strong>
                        <small>LEARNMINEA</small>
                      </div>
                    )}
                  </Link>

                  <div className="bookInfo">
                    <p className="bookType">
                      ДИЖИТАЛ МАТЕРИАЛ · PDF
                    </p>

                    <h3><Link prefetch={false} href={`/books/${book.id}`}>{book.title}</Link></h3>
                    {Boolean(book.short_description || book.shortDescription) && (
                      <p className="mineaCatalogShort">{book.short_description || book.shortDescription}</p>
                    )}
                    {book.price != null && (
                      <div className="bookPrices">
                        <strong className="bookPrice">{Number(book.price).toLocaleString('en-US')}₮</strong>
                        {book.old_price > book.price && <del>{Number(book.old_price).toLocaleString('en-US')}₮</del>}
                      </div>
                    )}

                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="booksBottom">
        <div className="bottomInner">
          <p>LEARNMINEA</p>
          <h2>
            Хэл сурах нь ихийг биш,
            <br />
            зөвийг сурахаас эхэлнэ.
          </h2>
          <Link href="/assessment/questions">
            Өөрийн сурах аргаа олох →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="booksFooter">
        <div className="footerInner">
          <div>
            <Link href="/" className="footerLogo">
              learnminea<span>.</span>
            </Link>
            <p>
              Хэл сурахыг өөртөө ойр,
              амьдралд хэрэгтэй болгоно.
            </p>
          </div>

          <nav>
            <Link href="/">Нүүр</Link>
            <Link href="/topik">TOPIK</Link>
            <Link href="/kdrama">K-Drama</Link>
            <Link href="/books">Цахим ном</Link>
            <Link href="/assessment/questions">Сурах арга барил</Link>
          </nav>
        </div>

        <div className="footerCopyright">
          © 2026 LearnMinea. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </footer>

      <style>{`
.mineabooksCategoryNav{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 28px}
.mineabooksCategoryNav a{padding:11px 19px;border:1px solid #c9dbea;border-radius:100px;background:white;color:#253b50;text-decoration:none;font-weight:600}
.mineabooksCategoryNav a.selected,.mineabooksCategoryNav a:hover{background:#009dff;color:white;border-color:#009dff}


/* LEARNMINEA BOOKS UNIFIED BACKGROUND */
/* Зөвхөн цахим номын хуудасны арын өнгө */

.booksPage,
.booksPage .mineabooksIntro,
.booksPage .booksCatalog,
.booksPage .booksBottom,
.booksPage .booksFooter {
  background: #F5FAFF !important;
}

.booksPage .bottomInner,
.booksPage .footerInner,
.booksPage .footerCopyright {
  background-color: transparent !important;
}


/* LEARNMINEA BOOKS SUPER INTRO */

.booksPage .mineabooksIntro {
  background: #f5faff;
  overflow: hidden;
  padding: 105px 32px 115px;
}

.booksPage .mineabooksIntroInner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 50px;
  align-items: center;
}

.booksPage .mineabooksEyebrow {
  font-family: Arial, sans-serif;
  color: #007de0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 30px;
}

.booksPage .mineabooksIntro h1 {
  font-family: Georgia, serif;
  font-weight: 400;
  font-size: clamp(48px, 6.5vw, 94px);
  line-height: 1.08;
  letter-spacing: -2px;
  color: #18191b;
  margin: 0 0 30px;
}

.booksPage .mineabooksIntro h1 span {
  color: #008ff0;
  font-family: Georgia, serif;
}

.booksPage .mineabooksIntroCopy > p {
  max-width: 560px;
  font-family: Arial, sans-serif;
  font-size: 19px;
  line-height: 1.75;
  color: #727b8c;
  margin-bottom: 30px;
}

.booksPage .mineabooksExplore {
  display: inline-flex;
  gap: 28px;
  align-items: center;
  padding: 15px 25px;
  border: 1.5px solid #008ff0;
  border-radius: 20px;
  background: #fff;
  color: #007de0;
  font: 600 16px Arial, sans-serif;
  box-shadow: 0 3px 0 #c9e6ff;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.booksPage .mineabooksExplore:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 0 #c9e6ff;
}

.booksPage .mineabooksNote {
  margin-top: 20px;
  font: 14px Arial, sans-serif;
  color: #8791a0;
}

.booksPage .mineabooksArtwork {
  position: relative;
  height: 470px;
  perspective: 1000px;
}

.booksPage .mineabooksBook {
  position: absolute;
  width: 265px;
  height: 365px;
  border-radius: 15px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  box-shadow: 12px 20px 35px rgba(20, 70, 130, .14);
  border: 1px solid rgba(0, 65, 140, .1);
  font-family: Arial, sans-serif;
}

.booksPage .mineabooksBook > span {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 700;
}

.booksPage .mineabooksBook > strong {
  font-family: Georgia, serif;
  font-size: 37px;
  line-height: 1.2;
  margin-top: 55px;
}

.booksPage .mineabooksBook > small {
  font-size: 11px;
  letter-spacing: 1.5px;
  margin-top: 12px;
}

.booksPage .bookBack {
  background: #d3e8ff;
  color: #1264a3;
  top: 25px;
  left: 32px;
  transform: rotate(-13deg);
  animation: mineaBookFloatBack 6s ease-in-out infinite;
}

.booksPage .bookFront {
  background: #087bd2;
  color: #fff;
  top: 75px;
  left: 155px;
  transform: rotate(8deg);
  animation: mineaBookFloatFront 5.5s ease-in-out infinite;
}

.booksPage .mineabooksBookLabel {
  margin-top: auto;
  background: #fff;
  color: #18191b;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  gap: 5px;
  transform: rotate(-3deg);
}

.booksPage .mineabooksBookLabel span {
  font: 10px Arial, sans-serif;
  color: #8992a0;
  letter-spacing: 1px;
}

.booksPage .mineabooksBookLabel b {
  font: 15px Georgia, serif;
  border-bottom: 1px solid #d9e3ed;
  padding-bottom: 5px;
}

.booksPage .mineabooksSticker {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 6px 15px rgba(0, 80, 150, .1);
}

.booksPage .stickerOne {
  width: 75px;
  height: 75px;
  top: 8px;
  right: 35px;
  background: #fff;
  color: #008ff0;
  border: 2px solid #008ff0;
  font: 35px Georgia, serif;
  transform: rotate(13deg);
}

.booksPage .stickerTwo {
  width: 55px;
  height: 55px;
  bottom: 40px;
  left: 25px;
  background: #b5dcff;
  color: #006bc3;
  font-size: 28px;
}

.booksPage .mineabooksScribble {
  position: absolute;
  bottom: 4px;
  right: 0;
  color: #007de0;
  font: italic 17px Georgia, serif;
  transform: rotate(-6deg);
}

@keyframes mineaBookFloatBack {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -11px; }
}

@keyframes mineaBookFloatFront {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -16px; }
}

@media (max-width: 850px) {
  .booksPage .mineabooksIntro {
    padding: 65px 22px 55px;
  }

  .booksPage .mineabooksIntroInner {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .booksPage .mineabooksIntro h1 {
    font-size: clamp(42px, 9vw, 65px);
  }

  .booksPage .mineabooksArtwork {
    height: 410px;
    max-width: 450px;
    width: 100%;
    margin: 0 auto;
    transform: scale(.82);
    transform-origin: center top;
  }
}

@media (prefers-reduced-motion: reduce) {
  .booksPage .mineabooksBook {
    animation: none !important;
  }
}

        .booksPage {
          min-height: 100vh;
          background: #fff;
          color: ${colors.text};
          font-family: Arial, sans-serif;
        }

        .booksPage * {
          box-sizing: border-box;
        }

        .booksPage a {
          text-decoration: none;
        }

        .booksContainer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* HEADER */

        .booksHeader {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px max(32px, calc((100vw - 1176px)/2));
          background: #fff;
          border-bottom: 1px solid #edf0f3;
          gap: 24px;
        }

        .booksLogo,
        .footerLogo {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          font-weight: 400;
          color: #18191b;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .booksLogo span,
        .footerLogo span {
          color: #009dff;
        }

        .booksNav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .booksNav a {
          font-size: 14px;
          color: #25272b;
          transition: color .2s;
        }

        .booksNav a:hover,
        .booksNav a.active {
          color: #007ed5;
        }

        /* HERO */

        .booksHero {
          background: linear-gradient(
            120deg,
            #d3e8fc 0%,
            #e8f0f9 100%
          );
          padding: 90px 0 110px;
        }

        .booksEyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: #0077d6;
          margin: 0 0 26px;
        }

        .booksHero h1 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(50px, 6.5vw, 92px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -2px;
          margin: 0 0 24px;
          color: #18191b;
        }

        .booksDescription {
          max-width: 690px;
          color: #777e89;
          font-size: 19px;
          line-height: 1.7;
          margin: 0;
        }

        /* CATALOG */

        .booksCatalog {
          padding: 72px 0 88px;
          background: #fff;
        }

        .catalogHeading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 50px;
          margin-bottom: 55px;
        }

        .catalogHeading .booksEyebrow {
          margin-bottom: 15px;
        }

        .catalogHeading h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(35px, 4vw, 56px);
          font-weight: 400;
          line-height: 1.15;
          margin: 0;
        }

        .catalogHeading > p {
          max-width: 390px;
          font-size: 16px;
          line-height: 1.65;
          color: #818592;
          margin: 0;
        }

        .booksGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .bookItem {
          min-width: 0;
        }

        .bookCover{position:relative;
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: .76;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 25px rgba(0,0,0,.08);
          transition: transform .2s, box-shadow .2s;
        }

        .bookCover:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 30px rgba(0,0,0,.12);
        }

        .bookCover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}

        .cover0,
        .cover3 {
          background: #fbe1d2;
          color: #643323;
        }

        .cover1 {
          background: #d6eaff;
          color: #0077d6;
        }

        .cover2 {
          background: #18191b;
          color: #fff;
        }

        .placeholderCover {
          height: 100%;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .coverLabel {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .placeholderCover strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(23px, 2.5vw, 37px);
          font-weight: 400;
          line-height: 1.16;
          overflow-wrap: anywhere;
        }

        .placeholderCover small {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.3px;
        }

        .bookInfo {
          padding: 25px 3px 0;
        }

        .bookType {
          color: #858b98;
          font-size: 10px;
          letter-spacing: 1.4px;
          margin: 0 0 12px;
        }

        .bookInfo h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 400;
          line-height: 1.25;
          margin: 0 0 9px;
        }

        .bookPrices { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
        .bookPrices del { color:#969aa5; font-size:16px; }
        .bookInfo h3 a { color:inherit; }
        .bookInfo h3 { font-family:Arial,sans-serif; font-weight:750; }
        .bookDescription {
          color: #818592;
          font-size: 13px;
          line-height: 1.7;
          margin: 0 0 15px;
        }

        .bookPrice {
          display: block;
          font-size: 17px;
          font-weight: 600;
          margin: 15px 0;
        }

        .previewLink {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #007ed5;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 0;
        }

        .previewLink:hover {
          text-decoration: underline;
        }

        .previewLink span {
          font-size: 19px;
        }

        /* EMPTY STATE */

        .booksEmpty,
        .booksMessage {
          text-align: center;
          padding: 100px 20px;
          background: #f8f9fb;
          border-radius: 16px;
        }

        .emptyIcon {
          font-size: 42px;
          margin-bottom: 15px;
        }

        .booksEmpty h3 {
          font-family: Georgia, serif;
          font-size: 35px;
          font-weight: 400;
          margin: 0 0 12px;
        }

        .booksEmpty p {
          font-size: 15px;
          color: #818592;
          line-height: 1.7;
        }

        /* BOTTOM CTA */

        .booksBottom {
          background: #fbe1d2;
          padding: 80px 32px;
        }

        .bottomInner {
          max-width: 1176px;
          margin: auto;
        }

        .bottomInner > p {
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 700;
          color: #704232;
          margin: 0 0 22px;
        }

        .bottomInner h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(35px, 4vw, 57px);
          line-height: 1.15;
          font-weight: 400;
          margin: 0 0 30px;
        }

        .bottomInner a {
          display: inline-block;
          padding: 15px 23px;
          background: #fff;
          border-radius: 30px;
          color: #18191b;
          font-size: 14px;
          font-weight: 700;
        }

        /* FOOTER */

        .booksFooter {
          background: #18191b;
          color: #fff;
          padding: 65px 32px 25px;
        }

        .footerInner {
          max-width: 1176px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          gap: 50px;
          padding-bottom: 55px;
        }

        .footerLogo {
          color: #fff;
        }

        .footerInner p {
          color: #969ba5;
          max-width: 280px;
          font-size: 13px;
          line-height: 1.7;
        }

        .footerInner nav {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .footerInner nav a {
          color: #a7aab2;
          font-size: 13px;
        }

        .footerInner nav a:hover {
          color: #fff;
        }

        .footerCopyright {
          max-width: 1176px;
          margin: auto;
          border-top: 1px solid #35383e;
          padding-top: 22px;
          color: #8e939c;
          font-size: 11px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .booksGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .booksHeader {
            padding: 20px;
            flex-direction: column;
            gap: 18px;
          }

          .booksNav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 14px 20px;
          }

          .booksContainer {
            padding: 0 22px;
          }

          .booksHero {
            padding: 65px 0 75px;
          }

          .booksHero h1 {
            font-size: clamp(44px, 9vw, 65px);
          }

          .booksDescription {
            font-size: 16px;
          }

          .booksCatalog {
            padding: 48px 0;
          }

          .catalogHeading {
            flex-direction: column;
            align-items: start;
            gap: 15px;
            margin-bottom: 35px;
          }

          .booksGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 25px 16px;
          }

          .bookInfo h3 {
            font-size: 20px;
          }

          .placeholderCover {
            padding: 15px;
          }

          .placeholderCover strong {
            font-size: 24px;
          }
        }

        @media (max-width: 430px) {
          .booksGrid { grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 14px; }
          .booksContainer { padding:0 20px; }
          .bookInfo h3 { font-size:16px;line-height:1.45; }
          .bookType { font-size:9px;letter-spacing:.6px; }
          .bookPrice { font-size:16px; }
          .placeholderCover strong { font-size:20px; }
        }
      
/* MINEA_BOOKS_BOX_V2 */

.booksPage .booksGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}

.booksPage .bookItem {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(25,45,70,.035);
  transition: transform .2s, box-shadow .2s;
}

.booksPage .bookItem:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(25,45,70,.09);
}

.booksPage .bookCover {
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: none;
}

.booksPage .bookCover:hover {
  transform: none;
  box-shadow: none;
}

.booksPage .bookCover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.booksPage .bookInfo {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.booksPage .bookInfo h3 {
  font-size: 19px;
  line-height: 1.4;
}

@media (max-width: 1000px) {
  .booksPage .booksGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .booksPage .booksGrid {
    gap: 12px;
  }

  .booksPage .bookItem {
    padding: 10px;
    border-radius: 13px;
  }

  .booksPage .bookInfo h3 {
    font-size: 15px;
  }

  .booksPage .bookCover {
    border-radius: 8px;
  }
}


/* MINEA_BOOK_CATALOG_BOX_V3 */
.booksPage .booksGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;align-items:stretch}
.booksPage .bookItem{display:flex;flex-direction:column;height:100%;min-width:0;padding:16px;border:1px solid #e6e8f1;border-radius:20px;background:#fff;box-shadow:0 4px 18px rgba(22,35,70,.035)}
.booksPage .bookCover{width:100%;aspect-ratio:4/5;border-radius:13px;overflow:hidden;box-shadow:none}
.booksPage .bookCover img{object-fit:contain}
.booksPage .bookInfo{display:flex;flex-direction:column;flex:1}
.booksPage .mineaCatalogShort{font-size:14px;line-height:1.55;color:#858a97;margin:10px 0 18px;flex:1}
.booksPage .bookPrices{margin-top:auto}
@media(max-width:1000px){.booksPage .booksGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.booksPage .booksGrid{gap:12px}.booksPage .bookItem{padding:10px;border-radius:14px}.booksPage .mineaCatalogShort{font-size:12px}}

`}</style>
    </main>
  )
}
