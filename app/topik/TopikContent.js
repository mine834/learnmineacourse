'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicHeader, { PageIntro } from '../components/PublicHeader'
import styles from '../components/PublicPages.module.css'
import './topik-custom.css'
import bookStyles from './TopikBooks.module.css'

export default function TopikContent({ books = [], loadError = false }) {
  const params = useSearchParams()
  const aboutRef = useRef(null)
  const registerRef = useRef(null)

  useEffect(() => {
    const section = params.get('section')
    const target = section === 'about' ? aboutRef.current :
                   section === 'register' ? registerRef.current : null
    if (!target) return
    if (target.tagName === 'DETAILS') target.open = true
    const id = window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 180)
    return () => window.clearTimeout(id)
  }, [params])

  return <main className={styles.page}>
    <PublicHeader active="/topik" />
    <PageIntro eyebrow="TOPIK" title="TOPIK">
      Түвшин, үгийн сан, асуултын төрөл, хугацааны стратегиа нэг төлөвлөгөөнд оруул.
    </PageIntro>

    <section className={`${styles.container} ${styles.content} lmTopikPage`}>
      <details className={styles.details} id="topik-about" ref={aboutRef}>
        <summary className={styles.rowLink}>
          <span className={styles.number}>01</span>
          <span className={styles.rowTitle}>TOPIK гэж юу вэ?</span>
          <span className={styles.arrow}>⌄</span>
        </summary>
        <div className={`${styles.detailsBody} lmTopikAbout`}>
          <p>TOPIK (Test of Proficiency in Korean) нь солонгос хэл төрөлх хэл нь биш хүмүүсийн солонгос хэлний мэдлэгийг үнэлдэг шалгалт юм.</p>
          <div className="lmTopikLevels">
            <article>
              <h3>TOPIK I</h3>
              <p>Анхан шат · 1–2-р түвшин</p>
              <p>Цаасан шалгалтад сонсох, унших хэсэгтэй.</p>
            </article>
            <article>
              <h3>TOPIK II</h3>
              <p>Дунд ба ахисан шат · 3–6-р түвшин</p>
              <p>Цаасан шалгалтад сонсох, бичих, унших хэсэгтэй.</p>
            </article>
          </div>
          <p>TOPIK-ийн оноог их сургууль, тэтгэлэг, зарим ажлын шаардлагад ашигладаг. Онооны хүчинтэй хугацаа ерөнхийдөө 2 жил.</p>
          
        </div>
      </details>

      <details className={styles.details} id="topik-materials">
        <summary className={styles.rowLink}>
          <span className={styles.number}>02</span>
          <span className={styles.rowTitle}>TOPIK бэлтгэлийн материалууд</span>
          <span className={styles.arrow}>⌄</span>
        </summary>
        <div className={styles.detailsBody}>
          <p>TOPIK ангилалд нийтлэгдсэн ном, үгийн сан, дасгалын материалууд:</p>
          {loadError ? <p role="alert">Номын мэдээллийг ачаалж чадсангүй. Дараа дахин оролдоорой.</p> : books.length === 0 ? <p>TOPIK ангилалд нийтлэгдсэн ном одоогоор алга байна.</p> : (
            <div className={bookStyles.grid}>
              {books.map(book => (
                <article className={bookStyles.card} key={`${book.source}-${book.id}`}>
                  <a href={`/books/${book.id}`} className={bookStyles.coverLink}>
                    {book.cover_url ? <img className={bookStyles.cover} src={book.cover_url} alt={book.title || 'Номын хавтас'} loading="lazy" /> : <div className={bookStyles.placeholder}>TOPIK</div>}
                  </a>
                  <div className={bookStyles.info}>
                    <h3><a href={`/books/${book.id}`}>{book.title}</a></h3>
                    {book.short_description || book.description ? <p className={bookStyles.description}>{book.short_description || book.description}</p> : null}
                    <div className={bookStyles.bottom}>
                      <strong className={bookStyles.price}>{Number(book.price || 0).toLocaleString('en-US')}₮</strong>
                      <a className={bookStyles.order} href={`/books/${book.id}`}>Захиалах</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </details>


      <div className="lmTopikRegistration" id="topik-register" ref={registerRef}>
        <div className="lmTopikRegistrationHead">
          <div>
            <p className="lmTopikEyebrow">TOPIK</p>
            <h2>TOPIK шалгалтын бүртгэл</h2>
            <p>Шалгалт өгөх улс, бүртгэлийн хугацаа болон заавраа сонгоорой.</p>
          </div>
          <a href="https://www.topik.go.kr/" target="_blank" rel="noopener noreferrer" className="lmTopikOfficial">
            Албан ёсны сайт ↗
          </a>
        </div>

        <div className="lmTopikRegistrationGrid">
          <a className="lmTopikDirectCard" href="https://topik.mn/" target="_blank" rel="noopener noreferrer"><span>01</span><strong>Монголд бүртгүүлэх</strong><b>↗</b></a>

          <a className="lmTopikDirectCard" href="https://www.topik.go.kr/" target="_blank" rel="noopener noreferrer"><span>02</span><strong>Солонгост бүртгүүлэх</strong><b>↗</b></a>

          <details>
            <summary><span>03</span><strong>Бүртгэлийн алхмууд</strong><b>+</b></summary>
            <div className="lmTopikRegistrationBody">
              <ol>
                <li>TOPIK I эсвэл TOPIK II сонгох</li>
                <li>Бүртгэлийн хугацааг шалгах</li>
                <li>Хувийн мэдээлэл, зургаа бэлтгэх</li>
                <li>Зааврын дагуу бүртгүүлэх</li>
                <li>Төлбөр болон баталгаажуулалтаа шалгах</li>
                <li>Шалгалтын байр, цагийг нягтлах</li>
              </ol>
            </div>
          </details>
        </div>
      </div>
    </section>
  </main>
}

