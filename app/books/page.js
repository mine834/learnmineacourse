
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const colors = {
  blue: '#009DFF',
  lightBlue: '#D9EAFC',
  text: '#18191B',
  muted: '#818592',
}

export default async function BooksPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: books, error } = await supabase
    .from('book_previews')
    .select('id,title,description,price,cover_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="booksPage">
      {/* HEADER */}
      <header className="booksHeader">
        <Link href="/" className="booksLogo">
          learnminea<span>.</span>
        </Link>

        <nav className="booksNav">
          <Link href="/">Нүүр</Link>
          <Link href="/topik">TOPIK</Link>
          <Link href="/k-drama">K-Drama</Link>
          <Link href="/books" className="active">
            Цахим ном
          </Link>
          <Link href="/survey">Сурах</Link>
        </nav>
      </header>

      {/* BLUE INTRO */}
      <section className="booksHero">
        <div className="booksContainer">
          <p className="booksEyebrow">ЦАХИМ НОМ</p>

          <h1>Цахим номын сан</h1>

          <p className="booksDescription">
            Түвшин, зорилгодоо тохирсон цахим ном,
            гарын авлагаа сонгоод хаанаас ч сураарай.
          </p>
        </div>
      </section>

      {/* BOOK CATALOG */}
      <section className="booksCatalog">
        <div className="booksContainer">
          <div className="catalogHeading">
            <div>
              <p className="booksEyebrow">LEARNMINEA LIBRARY</p>
              <h2>Сурах материалаа сонго</h2>
            </div>

            <p>
              Ном бүрийн танилцуулга болон эхний
              жишээ хуудсуудыг үнэгүй уншаарай.
            </p>
          </div>

          {error ? (
            <div className="booksMessage">
              Номуудыг ачаалж чадсангүй: {error.message}
            </div>
          ) : !books?.length ? (
            <div className="booksEmpty">
              <div className="emptyIcon">📖</div>
              <h3>Тун удахгүй</h3>
              <p>
                Одоогоор ном нэмэгдээгүй байна.
                Шинэ материалууд удахгүй нийтлэгдэнэ.
              </p>
            </div>
          ) : (
            <div className="booksGrid">
              {books.map((book, index) => (
                <article className="bookItem" key={book.id}>
                  <Link
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

                    <h3>{book.title}</h3>

                    <p className="bookDescription">
                      {book.description ||
                        'Солонгос хэл сурахад зориулсан цахим материал.'}
                    </p>

                    {book.price != null && (
                      <strong className="bookPrice">
                        {Number(book.price).toLocaleString('en-US')}₮
                      </strong>
                    )}

                    <Link
                      href={`/books/${book.id}`}
                      className="previewLink"
                    >
                      PDF Preview унших <span>→</span>
                    </Link>
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
          <Link href="/survey">
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
            <Link href="/k-drama">K-Drama</Link>
            <Link href="/books">Цахим ном</Link>
            <Link href="/survey">Сурах арга барил</Link>
          </nav>
        </div>

        <div className="footerCopyright">
          © 2026 LearnMinea. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </footer>

      <style>{`
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
          max-width: 1240px;
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
          padding: 100px 0 120px;
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
          gap: 26px;
        }

        .bookItem {
          min-width: 0;
        }

        .bookCover {
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: 0.76;
          border-radius: 7px 22px 22px 7px;
          overflow: hidden;
          box-shadow: 0 12px 25px rgba(0,0,0,.08);
          transition: transform .2s, box-shadow .2s;
        }

        .bookCover:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 30px rgba(0,0,0,.12);
        }

        .bookCover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

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
          border-radius: 22px;
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
            padding: 70px 0;
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
          .booksGrid {
            grid-template-columns: 1fr;
            max-width: 330px;
            margin: auto;
          }

          .bookCover {
            aspect-ratio: 0.8;
          }

          .booksLogo {
            font-size: 27px;
          }
        }
      `}</style>
    </main>
  )
}
