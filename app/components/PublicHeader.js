import Link from 'next/link'
import styles from './PublicPages.module.css'
const links = [['Нүүр','/'],['TOPIK','/topik'],['K-Drama','/kdrama'],['Цахим ном','/books'],['Сурах','/learn']]
export default function PublicHeader({ active }) {
  return <header className={styles.header}><div className={styles.headerInner}>
    <Link href="/" className={styles.logo}>learnminea<span>.</span></Link>
    <nav className={styles.nav} aria-label="Үндсэн цэс">{links.map(([label,href]) => <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}>{label}</Link>)}</nav>
    <div className={styles.actions}>
      <Link href="/survey" className={styles.iconLink} aria-label="Сурах арга барилын судалгаа"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg></Link>
      <Link href="/books" className={styles.iconLink} aria-label="Номын сан"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 8a4 4 0 0 0 8 0"/></svg></Link>
    </div>
  </div></header>
}
export function PageIntro({ eyebrow, title, children }) {
  return <section className={styles.intro}><div className={styles.container}><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.description}>{children}</p></div></section>
}
