"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const BLUE = "#0879D1";
import { analyze } from '../../lib/assessmentAnalysis.mjs';
import { ASSESSMENT_KEY, readAssessment } from '../../lib/assessmentLogic.mjs';
const STORAGE_KEY = ASSESSMENT_KEY;

export default function AssessmentResultPage({ planFormUrl }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setData(readAssessment(window.localStorage, window.sessionStorage));
    } catch (error) {
      console.error("Assessment result error:", error);
    }
    setLoaded(true);
  }, []);

  const result = useMemo(
    () => (data?.answers ? analyze(data) : null),
    [data]
  );

  function restart() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try { storage.removeItem(STORAGE_KEY); } catch {}
    }
    router.push("/assessment");
  }

  async function copyResult() {
    if (!result) return;

    const content = [
      "LEARN·MINEA — Миний сурах зураглал",
      `Зорилго: ${result.goal}`,
      `Сурах арга: ${result.topMethods.map((m) => m.name).join(", ")}`,
      `Гол саад: ${result.obstacle.title}`,
      `Анхаарах skill: ${result.priority.title}`,
      `Санал болгох хугацаа: ${result.minutes} минут`,
      `Хэмнэл: ${result.rhythm}`,
      `Дараагийн алхам: ${result.obstacle.action}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!loaded) {
    return (
      <main className="minea-page">
        <p style={{ textAlign: "center", padding: 80 }}>
          Үр дүнг бэлдэж байна...
        </p>
      </main>
    );
  }

  if (!result || result.count === 0) {
    return (
      <main className="minea-page">
        <div className="minea-empty">
          <div className="minea-big-emoji">🌱</div>
          <h1>Одоогоор үр дүн алга байна</h1>
          <p>Эхлээд судалгааны 28 асуултад хариулаарай.</p>
          <button className="minea-primary" onClick={restart}>
            Судалгааг эхлүүлэх →
          </button>
        </div>
        <Style />
      </main>
    );
  }

  const plan = [
    {
      day: "01",
      title: "Эхлэх өдөр",
      detail: `${result.priority.task}. Өнөөдрийн эхний session-аа ${result.minutes} минутын дотор хий.`,
    },
    {
      day: "02",
      title: "Сууриа бэхжүүлэх",
      detail: result.obstacle.action,
    },
    {
      day: "03",
      title: "Шинэ мэдлэгээ хэрэглэх",
      detail: `${result.topMethods[0].advice} Өмнөх өдрийн материалаас 3 зүйлийг эргэн сана.`,
    },
    {
      day: "04",
      title: "Давтах өдөр",
      detail:
        "Өмнөх 3 өдрийн үг, дүрэм, хэллэгээ харахгүйгээр эргэн санаж, алдаагаа тэмдэглэ.",
    },
    {
      day: "05",
      title: "Бодит хэрэглээ",
      detail: `${result.priority.task}. Өмнөх өдрүүдэд сурсан 2 хэллэгийг заавал ашигла.`,
    },
    {
      day: "06",
      title: "Хөнгөн давталт",
      detail:
        "Хэт ачаалал авахгүйгээр 10–15 минут давт. Эсвэл шаардлагатай бол амар.",
    },
    {
      day: "07",
      title: "Ахицын шалгалт",
      detail:
        "Эхний өдөр хийсэн даалгавраа дахин хий. Юу илүү амархан болсныг тэмдэглэ.",
    },
  ];

  return (
    <main className="minea-page">
      <div className="minea-container">
        <header className="minea-header">
          <div className="minea-brand">
            <span className="minea-brand-dot" />
            LEARN·MINEA
          </div>
          <span className="minea-header-tag">PERSONAL LEARNING MAP</span>
        </header>

        <section className="minea-hero">
          <span className="minea-eyebrow">✦ ЧИНИЙ ХУВИЙН ЗУРАГЛАЛ</span>
          <div className="minea-big-emoji">💜</div>
          <h1>Таны сурах зураглал бэлэн боллоо.</h1>
          <p>
            {result.count} асуултад өгсөн хариултыг чинь нэгтгээд
            сурах сонголт, гацдаг хэсэг, дараагийн алхмуудыг гаргалаа.
          </p>
          <div className="minea-tags">
            <span>🎯 {result.goal}</span>
            <span>⏱️ {result.minutes} минут</span>
            <span>🌱 {result.rhythm}</span>
          </div>
        </section>

        {result.count < 28 && (
          <div className="minea-notice">
            Одоогоор {result.count}/28 хариулт хадгалагдсан байна.
            Үлдсэн хариулт байхгүй тул үр дүн хэсэгчилсэн байж болно.
          </div>
        )}

        <div className="minea-section-heading">
          <span>01 / LEARNING APPROACH</span>
          <h2>Чиний илүүд үздэг сурах арга</h2>
          <p>
            Энэ бол өөрчлөгддөггүй төрөл биш, харин хариултаас чинь
            харагдаж байгаа сурах сонголтууд юм.
          </p>
        </div>

        <div className="minea-two-columns">
          {result.topMethods.map((method, index) => (
            <article className="minea-card" key={method.name}>
              <div className="minea-card-top">
                <span className="minea-icon">{method.emoji}</span>
                <span className="minea-number">
                  {index === 0 ? "ГОЛ СОНГОЛТ" : "НЭМЭЛТ АРГА"}
                </span>
              </div>
              <h3>{method.name}</h3>
              <p>{method.description}</p>
              <div className="minea-tip">
                <strong>Туршаад үз</strong>
                {method.advice}
              </div>
            </article>
          ))}
        </div>

        <div className="minea-section-heading">
          <span>02 / YOUR CHALLENGE</span>
          <h2>Хамгийн түрүүнд анхаарах саад</h2>
        </div>

        <article className="minea-card minea-feature">
          <div className="minea-icon">{result.obstacle.emoji}</div>
          <h3>{result.obstacle.title}</h3>
          <p>{result.obstacle.detail}</p>
          <div className="minea-tip">
            <strong>Чиний дараагийн алхам</strong>
            {result.obstacle.action}
          </div>
        </article>

        <article className="minea-subtle">
          <span>НЭМЭЛТ АНХААРАХ ЗҮЙЛ</span>
          <h3>{result.secondary.title}</h3>
          <p>{result.secondary.action}</p>
        </article>

        <div className="minea-section-heading">
          <span>03 / SKILL & ROUTINE</span>
          <h2>Юунд төвлөрч, ямар хэмнэлээр сурах вэ?</h2>
        </div>

        <div className="minea-two-columns">
          <article className="minea-card">
            <div className="minea-icon">{result.priority.emoji}</div>
            <div className="minea-number">АНХААРАХ SKILL</div>
            <h3>{result.priority.title}</h3>
            <p>
              Чиний зорилго болон skill-ийн талаарх хариултуудад
              үндэслэн энэ чадварыг эхний ээлжид түлхүү
              дадлагажуулахыг санал болгож байна.
            </p>
            <div className="minea-tip">
              <strong>Өдөр тутмын дасгал</strong>
              {result.priority.task}
            </div>
          </article>

          <article className="minea-card">
            <div className="minea-icon">⏱️</div>
            <div className="minea-number">СУРАХ ХЭМНЭЛ</div>
            <h3>{result.minutes} минут / session</h3>
            <p>
              {result.rhythm}. Энэ нь чиний сонгосон боломжит
              хугацаа, сурах хэмнэлд тулгуурласан санал юм.
            </p>
            <div className="minea-tip">
              <strong>Санал</strong>
              Эхлээд энэ хэмнэлээ 7 хоног туршаад, хэт их эсвэл
              бага санагдвал тохируулаарай.
            </div>
          </article>
        </div>

        <div className="minea-section-heading">
          <span>04 / YOUR 7-DAY PLAN</span>
          <h2>Чиний эхний 7 хоногийн төлөвлөгөө</h2>
          <p>
            {result.focus} гэсэн хүсэлт болон хариултуудыг чинь
            харгалзсан эхлэх төлөвлөгөө.
          </p>
        </div>

        <section className="minea-plan">
          {plan.map((item) => (
            <div className="minea-plan-row" key={item.day}>
              <div className="minea-day">{item.day}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="minea-ending">
          <span>✦ LEARN·MINEA</span>
          <h2>Өөрт тохирсон нэг сарын төлөвлөгөө авмаар байна уу?</h2>
          <p>Өөрийн зорилго, одоогийн түвшин, боломжит цагтаа тохирсон сурах арга болон нэг сарын төлөвлөгөө авахыг хүсвэл хүсэлтээ үлдээгээрэй.</p>
          <div className="minea-actions">
            {planFormUrl
              ? <a className="minea-primary" href={planFormUrl} target="_blank" rel="noopener noreferrer">Хувийн төлөвлөгөө авах →</a>
              : <p>Төлөвлөгөөний хүсэлт авах 
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
с удахгүй нэмэгдэнэ.</p>}
          </div>
          <p>
            Энэ нь таны өөрийн хариултад үндэслэсэн санал бөгөөд хэлний түвшин тогтоох шалгалт биш.
            Сурах аргаа туршиж, ахицаа ажиглан өөрчилж болно.
          </p>
          <div className="minea-actions">
            <button className="minea-primary" onClick={copyResult}>
              {copied ? "✓ Хуулагдлаа" : "Үр дүнгээ хуулах ↗"}
            </button>
            <button className="minea-secondary" onClick={restart}>
              Дахин бөглөх
            </button>
          </div>
        </div>
      </div>

      <Style />
    </main>
  );
}

function Style() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      .minea-page {
        min-height: 100vh;
        background: #f7fbff;
        color: #142536;
        font-family: inherit;
        overflow-x: hidden;
      }

      .minea-container {
        width: min(1020px, calc(100% - 32px));
        margin: auto;
        padding-bottom: 80px;
      }

      .minea-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 30px 0;
      }

      .minea-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }

      .minea-brand-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${BLUE};
      }

      .minea-header-tag,
      .minea-number {
        color: #7C91A3;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .minea-hero {
        padding: clamp(26px, 5vw, 46px);
        border-radius: 34px;
        background: linear-gradient(140deg, #EAF5FF, #fff 80%);
        border: 1px solid #DDEAF5;
        text-align: center;
      }

      .minea-eyebrow {
        display: inline-block;
        color: ${BLUE};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.1em;
        margin-bottom: 20px;
      }

      .minea-big-emoji {
        font-size: 50px;
        margin-bottom: 16px;
      }

      .minea-hero h1 {
        font-size: clamp(25px, 3.5vw, 36px);
        letter-spacing: -0.045em;
        line-height: 1.15;
        margin: 0 auto 20px;
        max-width: 700px;
      }

      .minea-hero p,
      .minea-ending p {
        color: #64788B;
        line-height: 1.8;
        font-size: 15px;
        max-width: 660px;
        margin: 0 auto;
      }

      .minea-tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 9px;
        margin-top: 28px;
      }

      .minea-tags span {
        padding: 10px 15px;
        background: white;
        border: 1px solid #DDEAF5;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 700;
      }

      .minea-notice {
        margin-top: 20px;
        border-radius: 15px;
        padding: 15px;
        background: #fff5e8;
        color: #8b5c25;
        line-height: 1.6;
      }

      .minea-section-heading {
        margin: 64px 0 22px;
      }

      .minea-section-heading > span,
      .minea-subtle > span {
        font-size: 12px;
        font-weight: 900;
        color: ${BLUE};
        letter-spacing: 0.1em;
      }

      .minea-section-heading h2 {
        margin: 12px 0;
        font-size: clamp(22px, 3vw, 28px);
        letter-spacing: -0.035em;
      }

      .minea-section-heading p {
        color: #64788B;
        line-height: 1.7;
        margin: 0;
      }

      .minea-two-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .minea-card {
        min-width: 0;
        padding: clamp(22px, 4vw, 34px);
        background: white;
        border: 1px solid #DDEAF5;
        border-radius: 26px;
        box-shadow: 0 14px 40px rgba(8, 70, 120, 0.035);
      }

      .minea-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .minea-icon {
        width: 58px;
        height: 58px;
        border-radius: 19px;
        background: #EAF5FF;
        display: grid;
        place-items: center;
        font-size: 28px;
        margin-bottom: 20px;
      }

      .minea-card h3,
      .minea-subtle h3 {
        font-size: 20px;
        margin: 12px 0;
        letter-spacing: -0.025em;
      }

      .minea-card p,
      .minea-subtle p {
        font-size: 15px;
        color: #64788B;
        line-height: 1.8;
      }

      .minea-tip {
        margin-top: 22px;
        padding: 18px;
        background: #F3F9FF;
        border-radius: 17px;
        color: #35546B;
        line-height: 1.7;
        font-size: 14px;
      }

      .minea-tip strong {
        display: block;
        color: ${BLUE};
        margin-bottom: 6px;
      }

      .minea-feature {
        background: linear-gradient(125deg, #fff, #F3F9FF);
      }

      .minea-subtle {
        margin-top: 16px;
        padding: 25px 30px;
        background: #EAF5FF;
        border-radius: 22px;
      }

      .minea-plan {
        background: white;
        border: 1px solid #DDEAF5;
        border-radius: 27px;
        padding: 12px 30px;
      }

      .minea-plan-row {
        display: flex;
        gap: 22px;
        align-items: flex-start;
        padding: 24px 0;
      }

      .minea-plan-row + .minea-plan-row {
        border-top: 1px solid #E7EFF7;
      }

      .minea-day {
        flex: 0 0 46px;
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: #EAF5FF;
        color: ${BLUE};
        font-weight: 900;
      }

      .minea-plan-row h3 {
        margin: 2px 0 7px;
        font-size: 17px;
      }

      .minea-plan-row p {
        color: #64788B;
        line-height: 1.7;
        margin: 0;
        font-size: 14px;
      }

      .minea-ending {
        text-align: center;
        margin-top: 65px;
        padding: 55px 25px;
        border-radius: 30px;
        background: #EAF5FF;
      }

      .minea-ending > span {
        color: ${BLUE};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }

      .minea-ending h2 {
        font-size: clamp(23px, 3vw, 30px);
        letter-spacing: -0.035em;
        margin: 18px auto;
        max-width: 650px;
      }

      .minea-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin-top: 30px;
      }

      .minea-primary,
      .minea-secondary {
        padding: 16px 24px;
        min-height: 54px;
        border-radius: 15px;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        font-family: inherit;
      }

      .minea-primary {
        background: ${BLUE};
        color: white;
        border: 1px solid ${BLUE};
      }

      .minea-secondary {
        background: white;
        color: #35546B;
        border: 1px solid #DDEAF5;
      }

      .minea-empty {
        width: min(520px, calc(100% - 32px));
        margin: 15vh auto;
        padding: 45px 25px;
        background: white;
        border-radius: 25px;
        text-align: center;
      }

      .minea-empty p {
        color: #64788B;
        line-height: 1.7;
        margin-bottom: 25px;
      }

      @media (max-width: 680px) {
        .minea-header-tag {
          display: none;
        }

        .minea-two-columns {
          grid-template-columns: 1fr;
        }

        .minea-header {
          padding: 22px 0;
        }

        .minea-hero {
          border-radius: 24px;
        }

        .minea-section-heading {
          margin-top: 46px;
        }

        .minea-plan {
          padding: 8px 18px;
        }

        .minea-plan-row {
          gap: 13px;
        }

        .minea-ending {
          padding: 40px 20px;
        }

        .minea-actions button {
          width: 100%;
        }
      }
    `}</style>
  );
}