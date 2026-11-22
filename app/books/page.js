import './books-page.css'
import './footer-compact.css'

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
  ['kdrama', 'K-Drama'],
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

const BOOKS_HERO_DEFAULTS = {
  eyebrow: 'LEARNMINEA · DIGITAL LIBRARY',
  title: 'Цахим номын\nсан',
  description: 'Түвшин, зорилгодоо тохирсон цахим ном, гарын авлагаа сонгоод хаанаас ч сураарай.',
  buttonText: 'Номуудыг үзэх',
  gradientStart: '#D3E8FC',
  gradientEnd: '#E8F0F9',
}

function validHex(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback
}

export default async function BooksPage({ searchParams }) {
  const params = await searchParams
  const selectedCategory = canonicalCategory(params?.category || 'all')
  const search = String(params?.search || '').trim().toLocaleLowerCase()

  const catalogClient = createPublicCatalogClient()
  const { books, errors } = await getPublishedCatalog(catalogClient)

  const { data: booksHeroRow, error: booksHeroError } = await catalogClient
    .from('site_editor_settings')
    .select('content')
    .eq('id', 'books_hero')
    .maybeSingle()

  if (booksHeroError) console.error('Books hero settings:', booksHeroError.message)

  const booksHeroSettings = {
    ...BOOKS_HERO_DEFAULTS,
    ...(booksHeroRow?.content || {}),
  }

  const heroGradient = `linear-gradient(120deg, ${
    validHex(booksHeroSettings.gradientStart, BOOKS_HERO_DEFAULTS.gradientStart)
  } 0%, ${
    validHex(booksHeroSettings.gradientEnd, BOOKS_HERO_DEFAULTS.gradientEnd)
  } 100%)`
  if (errors.length) console.error('Public catalog query failed', errors)
  const filteredBooks = books.filter(book =>
    (selectedCategory === 'all' || canonicalCategory(book.category) === selectedCategory) &&
    (!search || `${book.title || ''} ${book.description || ''} ${book.short_description || ''}`.toLocaleLowerCase().includes(search))
  )

  return (
    <main className="booksPage">
      <PublicHeader active="/books" />
      {
/* LEARNMINEA BOOKS SUPER INTRO */}
      <section className="mineabooksIntro" style={{ "--books-hero-gradient": heroGradient }}>
        <div className="mineabooksIntroInner">
          <div className="mineabooksIntroCopy">
            <div className="mineabooksEyebrow">
              {booksHeroSettings.eyebrow}
            </div>

            <h1 style={{ whiteSpace: "pre-line" }}>{booksHeroSettings.title}</h1>

            <p>
              {booksHeroSettings.description}
            </p>

            <a className="mineabooksExplore" href="#book-catalog">
              {booksHeroSettings.buttonText} <span>↗</span>
            </a>
          </div>

          <div className="mineabooksArtwork" aria-label="Манай цахим номууд">
            <div className="mineabooksSticker stickerOne">가</div>
            <div className="mineabooksSticker stickerTwo">✦</div>

            {books.filter(book => book.cover_url).slice(0, 2).map((book, index) => (
              <div
                key={book.id}
                className={`mineabooksBook ${index === 0 ? 'bookBack' : 'bookFront'}`}
              >
                <img
                  src={book.cover_url}
                  alt={book.title || 'Цахим ном'}
                />
              </div>
            ))}
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
          <div className="booksCtaCopy">
            <p className="booksCtaEyebrow">ЭХЛЭХЭД БЭЛЭН ҮҮ?</p>
            <h2>Өөрт тохирох аргаар өнөөдөр эхэл.</h2>
            <p className="booksCtaDescription">
              Таны сурах зорилго, түвшин, боломжит цагт тохирсон
              эхний алхмаа олоорой.
            </p>
          </div>
          <Link href="/assessment/questions" className="booksCtaButton">
            Сурах аргаа тодорхойлох →
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

      
    </main>
  )
}
