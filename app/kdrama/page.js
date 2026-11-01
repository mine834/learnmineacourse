'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PublicHeader, { PageIntro } from '../components/PublicHeader'
import styles from '../components/PublicPages.module.css'
const words = [['진짜?','Нээрээ юу?','Гайхах · Casual'],['말도 안 돼','Байж боломжгүй.','Итгэхгүй байх'],['됐어','Боллоо · За боль · Хэрэггүй','Өнгө аясаас хамаарна']]
export default function KDrama() {
  const [message, setMessage] = useState('')
  const [playing, setPlaying] = useState('')
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  function speak(text) {
    if (!window.speechSynthesis) { setMessage('Энэ browser дуудлага тоглуулахыг дэмжихгүй байна.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'; utterance.rate = .85
    utterance.onend = () => setPlaying('')
    utterance.onerror = () => { setPlaying(''); setMessage('Дуудлага тоглуулж чадсангүй. Дахин оролдоно уу.') }
    setMessage(''); setPlaying(text); window.speechSynthesis.speak(utterance)
  }
  return <main className={styles.page}>
    <PublicHeader active="/kdrama" />
    <PageIntro eyebrow="K-DRAMA" title="K-Drama хэллэг">Драманд байнга сонсогддог үг, хэллэгийг нөхцөл, өнгө аястай нь ойлго.</PageIntro>
    <section className={`${styles.container} ${styles.content}`}>
      <h2 className={styles.sectionTitle}>K-Drama дээр сонсдог тэр хэллэгүүд</h2><p className={styles.subtext}>Зүгээр орчуулгыг нь биш, өнгө аястай нь ойлго.</p>
      <div className={styles.phraseList}>{words.map(([ko,mn,note],index) => <div className={styles.phraseRow} key={ko}>
        <span className={styles.number}>0{index+1}</span><div><h3 lang="ko" className={styles.korean}>{ko}</h3><p className={styles.meaning}>{mn}</p><span className={styles.nuance}>{note}</span></div>
        <button type="button" className={styles.sound} onClick={() => speak(ko)} aria-label={`${ko} дуудлага сонсох`} aria-pressed={playing === ko}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg></button>
      </div>)}</div>
      {message && <p role="status" className={styles.audioStatus}>{message}</p>}
      <div className={styles.center}><Link href="/books" className={styles.blueButton}>K-Drama цахим ном үзэх <span>→</span></Link></div>
    </section>
  </main>
}
