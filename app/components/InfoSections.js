'use client'

import { useState } from 'react'
import Link from 'next/link'
import { safeHomeLink } from '../lib/homeContent.mjs'
import s from './InfoSections.module.css'

const lines = value => String(value || '').split('\n').map(x => x.trim()).filter(Boolean)

export function TopikInfoSection({ value = {}, preview = false }) {
  return <section className={s.topik} id={preview ? undefined : 'topik-info'}>
    <div className={s.eyebrow}>{value.eyebrow}</div>
    <h2 className={s.topikTitle}>{value.title}</h2>
    <p className={s.subtitle}>{value.body}</p>
    <div className={s.topikGrid}>{[1, 2].map(n => <article className={s.topikCard} key={n}>
      <span className={s.symbol}>{value[`card${n}_symbol`]}</span>
      <h3>{value[`card${n}_title`]}</h3><p>{value[`card${n}_body`]}</p>
      {preview ? <span className={s.cardLink}>{value[`card${n}_link_text`]}</span> :
        <Link className={s.cardLink} href={n === 1 ? '/topik?section=about#topik-about' : '/topik?section=register#topik-register'}>{value[`card${n}_link_text`]}</Link>}
    </article>)}</div>
  </section>
}

export function GksInfoSection({ value = {}, preview = false }) {
  const [open, setOpen] = useState(false)
  const items = [['tracks_title','tracks_body'],['selection_title','selection_body'],['preparation_title','preparation_body'],['apostille_title','apostille_body']]
  return <section className={s.gks} id={preview ? undefined : 'gks-info'}>
    <div className={s.gksHeader}>
      <div><div className={s.gksEyebrow}>{value.eyebrow}</div><h2>{value.title}</h2><p>{value.body}</p></div>
      <button type="button" className={s.toggle} onClick={() => setOpen(v => !v)} aria-expanded={open}>{value.more_text || 'Дэлгэрэнгүй'} {open ? '↑' : '↓'}</button>
    </div>
    {open && <div className={s.gksBody}>
      <div className={s.gksSection}><h3>{value.requirements_title}</h3><p>{value.requirements_body}</p><ul>{lines(value.requirements_list).map((item,i) => <li key={i}>{item}</li>)}</ul></div>
      <div className={s.gksSection}><h3>{value.documents_title}</h3><ul className={s.twoCols}>{lines(value.documents_list).map((item,i) => <li key={i}>{item}</li>)}</ul></div>
      <div className={s.gksSection}><h3>{value.optional_title}</h3><ul className={s.twoCols}>{lines(value.optional_list).map((item,i) => <li key={i}>{item}</li>)}</ul>{value.documents_note && <p className={s.note}>{value.documents_note}</p>}</div>
      <div className={s.gksCards}>{items.map(([title,body]) => <article key={title}><h3>{value[title]}</h3><p>{value[body]}</p></article>)}</div>
      <div className={s.actions}>{value.official_link_text && (preview ? <span>{value.official_link_text}</span> : <a href="https://www.studyinkorea.go.kr/" target="_blank" rel="noopener noreferrer">{value.official_link_text}</a>)}
        {value.consultation_text && (preview ? <span className={s.consult}>{value.consultation_text}</span> : <Link className={s.consult} href={safeHomeLink(value.consultation_url) || '/survey'}>{value.consultation_text}</Link>)}
      </div>
    </div>}
  </section>
}
