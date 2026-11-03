"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import HomeSectionsEditor from "../../content/HomeSectionsEditor";

const titles = {
  hero: "Эхний нүүр / Hero", study: "Өнөөдөр юу сурах вэ?", topikInfo: "TOPIK мэдээлэл",
  gksInfo: "GKS мэдээлэл", conversation: "Харилцан яриа", books: "Цахим номын хэсэг",
  why: "Бидний тухай", lifestyle: "Бодит хэрэглээ", testimonials: "Сэтгэгдэл",
  registration: "Онлайн сургалтын бүртгэл", faq: "Түгээмэл асуулт",
  finalCta: "Сүүлийн уриалга / CTA", footer: "Footer / Холбоо барих", social: "Сошиал хаягууд",
};

export default function SectionAdminPage() {
  const { section } = useParams();
  if (!Object.prototype.hasOwnProperty.call(titles, section)) return <main style={{padding:32}}>Ийм хэсэг олдсонгүй. <Link href="/admin/content">Нийтлэл рүү буцах</Link></main>;
  return (
    <main className="contentAdmin" style={{minHeight:'100vh', background:'#f5f7fb',padding:'34px 24px 100px'}}>
      <div className="contentWrap" style={{maxWidth:1100,margin:'0 auto'}}>
        <p style={{color:'#0879d1',fontSize:12,fontWeight:800,letterSpacing:1.4}}>LEARN·MINEA / ADMIN</p>
        <h1 style={{fontSize:32,color:'#1d2939',marginBottom:8}}>{titles[section]}</h1>
        <p style={{color:'#718096',marginBottom:24}}>Энэ хэсгийн мэдээллийг засаж хадгална. Нүүр хуудастай нэг өгөгдлийн эх сурвалж ашиглана.</p>
        <HomeSectionsEditor selectedSection={section} />
      </div>
    </main>
  );
}
