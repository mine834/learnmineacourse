"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const themes = [
  {
    id: "original",
    name: "Анхны загвар",
    primary: "#0879D1",
    secondary: "#79B6FA",
    surface: "#EAF4FF",
    text: "#25364A",
  },
  { id:"blue", name:"Minea Blue", primary:"#0879D1", secondary:"#80B8F8", surface:"#EAF4FF", text:"#25364A" },
  { id:"pink", name:"Soft Pink", primary:"#D96BA5", secondary:"#F4BBD6", surface:"#FFF1F8", text:"#493344" },
  { id:"lavender", name:"Lavender", primary:"#7955C9", secondary:"#B9A5F5", surface:"#F3EFFF", text:"#30264B" },
  { id:"sage", name:"Sage Green", primary:"#62856C", secondary:"#B6D1B8", surface:"#F2F8F1", text:"#283C30" },
  { id:"peach", name:"Warm Peach", primary:"#E17F60", secondary:"#F4BEA7", surface:"#FFF4EB", text:"#4B302B" },
  { id:"navy", name:"Navy Gold", primary:"#193C69", secondary:"#D2AD67", surface:"#F7F4EB", text:"#192638" },
  { id:"mono", name:"Minimal Mono", primary:"#262626", secondary:"#A0A0A0", surface:"#F5F5F5", text:"#191919" },
  { id:"mint", name:"Sky Mint", primary:"#138D9A", secondary:"#A5DFD9", surface:"#F0FBFA", text:"#24424B" },
];

export default function ThemePage() {
  const [selected, setSelected] = useState("original");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("site_editor_settings")
        .select("content")
        .eq("id", "homepage")
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage("Ачаалах алдаа: " + error.message);
      } else {
        const content = data?.content || {};
        setSettings(content);
        setSelected(content.siteTheme?.id || "original");
      }
      setLoading(false);
    }

    load();
    return () => { active = false; };
  }, []);

  const current = themes.find(t => t.id === selected) || themes[0];

  async function save() {
    if (saving || loading || settings === null) return;

    setSaving(true);
    setMessage("");

    try {
      const { data: latest, error: readError } = await supabase
        .from("site_editor_settings")
        .select("content")
        .eq("id", "homepage")
        .maybeSingle();

      if (readError) throw readError;

      const next = {
        ...(latest?.content || {}),
        siteTheme: current,
      };

      const { error } = await supabase
        .from("site_editor_settings")
        .upsert({
          id: "homepage",
          content: next,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (error) throw error;

      setSettings(next);
      setMessage("Загвар хадгалагдлаа. Нүүр хуудсаа шинэчилж шалгаарай.");
    } catch (error) {
      setMessage("Хадгалах алдаа: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={{padding:32}}>Загварыг ачаалж байна...</main>;

  return (
    <main style={{background:"#f5f7fb",minHeight:"100vh",padding:"32px 24px 100px"}}>
      <div style={{maxWidth:1050,margin:"auto"}}>
        <p style={{color:"#0879D1",fontWeight:700}}>LEARNMINEA / ADMIN</p>
        <h1 style={{fontSize:36,marginBottom:8}}>Загвар сонгох</h1>
        <p style={{color:"#718096",marginBottom:28}}>
          Өнгөний хослол сонгоход сайтын үндсэн өнгө, Hero, товч болон картын өнгө өөрчлөгдөнө.
        </p>

        <section style={{background:"#fff",padding:26,borderRadius:24,border:"1px solid #dce5ef"}}>
          <h2 style={{marginTop:0}}>Өнгөний хослол</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:15}}>
            {themes.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                style={{
                  background:"#fff",
                  padding:10,
                  borderRadius:15,
                  border:selected===t.id?"3px solid #0879D1":"2px solid #dce5ef",
                  cursor:"pointer",
                  textAlign:"left",
                }}
              >
                <div style={{display:"flex",height:75,overflow:"hidden",borderRadius:10}}>
                  {[t.primary,t.secondary,t.surface,t.text].map((color,i) => (
                    <div key={i} style={{background:color,flex:1}} />
                  ))}
                </div>
                <div style={{padding:"12px 4px 4px",fontWeight:700,color:"#26374a"}}>
                  {t.name} {selected===t.id?"✓":""}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section style={{background:"#fff",padding:26,borderRadius:24,marginTop:22,border:"1px solid #dce5ef"}}>
          <h2 style={{marginTop:0}}>Урьдчилсан харагдац</h2>
          <div style={{background:current.surface,padding:22,borderRadius:18}}>
            <div style={{fontWeight:800,color:current.text,marginBottom:16}}>learnminea.</div>
            <div style={{background:current.secondary,padding:25,borderRadius:14}}>
              <h2 style={{color:current.text,margin:"0 0 12px"}}>
                Хэл сурахад ихийг биш, зөвийг сур.
              </h2>
              <p style={{color:current.text}}>Өөрийн түвшин, зорилгод тохирсон материалаа олоорой.</p>
              <span style={{
                display:"inline-block",background:current.primary,color:"#fff",
                padding:"12px 22px",borderRadius:30,fontWeight:700,
              }}>Эхлэх →</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:16}}>
              {[1,2,3].map(n => (
                <div key={n} style={{background:"#fff",padding:12,borderRadius:12}}>
                  <div style={{height:55,background:current.secondary,borderRadius:8}} />
                  <div style={{height:8,width:"80%",background:current.text,marginTop:12,borderRadius:5}} />
                  <div style={{height:8,width:"55%",background:current.primary,marginTop:8,borderRadius:5}} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={save}
          disabled={saving || settings === null}
          style={{
            marginTop:25,background:"#0879D1",color:"#fff",
            padding:"17px 35px",border:0,borderRadius:14,
            fontSize:17,fontWeight:800,cursor:"pointer",
          }}
        >
          {saving?"Хадгалж байна...":"Загварыг хадгалах"}
        </button>

        {message && <p role="status" style={{marginTop:16}}>{message}</p>}
      </div>
    </main>
  );
}
