'use client'
import './site-compact.css'
import './method-compact.css'
import Link from 'next/link'
import { useState } from 'react'

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
export default function Home({ books = [], homeContent = null, editorSettings = {} }) {
  const realBookImages = books.slice(0, 4).map(book =>
    book.cover_url || book.image_url || book.cover_image_url || ''
  )

 const [search,setSearch]=useState('')
 const [faq,setFaq]=useState(2)
 const [menu,setMenu]=useState(false)
 const [lang,setLang]=useState('MN')
 const [playing,setPlaying]=useState(false)
 const speak=(value)=>{if(typeof window==='undefined'||!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(value);u.lang='ko-KR';u.rate=.85;setPlaying(true);u.onend=()=>setPlaying(false);window.speechSynthesis.speak(u)}
 const searchNow=(e)=>{e.preventDefault();window.location.href='/books?search='+encodeURIComponent(search)}
 return <div className="site">
  <header className="header"><Link className="logo" href="/">learnminea<span>.</span></Link><nav className={menu?'nav show':'nav'}><Link href="/">Нүүр</Link><Link href="/topik">TOPIK</Link><Link href="/k-drama">K-Drama</Link><Link href="/books">Цахим ном</Link><a href="#method">Сурах</a></nav><div className="headright"><div className="languages">{['MN','EN','한국'].map(x=><button key={x} onClick={()=>setLang(x)} className={lang===x?'selected':''}>{x}</button>)}</div><Link href="/survey" className="round" aria-label="Судалгаа">♙</Link><Link href="/books" className="round" aria-label="Номын сан">▣</Link><button className="round hamburger" onClick={()=>setMenu(!menu)} aria-label="Цэс">☰</button></div></header>
  <section
    className="hero"
    style={{
      '--admin-hero-title-size': `${Number(editorSettings.heroFontSize) || 72}px`,
      '--admin-hero-text-size': `${Number(editorSettings.heroTextSize) || 18}px`,
      '--admin-heading-size': `${Number(editorSettings.headingFontSize) || 48}px`,
    }}
  ><div className="heroInner"><div className="heroText"><div className="eyebrow white">ӨӨРИЙН ХЭМНЭЛЭЭР, БОДИТ ХЭРЭГЛЭЭНЭЭС</div><h1>
      {editorSettings.heroTitle || 'Хэл сурахад ихийг биш, зөвийг сур.'}
    </h1><p>Хэл сурахад ихийг биш, зөвийг сур. Өөрийн түвшин, зорилго, сурах арга барилдаа тохирсон хичээл, цахим ном, бодит хэрэглээний материалаа нэг дороос олоорой.</p><form className="search" onSubmit={searchNow}><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Жишээ нь: кафед хэрхэн захиалах вэ?"/><button>Хайх&nbsp; →</button></form></div><div className="floating" aria-hidden="true"><div className="floatCard cardOne">오늘 뭐 해요?</div><div className="floatCard cardTwo">-고 싶어요</div><div className="floatCard cardThree"><small>♬</small>TOPIK II</div><div className="floatCard cardFour">진짜?</div><div
  className="ticket"
  style={{
    top: `${Number(editorSettings.ticketTop ?? 44)}%`,
    left: `${Number(editorSettings.ticketLeft ?? 58)}%`,
    transform: `rotate(${Number(editorSettings.ticketRotate ?? 5)}deg) scale(${Number(editorSettings.ticketScale ?? 0.68)})`,
    transformOrigin: 'center center',
  }}
><div className="ticketName">LEARN <b>✦</b> MINEA</div><div className="ticketSub">KOREAN LEARNING · STUDENT PASS</div><div className="ticketLine"/><div className="ticketRows"><span>Суралцагч<br/>Сургалт<br/>Систем<br/>Ахиц</span><strong>Таны нэр<br/>Таны сонголт<br/>Видео + Quiz<br/>Progress tracking</strong></div><div className="ticketLine"/><div className="ticketBottom">START LEARNING →</div></div></div></div></section>
  <section className="section"><div className="wrap"><div className="eyebrow">ЭХЛЭХ ХЭСЭГ</div><h2>Өнөөдөр юу сурах вэ?</h2><p className="sub">Өнөөдөр танд хэрэгтэй нэг жижиг сэдвээс эхлээд тогтвортой урагшлаарай.</p><div className="studyGrid">{study.map(x=><Link href={x.href} className="studyCard" key={x.title}><span className="sy">{x.sy}</span><div><h3>{x.title}</h3><p>{x.desc}</p></div><span className="arrow">→</span></Link>)}</div></div></section>
  <section className="section conversation" id="conversation">
    <div className="wrap split">
      <div className="talkCard">
        <div className="talkTop">
          <span>{homeContent?.conversation?.eyebrow ?? 'ӨНӨӨДРИЙН ЯРИА'}</span>
          <button
            onClick={() => speak(homeContent?.conversation?.korean ?? '아이스 아메리카노 한 잔 주세요.')}
            aria-label="Солонгос дуудлага сонсох"
          >
            {playing ? 'Ⅱ' : '▶'}
          </button>
        </div>
        <h2 lang="ko">{homeContent?.conversation?.korean ?? '아이스 아메리카노 한 잔 주세요.'}</h2>
        <p>{homeContent?.conversation?.translation ?? 'Нэг мөстэй американо өгнө үү.'}</p>
        <div className="tip">
          {homeContent?.conversation?.tip ?? '📌 한 잔 нь аяга уух зүйл тоолох хэллэг. 주세요-г хүсэлтээ эелдгээр хэлэхдээ ашиглана.'}
        </div>
      </div>
      <div className="splitCopy">
        <div className="eyebrow">{homeContent?.conversation?.side_eyebrow ?? 'АМЬД ХЭРЭГЛЭЭНИЙ СОЛОНГОС ХЭЛ'}</div>
        <h2>{homeContent?.conversation?.side_title ?? 'Солонгос хэлийг амьд хэрэглээнээс сур'}</h2>
        <p>{homeContent?.conversation?.side_body ?? 'Дүрмийг дангаар нь бус, яг хэрэглэх нөхцөл, өнгө аяс, богино жишээтэй нь ойлгоно.'}</p>
        <Link className="textLink" href={homeContent?.conversation?.button_url || '/k-drama'}>
          {homeContent?.conversation?.button_text ?? 'Дэлгэрэнгүй үзэх →'}
        </Link>
      </div>
    </div>
  </section>
  <section className="section" id="books"><div className="wrap"><div className="booksHead"><div><div className="eyebrow">ЦАХИМ НОМЫН САН</div><h2>Хаана ч авч явах сурах<br/>материал</h2></div><p>Татаж аваад өөрийн хурдаар ажиллах, тодорхой зорилготой таван цуглуулга.</p></div><div className="booksGrid">
  {books.slice(0, 4).map((book, i) => {
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
        

        {book.price != null && (
          <strong className="price">
            {Number(book.price).toLocaleString('en-US')}₮
          </strong>
        )}
      </Link>
    )
  })}
</div>
{books.length === 0 && (
  <p>Одоогоор нийтлэгдсэн цахим ном байхгүй байна.</p>
)}
<div className="center"><Link className="blueBtn" href="/books">Бүх номыг үзэх →</Link></div></div></section>
  <section className="section method" id="method"><div className="wrap split"><div><div className="eyebrow warm">СУРАХ АРГА БАРИЛ</div><h2>Танд тохирох сурах аргаа олъё</h2><p>15–20 минутын асуулгаар таны зорилго, одоогийн арга, боломжит цагийг тодруулж, бодит төлөвлөгөө санал болгоно.</p><Link className="whiteBtn" href="/survey">Үнэлгээг эхлүүлэх &nbsp; →</Link></div><div className="methodCard"><div><strong>15–20</strong><span> минут</span></div><hr/><p>✓ &nbsp; Сурах арга барил</p><p>✓ &nbsp; Хувийн хөтөлбөр</p><p>✓ &nbsp; Дөрвөн чадварын тэнцвэр</p></div></div></section>
  <section className="section"><div className="wrap split why"><div><div className="eyebrow">ЯАГААД LEARNMINEA ВЭ</div><h2>Илүү их контент биш. Илүү зөв чиглэл.</h2></div><div className="reasons">{[['Бүгдийг биш, хэрэгтэйг','Таны зорилгод хүргэх үг, дүрэм, нөхцөлд төвлөрнө.'],['Цээжлэхээс илүү ойлгох','Яагаад ингэж хэлдгийг утга, холбоо, жишээгээр тайлбарлана.'],['Цагаа үр дүнтэй ашиглах','Богино хичээл бүр тодорхой нэг үр дүнтэй.'],['Материал дээр нэмэх нь чиглүүлэг','Дижитал материалаа хэрхэн ашиглах алхмыг хамт өгнө.']].map((x,i)=><div className="reason" key={i}><span>0{i+1}</span><div><h3>{x[0]}</h3><p>{x[1]}</p></div></div>)}</div></div></section>
  <section className="section lifestyle"><div className="wrap split"><div className="scene">
  {homeContent?.lifestyle?.image_url ? (
    <img
      src={homeContent.lifestyle.image_url}
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
</div><div className="splitCopy"><div className="eyebrow">БОДИТ АМЬДРАЛ, БОДИТ ХЭЛ</div><h2>Хичээлээс гараад шууд хэрэглэгддэг хэл</h2><p>Кафе, сургууль, ажил, нийтийн тээвэр, өдөр тутмын уулзалт. Амьдрал дээр танд хэрэг болох мөчөөс хичээл эхэлнэ.</p><div className="pills">{['Кафе','Сургууль','Ажил','Тээвэр','Өдөр тутам'].map(x=><span key={x}>{x}</span>)}</div></div></div></section>
  {homeContent?.testimonials?.enabled !== false && (
    <section className="section testimonials">
      <div className="wrap">
        <div className="eyebrow">
          {homeContent?.testimonials?.eyebrow || 'СУРАЛЦАГЧДЫН СЭТГЭГДЭЛ'}
        </div>

        <h2>
          {homeContent?.testimonials?.title ||
            'Суралцагчид LearnMinea-г хэрхэн ашиглаж байна'}
        </h2>

        <div className="testimonialGrid">
          {(homeContent?.testimonials?.reviews || [])
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
  <section className="section"><div className="wrap split faq"><h2>Түгээмэл асуулт</h2><div className="faqList">{faqs.map((x,i)=><div className="faqItem" key={i}><button onClick={()=>setFaq(faq===i?-1:i)}><span>{x[0]}</span><span>{faq===i?'×':'+'}</span></button>{faq===i&&<p>{x[1]}</p>}</div>)}</div></div></section>
  <section className="section finalCta"><div className="wrap"><div className="cta"><div><div className="eyebrow warm">LEARNMINEA</div><h2>Хэл сурах нэг л зөв арга гэж<br/>байхгүй.</h2><p>Танд тохирох арга, ойлгомжтой тайлбар, тогтвортой жижиг алхам байхад хангалттай.</p></div><Link className="whiteBtn" href="/survey">Өөрийн аргаа олох →</Link></div></div></section>
  <footer className="footer"><div className="wrap"><div className="footerGrid"><div><Link className="logo" href="/">learnminea<span>.</span></Link><p>Хэл сурахыг өөртөө ойр, амьдралд хэрэгтэй болгоно.</p><div className="social footerSocials">
  {homeContent?.footer?.instagram && (
    <a href={homeContent.footer.instagram}
       target="_blank" rel="noopener noreferrer"
       aria-label="Instagram" title="Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </a>
  )}
  {homeContent?.footer?.facebook && (
    <a href={homeContent.footer.facebook}
       target="_blank" rel="noopener noreferrer"
       aria-label="Facebook" title="Facebook">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/>
      </svg>
    </a>
  )}
  {homeContent?.footer?.email && (
    <a href={'mailto:' + homeContent.footer.email}
       aria-label="Gmail" title="И-мэйл">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="m3 7 9 7 9-7"/>
      </svg>
    </a>
  )}
</div></div><div><strong>СУРАХ</strong><Link href="/topik">TOPIK</Link><Link href="/k-drama">K-Drama</Link><Link href="/books">Цахим ном</Link></div><div><strong>LEARNMINEA</strong><Link href="/">Нүүр</Link><Link href="/survey">Сурах арга барил</Link><a href="#faq">Түгээмэл асуулт</a><a href="mailto:hello@learnminea.com">Холбоо</a></div></div><div className="footerBottom"><span>© 2026 LearnMinea. Бүх эрх хуулиар хамгаалагдсан.</span><span>Дижитал материалын эрх, таталтыг серверээр баталгаажуулна.</span></div></div></footer>
  <style jsx global>{`

  .footerSocials {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
  }
  .footerSocials a {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff !important;
    transition: opacity .2s, transform .2s;
  }
  .footerSocials a:hover {
    opacity: .7;
    transform: translateY(-2px);
  }
  .footerSocials svg {
    display: block;
    width: 22px;
    height: 22px;
  }

  *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:#191a1d;background:white;font-family:Arial,'Noto Sans',sans-serif}.site a{text-decoration:none;color:inherit}.site button,.site input{font:inherit}.site button{cursor:pointer}.site h1,.site h2,.site h3,.site .logo,.site .bookCover strong,.site .floatCard,.site .ticketName{font-family:Georgia,'Times New Roman',serif;font-weight:400}.wrap{width:min(1440px,90%);margin:auto}.header{height:88px;padding:0 4.3%;display:flex;align-items:center;justify-content:space-between;background:#75b4fb;border-bottom:1px solid #ffffff55;gap:20px}.logo{font-size:32px;letter-spacing:-1.3px;white-space:nowrap}.logo span{color:#008fff}.nav{display:flex;gap:34px;align-items:center;font-size:16px}.nav a:hover{color:#fff}.headright{display:flex;align-items:center;gap:12px}.languages{display:flex;align-items:center;padding:4px;background:#ffffff80;border-radius:35px}.languages button{border:0;background:transparent;border-radius:30px;padding:10px;font-size:11px}.languages .selected{background:white}.round{width:49px;height:49px;border-radius:50%;background:#ffffffaa;border:0;display:grid;place-items:center;font-size:23px}.hamburger{display:none}.hero{background:linear-gradient(125deg,#67aaf9 0%,#81bafc 62%,#b3d8ff 100%);min-height:810px;overflow:hidden}.heroInner{width:min(1500px,92%);min-height:810px;margin:auto;display:grid;grid-template-columns:52% 48%;align-items:center}.heroText{padding:65px 0 105px}.eyebrow{font-size:14px;letter-spacing:3px;color:#0079dc;font-weight:600;margin-bottom:28px}.eyebrow.white{color:#fff}.eyebrow.warm{color:#f6d6c6}.hero h1{font-size:clamp(64px,6.5vw,116px);line-height:.94;letter-spacing:-3px;color:white;margin:0 0 36px}.heroText>p{font-size:20px;line-height:1.55;color:#465d70;max-width:690px;margin:0 0 38px}.search{display:flex;align-items:center;background:white;padding:8px 9px 8px 22px;border-radius:45px;max-width:710px;box-shadow:0 9px 18px #2a6ca03b;gap:15px}.search span{font-size:32px;color:#7b8390}.search input{flex:1;min-width:0;border:0;outline:0;font-size:17px}.search button,.blueBtn{border:0;background:#009afa;color:white!important;padding:18px 29px;border-radius:40px;box-shadow:0 5px 0 #0075c4;font-size:18px;white-space:nowrap}.floating{position:relative;height:680px}.floatCard{position:absolute;background:#eaf3ff;border-radius:20px;padding:26px 32px;font-size:30px;box-shadow:0 15px 30px #3074ad3b;white-space:nowrap}.cardOne{top:60px;left:8%;transform:rotate(-5deg)}.cardTwo{top:220px;right:-8%;transform:rotate(5deg)}.cardThree{bottom:140px;left:18%;transform:rotate(-3deg)}.cardThree small{display:block;color:#009afa;font:18px Arial}.cardFour{bottom:80px;right:3%;transform:rotate(6deg)}.ticket{position:absolute;top:265px;left:35%;width:300px;padding:19px 18px;background:#fffdfb;border-radius:9px;box-shadow:0 16px 45px #1b6ea04a;transform:rotate(-5deg);font-family:Arial,sans-serif}.ticketName{font-family:Arial!important;font-size:22px;font-weight:900!important;letter-spacing:-1px;color:#222032}.ticketName b{color:#ff747b}.ticketSub{font-size:8px;letter-spacing:2px;color:#84818e;margin:9px 0 16px}.ticketLine{border-top:2px dashed #d8d1e5}.ticketRows{display:flex;justify-content:space-between;gap:8px;font-size:11px;line-height:2.1;color:#85818b;padding:12px 0}.ticketRows strong{text-align:right;color:#252235}.ticketBottom{font-weight:800;color:#7561ef;font-size:12px;margin-top:10px}.section{padding:110px 0}.section h2{font-size:clamp(42px,4.1vw,72px);line-height:1.08;letter-spacing:-1.8px;margin:0}.section .sub,.section p{color:#818694;line-height:1.55}.sub{font-size:22px;margin:8px 0 55px}.studyGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:60px}.studyCard{background:#f9f9fb;border:1px solid #e1e3e8;border-radius:26px;min-height:350px;padding:33px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .2s,box-shadow .2s}.studyCard:hover{transform:translateY(-5px);box-shadow:0 15px 30px #00000010}.sy{background:white;border-radius:50%;width:75px;height:75px;display:grid;place-items:center;font:30px Georgia;color:#633623}.studyCard h3{font-size:37px;margin:0 0 16px}.studyCard p{font-size:18px;margin:0}.studyCard .arrow{text-align:right;font-size:30px}.conversation,.testimonials{background:#f9f9fb}.split{display:grid;grid-template-columns:1fr 1fr;gap:9%;align-items:center}.talkCard{background:white;border-radius:32px;padding:48px;box-shadow:0 20px 30px #00000012}.talkTop{display:flex;justify-content:space-between;align-items:center;color:#848694;letter-spacing:2px}.talkTop button{border:0;border-radius:50%;width:65px;height:65px;background:#009afa;color:white;font-size:26px}.talkCard h2{font-size:clamp(45px,4.2vw,70px);margin:65px 0 20px;line-height:1.18}.talkCard>p{font-size:24px}.tip{background:#ffe0ce;border-radius:20px;padding:24px;color:#623e30;line-height:1.6;font-size:17px;margin-top:35px}.splitCopy>p{font-size:22px;margin:35px 0 48px}.textLink{font-size:22px;color:#0075d9!important;font-weight:600}.booksHead{display:flex;align-items:end;justify-content:space-between;gap:50px;margin-bottom:55px}.booksHead>p{font-size:20px;max-width:430px}.booksGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.bookCover{aspect-ratio:.78;border-radius:7px 20px 20px 7px;display:flex;flex-direction:column;justify-content:space-between;padding:0;box-shadow:none;transition:transform .2s}.bookItem:hover .bookCover{transform:translateY(-6px)}.bookCover.peach{background:transparent;color:inherit}.bookCover.blue{background:transparent;color:inherit}.bookCover.dark{background:transparent;color:inherit}.bookCover span,.bookCover small{font-size:11px;letter-spacing:1.5px;font-family:Arial;font-weight:700}.bookCover strong{font-size:clamp(27px,2.4vw,42px);line-height:1.12}.bookMeta{font-size:12px;letter-spacing:1px;color:#8b8e99;margin-top:30px}.bookItem h3{font-size:25px;margin:10px 0 5px}.bookItem p{font-size:16px;margin:0 0 14px}.price{font-size:18px}.center{text-align:center;margin-top:50px}.center .blueBtn{display:inline-block}.note{font-size:12px!important;color:#9a9ca5!important;margin-top:22px}.method{background:#191a1c;color:white}.method h2{max-width:780px}.method .split>div>p{font-size:22px;color:#9fa0a8;margin:40px 0}.whiteBtn{display:inline-block;border-radius:45px;background:white;color:#18191b!important;padding:21px 32px;font-weight:600;font-size:19px}.methodCard{background:#28292b;border:1px solid #4b4c4e;border-radius:32px;padding:55px}.methodCard strong{font:100px Georgia}.methodCard span{color:#a4a6ac}.methodCard hr{border:0;border-top:1px solid #555;margin:25px 0 35px}.methodCard p{color:white!important;font-size:22px;margin:15px 0}.why{align-items:start}.reasons{border-top:1px solid #e3e4e7}.reason{display:grid;grid-template-columns:90px 1fr;border-bottom:1px solid #e3e4e7;padding:35px 0}.reason>span{color:#007ee5}.reason h3{font-size:37px;margin:0 0 12px}.reason p{font-size:18px;margin:0}.lifestyle{background:#ffe1d0}.scene{border:0;outline:0;border-radius:34px;overflow:hidden;height:510px;padding:0;background:transparent;box-shadow:none}.scene>img{display:block;width:100%;height:100%;object-fit:cover;border-radius:34px}.sky{height:58%;background:#a7d3fb;display:flex;align-items:center;justify-content:space-around}.sky i{background:#e0f1ff;width:22%;height:60px;border-radius:50%}.ground{height:42%;background:#5c2c1c;display:grid;place-items:center}.ground span{background:white;border-radius:50px;padding:16px 35px;font:33px Georgia;transform:rotate(-5deg);color:#633521}.pills{display:flex;gap:12px;flex-wrap:wrap}.pills span{border:1px solid #d9b8a7;border-radius:30px;padding:11px 20px;color:#643b2e}.testimonials h2{margin-bottom:55px}.testimonialGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.testimonial{background:white;border:1px solid #e2e4e9;border-radius:30px;padding:40px;min-height:350px;display:flex;flex-direction:column}.testimonial>span{font:75px Georgia;color:#009afa;line-height:.7}.testimonial p{font:26px/1.35 Georgia;color:#191a1c;flex:1}.testimonial strong{margin-top:25px}.testimonial small{color:#8c909c;margin-top:8px}.faq{align-items:start}.faqList{border-top:1px solid #ddd}.faqItem{border-bottom:1px solid #ddd}.faqItem button{display:flex;width:100%;align-items:center;justify-content:space-between;text-align:left;gap:20px;background:transparent;border:0;padding:32px 0;font:30px Georgia}.faqItem button span:last-child{font:34px Arial}.faqItem p{font-size:20px;margin:0 0 35px}.finalCta{padding-top:25px}.cta{background:#5a2d1d;color:white;border-radius:30px;padding:70px;display:flex;align-items:end;justify-content:space-between;gap:30px}.cta h2{font-size:clamp(42px,3.8vw,64px)}.cta p{color:#e9c9b8;font-size:18px;max-width:600px}.footer{background:#191a1c;color:white;padding:60px 0 22px}.footerGrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px}.footer .logo{font-size:30px}.footerGrid p{max-width:270px;color:#9b9da7;line-height:1.6}.footerGrid>div:not(:first-child){display:flex;flex-direction:column;gap:17px}.footerGrid strong{font-size:11px;letter-spacing:2px}.footerGrid a:not(.logo){color:#a4a6af}.footerBottom{border-top:1px solid #444;margin-top:55px;padding-top:20px;display:flex;justify-content:space-between;gap:20px;font-size:11px;color:#8c8e98}
  @media(max-width:1050px){.nav{gap:14px}.heroInner{grid-template-columns:1fr}.heroText{padding:90px 0 30px}.hero{min-height:unset}.floating{height:480px}.ticket{top:120px;left:38%}.cardOne{top:25px}.cardTwo{top:100px;right:2%}.cardThree{bottom:40px}.cardFour{bottom:35px}.studyGrid,.booksGrid{grid-template-columns:repeat(2,1fr)}.split{gap:5%}.section{padding:75px 0}}
  @media(max-width:700px){.header{height:75px;padding:0 5%}.logo{font-size:26px}.headright{gap:6px}.round{width:38px;height:38px;font-size:19px}.hamburger{display:grid}.nav{display:none;position:absolute;top:75px;left:0;right:0;background:#81bafc;z-index:10;flex-direction:column;padding:25px;align-items:start}.nav.show{display:flex}.languages button{padding:8px 6px}.heroInner{width:90%}.heroText{padding:80px 0 20px}.hero h1{font-size:clamp(55px,13vw,85px);letter-spacing:-2px}.heroText>p{font-size:16px}.eyebrow{font-size:11px;letter-spacing:2px}.search{padding:6px 6px 6px 15px}.search input{font-size:13px}.search button{padding:13px 18px;font-size:14px}.floating{height:400px}.floatCard{font-size:20px;padding:18px}.ticket{top:135px;left:22%;width:240px}.cardOne{left:0}.cardTwo{top:65px;right:-8%}.cardThree{bottom:22px;left:2%}.cardFour{bottom:0;right:-5%}.section{padding:70px 0}.section h2{font-size:clamp(38px,10vw,55px)}.sub{font-size:17px}.studyGrid,.booksGrid,.testimonialGrid{grid-template-columns:1fr}.studyCard{min-height:270px}.split{grid-template-columns:1fr;gap:50px}.talkCard{padding:27px}.talkCard h2{margin:40px 0 20px}.booksHead{display:block}.booksHead>p{font-size:17px}.booksGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.bookCover{padding:15px}.bookCover strong{font-size:24px}.bookItem h3{font-size:20px}.bookItem p{font-size:14px}.bookMeta{font-size:10px}.methodCard{padding:30px}.methodCard strong{font-size:75px}.scene{height:320px}.cta{padding:35px;display:block}.cta .whiteBtn{margin-top:20px}.footerGrid{grid-template-columns:1fr 1fr}.footerGrid>div:first-child{grid-column:1/-1}.footerBottom{display:block}.faqItem button{font-size:23px}}
  .site .hero h1 {
    font-size: clamp(32px, 6.5vw, var(--admin-hero-title-size)) !important;
    white-space: pre-line;
  }
  .site .heroText > p {
    font-size: var(--admin-hero-text-size) !important;
  }
  `}


</style>
 </div>
}