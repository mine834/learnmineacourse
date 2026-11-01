"use client"

import { useState } from 'react'
import Link from 'next/link'
import styles from '../components/PublicPages.module.css'
import local from './LearnCategoryExplorer.module.css'

const categories = [
  { label: 'Үгийн сан', key: 'vocabulary' },
  { label: 'Дүрэм', key: 'grammar' },
  { label: 'Харилцан яриа', key: 'conversation' },
  { label: 'K-Drama хэллэг', key: 'kdrama' },
]

function canonical(value) {
  const key = String(value || '').trim().toLowerCase()
  const aliases = {
    'үг': 'vocabulary', 'үгийн сан': 'vocabulary', vocab: 'vocabulary',
    'дүрэм': 'grammar', 'яриа': 'conversation', 'харилцан яриа': 'conversation',
    'к-драма': 'kdrama', 'кдрама': 'kdrama', 'k-drama': 'kdrama',
  }
  return aliases[key] || key
}

export default function LearnCategoryExplorer({ books = [], loadError = false }) {
  const [active, setActive] = useState(null)
  const selected = categories.find(item => item.key === active)
  const visible = selected ? books.filter(book => canonical(book.category) === active) : []

  return <div>
    <div className={styles.learningGrid}>
      {categories.map((item, index) => <button
        type="button" key={item.key}
        className={`${styles.learningCard} ${local.categoryButton} ${active === item.key ? local.active : ''}`}
        onClick={() => setActive(previous => previous === item.key ? null : item.key)}
        aria-expanded={active === item.key}
        aria-controls="learn-category-books"
      >
        <span className={styles.number}>0{index + 1}</span>
        <div className={styles.cardBottom}><h2>{item.label}</h2><span className={styles.arrow}>{active === item.key ? '−' : '→'}</span></div>
      </button>)}
    </div>
    {selected && <section id="learn-category-books" className={local.results} aria-live="polite">
      <div className={local.resultsHead}>
        <h2>{selected.label} <span>({visible.length})</span></h2>
        <button type="button" className={local.close} onClick={() => setActive(null)}>Хаах ×</button>
      </div>
      {loadError ? <p>Номын мэдээллийг ачаалж чадсангүй. Хуудсаа дахин ачаална уу.</p> :
        visible.length === 0 ? <p>Энэ ангилалд нийтлэгдсэн ном одоогоор алга байна.</p> :
        <div className={local.booksGrid}>{visible.map(book => <article key={`${book.source}-${book.id}`} className={local.bookCard}>
          <Link href={`/books/${book.id}`} className={local.cover} prefetch={false}>
            {book.cover_url ? <img src={book.cover_url} alt={book.title || 'Номын нүүр'} loading="lazy" /> : <span>{book.title}</span>}
          </Link>
          <div className={local.info}>
            <div className={local.meta}>ЦАХИМ НОМ · PDF</div>
            <h3><Link href={`/books/${book.id}`} prefetch={false}>{book.title}</Link></h3>
            {book.short_description && <p className={local.description}>{book.short_description}</p>}
            <div className={local.bottom}>
              <strong>{book.price != null ? `${Number(book.price).toLocaleString('en-US')}₮` : 'Үнэ тодорхойгүй'}</strong>
              <Link href={`/books/${book.id}`} prefetch={false} className={local.order}>Захиалах</Link>
            </div>
          </div>
        </article>)}</div>}
    </section>}
  </div>
}
