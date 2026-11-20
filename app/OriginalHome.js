'use client'

import Link from 'next/link'
import { TopikInfoSection, GksInfoSection } from './components/InfoSections'
import { useState, useEffect } from 'react'
import { localizeHomeContent, safeHomeLink } from './lib/homeContent.mjs'

const study = [
  {sy:'가',title:'Үгийн сан',desc:'Өдөр тутамд хамгийн түрүүнд хэрэглэх үгс',href:'/books'},
  {sy:'-요',title:'Дүрэм',desc:'Цээжлэх бус, утгаар нь ойлгох дүрэм',href:'/topik'},
  {sy:'말',title:'Бодит яриа',desc:'Нөхцөл бүрд шууд хэрэглэж болох харилцан яриа',href:'#conversation'},
  {sy:'컷',title:'K-Drama',desc:'Киноноос байнга сонсогддог амьд хэллэг',href:'/k-drama'}
]
const samples = [
  {label:'ҮГИЙН САН',title:'Анхан шатны 1000 үг',desc:'Суурь үг, бодит жишээ өгүүлбэр, давтлагын дасгалтай PDF.',price:'29,900₮',tone:'peach'},
  {label:'ШАЛГАЛТ',title:'TOPIK тактик',desc:'Асуултын төрөл, хугацаа хуваарилалт, оноо нэмэх стратеги.',price:'34,900₮',tone:'blue'},
  {label:'ҮГИЙН БҮТЭЦ',title:'Ханзны мастер',desc:'Хамгийн түгээмэл ханзаар солонгос үгийн утга, холбоог ойлго.',price:'32,900₮',tone:'dark'},
  {label:'ЯРИА',title:'Солонгос дахь амьд харилцан яриа',desc:'Кафе, сургууль, ажил, тээвэрт хэрэглэх Real Conversation in Korea.',price:'39,900₮',tone:'peach'}
]
const faqs = [
  ['Анхан шатнаас эхэлж болох уу?','Тийм. Үгийн сан, дүрэм, өдөр тутмын ярианаас өөрийн түвшинд тохирсон материалаа сонгон эхэлж болно.'],
  ['Дижитал номоо хэрхэн үзэх вэ?','Номын сангаас номоо сонгоод “PDF Preview” хэсгээр эхний 5–10 хуудсыг бүртгэлгүй үзэж болно.'],
  ['Хичээлүүд үнэгүй юу?','Сайтын нээлттэй танилцуулга, жишээ хэллэгүүдийг үнэгүй үзнэ. Номын сангийн материалуудын үнэ тус бүрдээ харагдана.'],
  ['TOPIK-д зориулсан материал бий юу?','TOPIK-ийн стратеги, үгийн сан, бэлтгэлийн материалын танилцуулгыг TOPIK болон номын сангийн хэсгээс үзээрэй.']
]

/* LEARNMINEA FULL-PAGE SCROLL REVEAL */
function FullPageScrollReveal() {
  useEffect(() => {
    const site = document.querySelector('.site')
    if (!site) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) return

    // Do not animate the hero: its GSAP timeline is managed separately.
    // Keep interactive content visible until the observer has been attached.
    const selectors = [
      ':scope > section:not(.hero) .studyCard',
      ':scope > section:not(.hero) .bookItem',
      ':scope > section:not(.hero) .reason',
      ':scope > section:not(.hero) .testimonial',
      ':scope > section:not(.hero) .faqItem',
      ':scope > section:not(.hero) .methodCard',
      ':scope > section:not(.hero) .talkCard',
      ':scope > section:not(.hero) .scene',
      ':scope > section:not(.hero) .cta',
      ':scope > section:not(.hero) .splitCopy',
      ':scope > section:not(.hero) .booksHead',
      ':scope > section:not(.hero) .section > .wrap > h2',
      ':scope > .wrap .lmGksPanel',
      ':scope > .wrap .lmTopikInfo',
      ':scope > footer .footerGrid > div',
      ':scope > footer .footerBottom'
    ]
    const items = Array.from(new Set(selectors.flatMap(selector =>
      Array.from(site.querySelectorAll(selector))
    )))
    // Avoid overriding pre-existing dedicated reveals and animation containers.
    const eligible = items.filter(el =>
      !el.closest('.mineaWhyReveal, .mineaRegistrationReveal')
    )
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lmScrollVisible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
    eligible.forEach((el, i) => {
      el.classList.add('lmScrollItem')
      el.style.setProperty('--lm-scroll-delay', `${(i % 4) * 75}ms`)
      // Anything already on screen should not disappear after hydration.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add('lmScrollVisible')
      } else {
        observer.observe(el)
      }
    })
    site.classList.add('lmScrollReady')
    return () => {
      observer.disconnect()
      site.classList.remove('lmScrollReady')
      eligible.forEach(el => {
        el.classList.remove('lmScrollItem', 'lmScrollVisible')
        el.style.removeProperty('--lm-scroll-delay')
      })
    }
  }, [])
  return null
}

/* LEARNMINEA WHY SCROLL REVEAL */
function WhyScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.mineaWhyReveal')
    if (!root) return

    const items = [
      root.querySelector(':scope > div:first-child'),
      ...root.querySelectorAll('.reason')
    ].filter(Boolean)

    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mineaIsVisible')
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -35px 0px'
    })

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return null
}


/* LEARNMINEA REGISTRATION REVEAL V1 */
function RegistrationScrollReveal() {
  useEffect(() => {
    const section = document.querySelector(
      '#registration.mineaRegistrationReveal'
    )
    if (!section) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !('IntersectionObserver' in window)) {
      section.classList.add('mineaRegistrationVisible')
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mineaRegistrationVisible')
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    })

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return null
}




/* LEARNMINEA STEEP CINEMATIC V1 */
function SteepCinematicScroll() {
  useEffect(() => {
    let context = null
    let cancelled = false

    async function setup() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger')
      ])

      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const site = document.querySelector('.site')
      const hero = site?.querySelector(':scope > section.hero')

      if (!site || !hero) return

      const mm = gsap.matchMedia()
      context = mm

      mm.add(
        '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        () => {
          const heroInner = hero.querySelector('.heroInner')
          const heading = hero.querySelector('h1')
          const floating = hero.querySelector('.floating')
          const paragraphs = hero.querySelectorAll('p')
          const buttons = hero.querySelectorAll('a, button')

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: '+=100%',
              pin: true,
              pinSpacing: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          })

          // Hero доторх агуулга эхлээд гүн рүү шилжинэ.
          if (heading) {
            timeline.to(heading, {
              y: -110,
              scale: 0.86,
              opacity: 0,
              duration: 0.7
            }, 0.35)
          }

          if (paragraphs.length) {
            timeline.to(paragraphs, {
              y: -60,
              opacity: 0,
              stagger: 0.06,
              duration: 0.45
            }, 0.45)
          }

          if (buttons.length) {
            timeline.to(buttons, {
              y: -35,
              opacity: 0,
              stagger: 0.025,
              duration: 0.35
            }, 0.6)
          }

          // Бодит Hero дүрслэл томорч, байрлалаа солино.
          if (floating) {
            timeline.fromTo(floating,
              {
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                rotation: 0
              },
              {
                xPercent: -18,
                yPercent: -12,
                scale: 1.4,
                rotation: -5,
                duration: 1.1
              },
              0
            )

            timeline.to(floating, {
              scale: 1.85,
              opacity: 0,
              duration: 0.45
            }, 0.95)
          }

          // Hero-ийн бусад визуал элементүүд
          // өөр хурдтай хөдөлнө.
          const visualCards = hero.querySelectorAll(
            '.heroVisual > *, .heroArt > *, .heroCards > *'
          )

          if (visualCards.length) {
            timeline.fromTo(visualCards,
              {
                y: 0,
                rotation: 0
              },
              {
                y: (index) => index % 2 === 0 ? -95 : 80,
                rotation: (index) => index % 2 === 0 ? -7 : 6,
                stagger: 0.06,
                duration: 1
              },
              0
            )
          }

          if (heroInner) {
            timeline.to(heroInner, {
              opacity: 0,
              duration: 0.35
            }, 1.05)
          }

          // Дараагийн section-уудыг мөн scroll-той
          // уялдуулж, тус бүрийн картыг хөдөлгөнө.
          const sections = gsap.utils.toArray(
            site.querySelectorAll(':scope > section')
          ).filter(section => section !== hero)

          sections.forEach(section => {
            const cards = Array.from(
              section.querySelectorAll(
                '.booksGrid > *, .reason, .testimonialCard'
              )
            )

            if (cards.length) {
              gsap.fromTo(cards,
                {
                  y: (index) => 55 + (index % 3) * 20,
                  opacity: 0.55
                },
                {
                  y: 0,
                  opacity: 1,
                  stagger: 0.08,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    end: 'top 25%',
                    scrub: true
                  }
                }
              )
            }
          })
        }
      )

      ScrollTrigger.refresh()
    }

    setup().catch(error => {
      console.error('LearnMinea cinematic motion:', error)
    })

    return () => {
      cancelled = true
      if (context) context.revert()
    }
  }, [])

  return null
}


/* LEARNMINEA CUSTOM ILLUSTRATIONS V1 */
function LearnMineaIllustrations() {
  useEffect(() => {
    const root = document.querySelector('.site')
    if (!root) return
    const map = [
      [/☁|🌥|🌤|⛅|🌦/u, 'cloud'],
      [/✉|📩|💌|📨|📧/u, 'envelope'],
      [/✏|✎|🖉|📝|✍/u, 'pencil'],
      [/😊|🙂|😄|😀|🥰|😍/u, 'smile'],
      [/⭐|🌟|✨|✦|✧/u, 'star'],
      [/🎨|🖌/u, 'palette'],
      [/❤️|💗|💕|💖|♥/u, 'heart'],
      [/📚|📖|📘|📕|📙/u, 'book'],
      [/🪁/u, 'kite']
    ]
    const decorate = () => {
      const containers = root.querySelectorAll('.floating, .mineacourseDecor')
      containers.forEach(container => {
        container.querySelectorAll('span, i, b, div').forEach(el => {
          if (el.dataset.lmIllustration || el.children.length) return
          const label = (el.textContent || '').trim()
          if (!label || label.length > 8) return
          const found = map.find(([pattern]) => pattern.test(label))
          if (!found) return
          const [, name] = found
          const img = document.createElement('img')
          img.src = '/learnminea-illustrations/' + name + '.svg'
          img.alt = ''
          img.className = 'lmIllustrationImage'
          img.setAttribute('aria-hidden', 'true')
          el.textContent = ''
          el.appendChild(img)
          el.dataset.lmIllustration = name
          el.classList.add('lmIllustrationHolder')
        })
      })
    }
    decorate()
    // MutationObserver handles decorations mounted after language/content changes.
    let busy = false
    const observer = new MutationObserver(() => {
      if (busy) return
      busy = true
      requestAnimationFrame(() => { decorate(); busy = false })
    })
    observer.observe(root, {childList:true, subtree:true})
    return () => observer.disconnect()
  }, [])
  return null
}

export default function Home({ books = [], homeContent = null, editorSettings = {} }) {
  const featuredIds = Array.isArray(homeContent?.books?.featured_book_ids)
    ? homeContent.books.featured_book_ids.filter(Boolean).map(String)
    : []

  const selectedBooks = featuredIds
    .map(id => books.find(book => String(book.id) === id))
    .filter(Boolean)

  const remainingBooks = books.filter(
    book => !selectedBooks.some(selected => String(selected.id) === String(book.id))
  )

  const homepageBooks = [...selectedBooks, ...remainingBooks].slice(0, 4)

  const [lang, setLang] = useState('MN')
  const home = localizeHomeContent(
    homeContent,
    lang === '한국' ? 'KR' : lang
  )
  const url = (value, fallback = '/') =>
    safeHomeLink(value) || fallback

  const realBookImages = books.slice(0, 4).map(book =>
    book.cover_url || book.image_url || book.cover_image_url || ''
  )

 const [search,setSearch]=useState('')
 const [faq,setFaq]=useState(2)
 const [menu,setMenu]=useState(false)
 const [playing,setPlaying]=useState(false)
 const speak=(value)=>{if(typeof window==='undefined'||!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(value);u.lang='ko-KR';u.rate=.85;setPlaying(true);u.onend=()=>setPlaying(false);window.speechSynthesis.speak(u)}
 const searchNow=(e)=>{e.preventDefault();window.location.href='/books?search='+encodeURIComponent(search)}
 return <div className="site" style={{
    '--theme-primary': editorSettings.siteTheme?.primary || '#0879D1',
    '--theme-secondary': editorSettings.siteTheme?.secondary || '#80B8F8',
    '--theme-surface': editorSettings.siteTheme?.surface || '#EAF4FF',
    '--theme-text': editorSettings.siteTheme?.text || '#25364A',
  }}>
    <LearnMineaIllustrations />
    {/* Hero zoom/pin disabled; full-page scroll reveals remain enabled. */}
    <FullPageScrollReveal />
    
    
    
  <header className="header"><Link className="logo" href="/">learnminea<span>.</span></Link><nav className={menu?'nav show':'nav'}><Link href="/">Нүүр</Link><Link href="/topik">TOPIK</Link><Link href="/k-drama">K-Drama</Link><Link href="/books">Цахим ном</Link><Link href="/survey">Сурах</Link></nav><div className="headright"><div className="languages">{['MN','EN','한국'].map(x=><button key={x} onClick={()=>setLang(x)} className={lang===x?'selected':''}>{x}</button>)}</div><Link href="/survey" className="round" aria-label="Судалгаа">♙</Link><Link href="/books" className="round" aria-label="Номын сан"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4H5a2 2 0 0 0-2 2Z"/></svg></Link><button className="round hamburger" onClick={()=>setMenu(!menu)} aria-label="Цэс">☰</button></div></header>
  <section
    className="hero"
    style={{
      background: editorSettings.heroColor || '#79B6FA',
      '--admin-hero-title-size': `${Number(editorSettings.heroFontSize) || 72}px`,
      '--admin-hero-text-size': `${Number(editorSettings.heroTextSize) || 18}px`,
      '--admin-heading-size': `${Number(editorSettings.headingFontSize) || 48}px`,
    }}
  ><div className="heroInner"><div className="heroText"><div
      className="eyebrow white"
      style={{
        fontSize: `${editorSettings.heroEyebrowFontSize ?? 14}px`,
        lineHeight: editorSettings.heroEyebrowLineHeight ?? 1.3,
        letterSpacing: `${editorSettings.heroEyebrowLetterSpacing ?? 3}px`,
      }}
    >
      {(lang !== 'MN' ? home.hero.eyebrow : (editorSettings.heroEyebrow ?? home.hero.eyebrow))}
    </div><h1 style={{
      lineHeight: editorSettings.heroTitleLineHeight ?? 1.05,
      letterSpacing: `${editorSettings.heroTitleLetterSpacing ?? -3}px`,
    }}>
      {(lang !== 'MN' ? home.hero.title : (editorSettings.heroTitle || home.hero.title))}
    </h1><p style={{
      lineHeight: editorSettings.heroSubtitleLineHeight ?? 1.55,
      letterSpacing: `${editorSettings.heroSubtitleLetterSpacing ?? 0}px`,
    }}>
      {(lang !== 'MN' ? home.hero.body : (editorSettings.heroSubtitle ?? home.hero.body))}
    </p><form className="search" onSubmit={searchNow}><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={home.hero.search_placeholder}/><button>{home.hero.search_button}</button></form></div><div className="floating" aria-hidden="true">
      {editorSettings.heroImage &&
        /^https?:\/\//i.test(editorSettings.heroImage) && (
          <img
            src={editorSettings.heroImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          />
        )}<div className="floatCard cardOne">오늘 뭐 해요?</div><div className="floatCard cardTwo">-고 싶어요</div><div className="floatCard cardThree"><small>♬</small>TOPIK II</div><div className="floatCard cardFour">진짜?</div><div
  className="ticket"
  style={{
    top: `${Number(editorSettings.ticketTop ?? 44)}%`,
    left: `${Number(editorSettings.ticketLeft ?? 58)}%`,
    transform: `translate(-50%, -50%) rotate(${Number(editorSettings.ticketRotate ?? 5)}deg) scale(${Number(editorSettings.ticketScale ?? 0.68)})`,
    transformOrigin: 'center center',
    background: editorSettings.ticketBackground || '#fffdfb',
    color: editorSettings.ticketTextColor || '#222032',
    '--ticket-accent': editorSettings.ticketAccentColor || '#ff747b',
  }}
>

<div className="ticketName">
  {editorSettings.ticketTitle ?? 'LEARN ✦ MINEA'}
</div>
<div className="ticketSub">
  {editorSettings.ticketSubtitle ?? 'KOREAN LEARNING · STUDENT PASS'}
</div>
<div className="ticketLine" />
<div className="ticketRows">
  <div className="ticketLabels">
    {String(editorSettings.ticketLabels ?? 'Суралцагч\nСургалт\nСистем\nАхиц')
      .replace(/\\n/g, '\n')
      .split('\n')
      .map((line, i) => <span key={i}>{line}</span>)}
  </div>
  <div className="ticketValues">
    {String(editorSettings.ticketValues ?? 'Таны нэр\nТаны сонголт\nВидео + Quiz\nProgress tracking')
      .replace(/\\n/g, '\n')
      .split('\n')
      .map((line, i) => <strong key={i}>{line}</strong>)}
  </div>
</div>
<div className="ticketLine" />
<div className="ticketBottom">
  {editorSettings.ticketBottom ?? 'START LEARNING →'}
</div>
</div></div></div></section>
  
  <section className="section">
    <div className="wrap">
      <div className="eyebrow">{home.study.eyebrow}</div>
      <h2>{home.study.title}</h2>
      <p className="sub">{home.study.body}</p>

      <div className="studyGrid">
        {home.study.cards.map((item, index) => (
          <Link
            href={index === 0 ? '/books?category=vocabulary#book-catalog' : index === 1 ? '/books?category=grammar#book-catalog' : index === 2 ? '/books?category=conversation#book-catalog' : url(item.url, study[index]?.href || '/books')}
            className="studyCard"
            key={index}
          >
            <span className="sy">{item.symbol}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <span className="arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
  
  {/* Shared public/admin components: identical markup and styles */}
  <div className="wrap"><TopikInfoSection value={home.topikInfo} /></div>
  <div className="wrap" style={{paddingBottom:70}}><GksInfoSection value={home.gksInfo} consultationUrl={editorSettings?.gksConsultationUrl} /></div>

  <section className="section conversation" id="conversation">
    <div className="wrap split">
      <div className="talkCard">
        <div className="talkTop">
          <span>{home.conversation.eyebrow}</span>
          <button
            onClick={() => speak(home.conversation.korean)}
            aria-label="Солонгос дуудлага сонсох"
          >
            {playing ? 'Ⅱ' : '▶'}
          </button>
        </div>

        <h2 lang="ko">{home.conversation.korean}</h2>
        <p>{home.conversation.translation}</p>
        <div className="tip">{home.conversation.tip}</div>
      </div>

      <div className="splitCopy">
        <div className="eyebrow">
          {home.conversation.side_eyebrow}
        </div>
        <h2>{home.conversation.side_title}</h2>
        <p>{home.conversation.side_body}</p>
        <Link
          className="textLink"
          href={url(home.conversation.button_url, '/k-drama')}
        >
          {home.conversation.button_text}
        </Link>
      </div>
    </div>
  </section>
  <section className="section" id="books"><div className="wrap"><div className="booksHead"><div><div className="eyebrow">{home.books.eyebrow}</div><h2>{home.books.title}</h2></div><p>{home.books.body}</p></div><div className="booksGrid">
  {homepageBooks.map((book, i) => {
    const image = book.cover_url || book.image_url || book.cover_image_url || ''

    return (
      <Link
        href={`/books/${book.id}`}
        prefetch={false}
        className="bookItem"
        key={`${book.source || 'book'}-${book.id}`}
      >
        <div className="bookCover">
          {image ? (
            <img
              src={image}
              alt={book.title || 'Цахим ном'}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <span>ЦАХИМ НОМ</span>
          )}
        </div>

        <div className="bookMeta">ДИЖИТАЛ МАТЕРИАЛ · PDF</div>
        <h3>{book.title}</h3>
        <p className="mineaBookShort">{book.short_description || book.shortDescription || ''}</p>
        <div className="mineaBookFooter">
          {book.price != null && (
            <strong className="price">{Number(book.price).toLocaleString('en-US')}₮</strong>
          )}
          <span className="mineaBookOrder">Захиалах</span>
        </div>
      </Link>
    )
  })}
</div>
{books.length === 0 && (
  <p>{home.books.empty_text}</p>
)}
<div className="center"><Link className="blueBtn" href={url(home.books.button_url, "/books")}>{home.books.button_text}</Link></div></div></section>
  <section
    className="section method"
    id="method"
    style={{
      background: home.assessment.style.background,
      paddingTop: home.assessment.style.section_padding,
      paddingBottom: home.assessment.style.section_padding
    }}
  >
    <div className="wrap split">
      <div>
        <div
          className="eyebrow warm"
          style={{
            color: home.assessment.style.eyebrow_color,
            fontSize: home.assessment.style.eyebrow_size
          }}
        >
          {home.assessment.eyebrow}
        </div>

        <h2
          style={{
            color: home.assessment.style.heading_color,
            fontSize: home.assessment.style.heading_size
          }}
        >
          {home.assessment.title}
        </h2>

        <p
          style={{
            color: home.assessment.style.body_color,
            fontSize: home.assessment.style.body_size
          }}
        >
          {home.assessment.body}
        </p>

        <Link
          className="whiteBtn"
          href={url(home.assessment.button_url, '/survey')}
          style={{
            background: home.assessment.style.button_background,
            color: home.assessment.style.button_text_color,
            fontSize: home.assessment.style.button_size
          }}
        >
          {home.assessment.button_text}
        </Link>
      </div>

      <div
        className="methodCard"
        style={{
          background: home.assessment.style.card_background,
          borderColor: home.assessment.style.card_border,
          borderRadius: home.assessment.style.card_radius
        }}
      >
        <div>
          <strong
            style={{
              fontSize: home.assessment.style.duration_size,
              color: home.assessment.style.card_text_color
            }}
          >
            {home.assessment.duration}
          </strong>
          <span>
            {' '}{home.assessment.duration_unit}
          </span>
        </div>
        <hr/>

        {home.assessment.benefits.map((benefit, i) => (
          <p key={i}>
            ✓ &nbsp; {benefit}
          </p>
        ))}
      </div>
    </div>
  </section>

  <section className="section">
    <WhyScrollReveal />
    <div className="wrap split why mineaWhyReveal">
      <div>
        <div className="eyebrow">{home.why.eyebrow}</div>
        <h2>{home.why.title}</h2>
      </div>

      <div className="reasons">
        {home.why.reasons.map((reason, i) => (
          <div className="reason" key={i}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{reason.title}</h3>
              <p>{reason.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  {home.lifestyle.enabled && (<section className="section lifestyle"><div className="wrap split"><div className="scene">
  {home.lifestyle.image_url ? (
    <img
      src={home.lifestyle.image_url}
      alt="Бодит хэрэглээний солонгос хэл"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
      }}
    />
  ) : (
    <>
      <div className="sky"><i/><i/></div>
      <div className="ground"><span>안녕하세요</span></div>
    </>
  )}
</div><div className="splitCopy"><div className="eyebrow">{home.lifestyle.eyebrow}</div><h2>{home.lifestyle.title}</h2><p>{home.lifestyle.body}</p><div className="pills">{home.lifestyle.tags.map((x,i)=><span key={i}>{x}</span>)}</div></div></div></section>)}
  {home.testimonials.enabled !== false && (
    <section className="section testimonials">
      <div className="wrap">
        <div className="eyebrow">
          {home.testimonials.eyebrow || 'СУРАЛЦАГЧДЫН СЭТГЭГДЭЛ'}
        </div>

        <h2>
          {home.testimonials.title ||
            'Суралцагчид LearnMinea-г хэрхэн ашиглаж байна'}
        </h2>

        <div className="testimonialGrid">
          {(home.testimonials.reviews || [])
            .filter(review => review.published && review.text)
            .map((review, index) => (
              <div className="testimonial" key={review.id || index}>
                <span>“</span>
                <p>{review.text}</p>
                <strong>{review.name}</strong>
                <small>{review.caption}</small>
              </div>
            ))}
        </div>
      </div>
    </section>
  )}
    {home.registration.enabled && (
    <section className="section registration mineaRegistrationCompact" id="registration">
      {/* LEARNMINEA COURSE GENIESTUDIO V1 */}
<div className="wrap mineaRegistrationLayout">
        <div className="mineaRegistrationContent">
          <div className="eyebrow">
            {home.registration.eyebrow}
          </div>

          <h2>{home.registration.title}</h2>
          <p className="sub">{home.registration.body}</p>
        </div>

        {home.registration.button_url && (
          <div className="mineaRegistrationAction">
            <a
              className="blueBtn"
              href={url(home.registration.button_url, '#registration')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {home.registration.button_text}
            </a>
          </div>
        )}
      </div>
    </section>
  )}


<style jsx global>{`
/* LearnMinea registration + FAQ compact layout */
.site #faq .faqItem button { font-size: clamp(17px, 1.45vw, 23px) !important; line-height: 1.35; padding: 20px 0 !important; font-family: Arial, 'Noto Sans', sans-serif !important; }
.site #faq .faqItem button span:last-child { font-size: 26px !important; flex: 0 0 auto; }
.site #faq .faqItem p { font-size: 16px !important; line-height: 1.7; margin: 0 0 22px; }
.site #registration.mineaRegistrationCompact { position: relative !important; overflow: hidden; padding: 70px 0 !important; background: #eaf4ff; }
.site #registration .mineaRegistrationLayout { position: relative !important; display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center !important; gap: 40px; min-height: 0 !important; transform: none !important; opacity: 1 !important; }
.site #registration .mineaRegistrationContent { position: static !important; transform: none !important; opacity: 1 !important; min-width: 0; }
.site #registration .mineaRegistrationContent h2 { font-size: clamp(32px, 3.4vw, 52px) !important; line-height: 1.12; }
.site #registration .mineaRegistrationContent .sub { font-size: clamp(15px, 1.15vw, 18px) !important; }
.site #registration .mineaRegistrationAction { position: static !important; inset: auto !important; transform: none !important; opacity: 1 !important; display: flex !important; align-items: center; justify-content: center; margin: 0 !important; width: auto !important; height: auto !important; }
.site #registration .mineaRegistrationAction .blueBtn { display: inline-flex; justify-content: center; align-items: center; width: auto !important; min-width: 160px; max-width: 100%; padding: 14px 28px !important; font-size: 17px !important; border-radius: 999px; }
@media (max-width: 760px) {
 .site #registration.mineaRegistrationCompact { padding: 52px 0 !important; }
 .site #registration .mineaRegistrationLayout { grid-template-columns: 1fr; gap: 22px; }
 .site #registration .mineaRegistrationAction { justify-content: flex-start; }
 .site #faq .faqItem button { font-size: 17px !important; }
}
`}</style>

  <section className="section" id="faq">
    <div className="wrap split faq">
      <div>
        <div className="eyebrow">{home.faq.eyebrow}</div>
        <h2>{home.faq.title}</h2>
      </div>

      <div className="faqList">
        {home.faq.items.map((item, i) => (
          <div className="faqItem" key={i}>
            <button
              onClick={() => setFaq(faq === i ? -1 : i)}
            >
              <span>{item.question}</span>
              <span>{faq === i ? '×' : '+'}</span>
            </button>
            {faq === i && <p>{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="section finalCta">
    <div className="wrap">
      <div className="cta">
        <div>
          <div className="eyebrow warm">
            {home.finalCta.eyebrow}
          </div>
          <h2>{home.finalCta.title}</h2>
          <p>{home.finalCta.body}</p>
        </div>

        <Link
          className="whiteBtn"
          href={url(home.finalCta.button_url, '/survey')}
        >
          {home.finalCta.button_text}
        </Link>
      </div>
    </div>
  </section>
  
<style jsx global>{`
  footer.mineaDarkFooter {
    background: #191a1c !important;
    background-color: #191a1c !important;
    color: #ffffff !important;
  }
  footer.mineaDarkFooter .logo,
  footer.mineaDarkFooter strong {
    color: #ffffff !important;
  }
  footer.mineaDarkFooter p,
  footer.mineaDarkFooter a:not(.logo),
  footer.mineaDarkFooter .footerBottom {
    color: #b9bbc5 !important;
  }
  footer.mineaDarkFooter .footerBottom {
    border-top-color: #44464b !important;
  }
`}</style>

<footer className="footer mineaDarkFooter" style={{backgroundColor:"#191a1c",color:"#ffffff"}}><div className="wrap"><div className="footerGrid"><div><Link className="logo" href="/">{home.footer.logo}<span>.</span></Link><p>{home.footer[lang === "한국" ? "KR" : lang]?.description}</p><div className="social footerSocials">
  <a
    href={home.footer?.instagram || 'https://www.instagram.com/'}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    title="Instagram"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  </a>

  <a
    href={home.footer?.facebook || 'https://www.facebook.com/'}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    title="Facebook"
  >
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/>
    </svg>
  </a>

  <a
    href="/contact" 
    aria-label="Gmail"
    title="И-мэйл"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="m3 7 9 7 9-7"/>
    </svg>
  </a>
</div></div><div><strong>{home.footer[lang === "한국" ? "KR" : lang]?.learn_heading}</strong><Link href="/topik">TOPIK</Link><Link href="/k-drama">K-Drama</Link><Link href="/books">{home.footer[lang === "한국" ? "KR" : lang]?.books}</Link></div><div><strong>{home.footer[lang === "한국" ? "KR" : lang]?.site_heading}</strong><Link href="/">{home.footer[lang === "한국" ? "KR" : lang]?.home}</Link><Link href="/survey">{home.footer[lang === "한국" ? "KR" : lang]?.assessment}</Link><a href="#faq">{home.footer[lang === "한국" ? "KR" : lang]?.faq}</a><Link href="/contact">{home.footer[lang === "한국" ? "KR" : lang]?.contact}</Link></div></div><div className="footerBottom"><span>{home.footer[lang === "한국" ? "KR" : lang]?.copyright}</span><span>{home.footer[lang === "한국" ? "KR" : lang]?.rights}</span></div></div></footer>
  
 </div>
}