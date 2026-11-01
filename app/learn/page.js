import PublicHeader, { PageIntro } from '../components/PublicHeader'
import styles from '../components/PublicPages.module.css'
import { createPublicCatalogClient } from '../lib/publicCatalog'
import { getHomeContent } from '../lib/homeContent.mjs'
import { getPublishedCatalog } from '../lib/catalog.mjs'
import LearnCategoryExplorer from './LearnCategoryExplorer'
export const dynamic = 'force-dynamic'
export default async function LearnPage() {
  const { content, error } = await getHomeContent(createPublicCatalogClient())
  if (error) console.error('Course registration content unavailable', error.message)
  const registration = content.registration
  const { books, errors } = await getPublishedCatalog(createPublicCatalogClient())
  if (errors.length) console.error("Learn catalog unavailable", errors)
  return <main className={styles.page}>
    <PublicHeader active="/learn" />
    <PageIntro eyebrow="СУРАХ САН" title="Сурах">Үгийн сан, дүрэм, амьд яриа, K-Drama хичээлээс яг одоо хэрэгтэй зүйлээсээ эхлээрэй.</PageIntro>
    <section className={`${styles.container} ${styles.content}`}>
      <LearnCategoryExplorer books={books} loadError={errors.length > 0} />
      {registration.enabled && <div className={styles.registration}><div><p className={styles.eyebrow}>{registration.eyebrow}</p><h2>{registration.title}</h2><p>{registration.body}</p></div><div className={styles.registrationAction}>
        {registration.button_url ? <a href={registration.button_url} className={styles.whiteButton} target="_blank" rel="noopener noreferrer">{registration.button_text}</a> : <><button className={styles.whiteButton} disabled>{registration.button_text}</button><small>Бүртгэлийн 
<div className="footer-socials">
  <a
    href="https://www.instagram.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    title="Instagram"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  </a>

  <a
    href="https://www.facebook.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    title="Facebook"
  >
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  </a>

  <a
    href="mailto:YOUR_EMAIL@gmail.com"
    aria-label="Gmail"
    title="Gmail"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  </a>
</div>
с удахгүй нэмэгдэнэ</small></>}
      </div></div>}
    </section>
  </main>
}
