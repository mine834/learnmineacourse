"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PURPLE = "#6C5CE7";
const STORAGE_KEY = "learn-minea-assessment";

const styles = {
  visual: {
    visual: {
      background: "#F8F7FF",
    },
  },
};

const methods = {
  visual: {
    emoji: "🎨",
    name: "Харааны болон бүтэцтэй материал",
    description:
      "Зураг, хүснэгт, схем, өнгөөр ялгасан тэмдэглэл чамд илүү тохиромжтой санагддаг.",
    advice:
      "Дүрмээ нэг хүснэгтэд нэгтгээд, жишээ өгүүлбэрийг өнгөөр ялгаж тэмдэглээрэй.",
  },
  auditory: {
    emoji: "🎧",
    name: "Сонсож, тайлбарлуулж сурах",
    description:
      "Сонсох, чангаар давтах, хэн нэгний тайлбарыг сонсох аргыг илүүд үздэг.",
    advice:
      "Богино аудиог сонсоод, дагаж хэлээд, дараа нь өөрийн үгээр тайлбарлаарай.",
  },
  practice: {
    emoji: "🛠️",
    name: "Шууд хэрэглэж сурах",
    description:
      "Шинэ зүйлээ зөвхөн уншихаас илүү дасгал хийж, хэрэглэж үзэхийг илүүд үздэг.",
    advice:
      "Шинэ дүрэм бүрээр 3 өгүүлбэр зохиож, нэгийг нь бодит ярианд хэрэглээрэй.",
  },
  social: {
    emoji: "💬",
    name: "Харилцан ярилцаж сурах",
    description:
      "Хүнтэй ярилцах, асуулт асуух, санаагаа тайлбарлах үед сурах сонирхол чинь нэмэгддэг.",
    advice:
      "Өдөр бүр нэг жижиг асуултад солонгосоор хариулж, боломжтой үедээ хамтрагчтай давтаарай.",
  },
  reading: {
    emoji: "📖",
    name: "Уншиж, задлан ойлгох",
    description:
      "Бичгээр өгсөн тайлбар, жишээ, бүтцийг нягталж сурах аргыг илүүд үздэг.",
    advice:
      "Богино эх уншаад шинэ хэллэгээ тэмдэглэж, өөр өгүүлбэрт ашиглаарай.",
  },
};

const obstacles = {
  vocabulary: {
    emoji: "🧠",
    title: "Үг тогтоох ба эргэн санах",
    detail:
      "Шинэ үгийг таних болон хэрэгтэй үедээ санаж ашиглах хоёр өөр чадвар. Давталтаа хэрэглээтэй хослуулаарай.",
    action:
      "Өдөрт 5–8 үг сонгоод тус бүрээр нь өгүүлбэр зохио. Маргааш нь харахгүйгээр эргэн сана.",
  },
  grammar: {
    emoji: "🧩",
    title: "Дүрмийг бодит хэрэглээнд оруулах",
    detail:
      "Дүрмийн тайлбарыг ойлгох нь эхлэл. Өөрөө өгүүлбэр бүтээх үед мэдлэг илүү хэрэглээтэй болно.",
    action:
      "Нэг дүрэм сонгоод 3 өөр нөхцөлд ашигласан өгүүлбэр бичиж, нэгийг нь чангаар хэл.",
  },
  speaking: {
    emoji: "🗣️",
    title: "Мэддэг зүйлээ ярьж гаргах",
    detail:
      "Мэддэг үг, дүрмээ ярианд ашиглахын тулд бага хэмжээний тогтмол speaking practice хэрэгтэй.",
    action:
      "Өдөр бүр нэг асуултад 30–60 секунд солонгосоор хариулж, дуугаа бичиж сонс.",
  },
  consistency: {
    emoji: "📆",
    title: "Тогтмол сурах хэмнэл",
    detail:
      "Хэт том төлөвлөгөө барихаас илүү бага боловч тогтвортой хийдэг дадал чамд тустай байж болно.",
    action:
      "Эхний 7 хоногт өдөр бүр хийх хамгийн жижиг 10 минутын даалгавраа тогтоо.",
  },
  overwhelm: {
    emoji: "🌪️",
    title: "Олон зүйлээс юуг эхлэхээ сонгох",
    detail:
      "Олон материал, олон зорилго зэрэгцэхэд анхаарал сарних магадлалтай.",
    action:
      "Нэг долоо хоногт нэг үндсэн skill, нэг ном эсвэл нэг төрлийн материалыг гол болго.",
  },
  confidence: {
    emoji: "💜",
    title: "Алдаа гаргахаас эмээх",
    detail:
      "Алдаа гаргах нь сурах үйл явцын нэг хэсэг. Эхлээд аюулгүй, бага дарамттай орчинд дадлага хий.",
    action:
      "Өөртөө зориулж 3 өгүүлбэр чангаар хэл. Дараа нь зөвхөн нэг алдаагаа зас.",
  },
  motivation: {
    emoji: "✨",
    title: "Ахиц болон урам зоригоо хадгалах",
    detail:
      "Ахиц шууд мэдэгдэхгүй үед сурах хүсэл буурах боломжтой. Хийсэн зүйлээ хэмжиж харах нь тустай.",
    action:
      "Өдөр бүр сурсан нэг хэллэг, хийсэн нэг дасгалаа тэмдэглэж 7 хоногийн дараа эргэн хар.",
  },
  focus: {
    emoji: "🎯",
    title: "Анхаарлаа төвлөрүүлэх",
    detail:
      "Сурах орчин болон анхаарал сарниулах зүйлсийг багасгах нь хичээлийн чанарт нөлөөлж болно.",
    action:
      "15 минутын session эхлүүлэхдээ утасны notification-оо хааж, нэг л даалгавар хий.",
  },
};

const skills = {
  speaking: {
    title: "Ярих",
    emoji: "🗣️",
    task: "Нэг сэдвээр 5 өгүүлбэр хэлж, 1 минутын voice recording хийх",
  },
  listening: {
    title: "Сонсох",
    emoji: "🎧",
    task: "1–2 минутын аудиог 2 удаа сонсоод гол санааг хэлэх",
  },
  reading: {
    title: "Унших",
    emoji: "📖",
    task: "Богино эх уншаад 3 гол санаа болон 5 хэрэгтэй хэллэг тэмдэглэх",
  },
  writing: {
    title: "Бичих",
    emoji: "✍️",
    task: "Нэг сэдвээр 5 өгүүлбэр бичээд дүрэм, үгийн сонголтоо шалгах",
  },
};

function option(answers, id) {
  const value = answers?.[id];
  return Number.isInteger(value) && value >= 0 && value <= 3
    ? value
    : null;
}

function analyze(data) {
  const answers = data.answers || {};
  const score = data.score || {};

  const styleScores = {
    visual: (score.visual || 0) + (option(answers, 15) === 0 ? 2 : 0),
    auditory:
      (score.auditory || 0) + (option(answers, 15) === 1 ? 2 : 0),
    practice:
      (score.practice || 0) +
      (score.kinesthetic || 0) +
      (option(answers, 15) === 2 ? 2 : 0),
    social:
      (score.social || 0) + (option(answers, 15) === 3 ? 2 : 0),
    reading: score.reading || 0,
  };

  const topMethods = Object.entries(styleScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => methods[key]);

  const directObstacle = ["vocabulary", "grammar", "speaking", "consistency"][
    option(answers, 10) ?? 3
  ];

  const secondaryObstacle = [
    "overwhelm",
    "motivation",
    "motivation",
    "consistency",
  ][option(answers, 12) ?? 0];

  const obstacle = obstacles[directObstacle];
  const secondary = obstacles[secondaryObstacle];

  const skillScore = {
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0,
  };

  // 5–8-р асуултын бодит хэрэглээний хүндрэлээс skill-ийг тодорхойлно.
  for (let id = 5; id <= 8; id++) {
    const answer = option(answers, id);
    const skill = ["speaking", "listening", "reading", "writing"][id - 5];

    if (answer !== null) {
      skillScore[skill] += answer === 0 ? 0 : answer === 3 ? 3 : 2;
    }
  }

  // 2–3-р асуултын зорилгыг давхар харгалзана.
  if (option(answers, 2) === 2) skillScore.speaking += 2;
  if (option(answers, 2) === 3) skillScore.listening += 2;
  if (option(answers, 3) === 1) skillScore.speaking += 2;
  if (option(answers, 3) === 2) skillScore.listening += 2;

  const priorityKey = Object.entries(skillScore).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const minutes = [15, 35, 60, 20][option(answers, 4) ?? 1];

  const rhythm = [
    "Өдөр бүр бага багаар",
    "7 хоногт 3–4 удаа",
    "Цөөн өдөр гүнзгий",
    "Уян хатан хуваарь",
  ][option(answers, 27) ?? 0];

  const goal = [
    "Шалгалт болон суралцах зорилго",
    "Ажил, карьерын боломж",
    "Чөлөөтэй харилцах",
    "Контент ойлгож, сонирхлоороо сурах",
  ][option(answers, 2) ?? 0];

  const focus = [
    "Сурах аргаа сайжруулах",
    "Гацдаг шалтгаанаа ойлгох",
    "Тогтвортой дадал бий болгох",
    "Хаанаас эхлэхээ тодорхойлох",
  ][option(answers, 28) ?? 0];

  return {
    topMethods,
    obstacle,
    secondary,
    priority: skills[priorityKey],
    minutes,
    rhythm,
    goal,
    focus,
    count: Object.keys(answers).filter(
      (id) => option(answers, id) !== null
    ).length,
  };
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
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
    localStorage.removeItem(STORAGE_KEY);
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
          <p>Эхлээд assessment-ийн асуултуудад хариулаарай.</p>
          <button className="minea-primary" onClick={restart}>
            Assessment эхлүүлэх →
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
          <h1>Чамд тохирох сурах аргыг олъё.</h1>
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
          <h2>Өөртөө тохирсон аргаар, өөрийн хэмнэлээр.</h2>
          <p>
            Энэ үр дүн бол чамайг нэг төрөлд хязгаарласан дүгнэлт
            биш. Сурах арга, дадлаа туршиж сайжруулах эхний зураглал юм.
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
        background: #fbfaff;
        color: #22202b;
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
        background: ${PURPLE};
      }

      .minea-header-tag,
      .minea-number {
        color: #8e88a1;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .minea-hero {
        padding: clamp(35px, 7vw, 75px);
        border-radius: 34px;
        background: linear-gradient(140deg, #eeeaff, #fff 80%);
        border: 1px solid #e9e5ff;
        text-align: center;
      }

      .minea-eyebrow {
        display: inline-block;
        color: ${PURPLE};
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
        font-size: clamp(30px, 5vw, 54px);
        letter-spacing: -0.045em;
        line-height: 1.15;
        margin: 0 auto 20px;
        max-width: 700px;
      }

      .minea-hero p,
      .minea-ending p {
        color: #746f80;
        line-height: 1.8;
        font-size: 16px;
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
        border: 1px solid #e9e5ff;
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
        color: ${PURPLE};
        letter-spacing: 0.1em;
      }

      .minea-section-heading h2 {
        margin: 12px 0;
        font-size: clamp(25px, 4vw, 34px);
        letter-spacing: -0.035em;
      }

      .minea-section-heading p {
        color: #827c8e;
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
        border: 1px solid #eeebf3;
        border-radius: 26px;
        box-shadow: 0 14px 40px rgba(30, 20, 70, 0.035);
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
        background: #f0edff;
        display: grid;
        place-items: center;
        font-size: 28px;
        margin-bottom: 20px;
      }

      .minea-card h3,
      .minea-subtle h3 {
        font-size: 23px;
        margin: 12px 0;
        letter-spacing: -0.025em;
      }

      .minea-card p,
      .minea-subtle p {
        font-size: 15px;
        color: #777180;
        line-height: 1.8;
      }

      .minea-tip {
        margin-top: 22px;
        padding: 18px;
        background: #f8f7ff;
        border-radius: 17px;
        color: #514a66;
        line-height: 1.7;
        font-size: 14px;
      }

      .minea-tip strong {
        display: block;
        color: ${PURPLE};
        margin-bottom: 6px;
      }

      .minea-feature {
        background: linear-gradient(125deg, #fff, #f8f6ff);
      }

      .minea-subtle {
        margin-top: 16px;
        padding: 25px 30px;
        background: #f1efff;
        border-radius: 22px;
      }

      .minea-plan {
        background: white;
        border: 1px solid #eeebf3;
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
        border-top: 1px solid #f0edf5;
      }

      .minea-day {
        flex: 0 0 46px;
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: #f0edff;
        color: ${PURPLE};
        font-weight: 900;
      }

      .minea-plan-row h3 {
        margin: 2px 0 7px;
        font-size: 17px;
      }

      .minea-plan-row p {
        color: #797383;
        line-height: 1.7;
        margin: 0;
        font-size: 14px;
      }

      .minea-ending {
        text-align: center;
        margin-top: 65px;
        padding: 55px 25px;
        border-radius: 30px;
        background: #f0edff;
      }

      .minea-ending > span {
        color: ${PURPLE};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }

      .minea-ending h2 {
        font-size: clamp(26px, 4vw, 38px);
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
        background: ${PURPLE};
        color: white;
        border: 1px solid ${PURPLE};
      }

      .minea-secondary {
        background: white;
        color: #4c4660;
        border: 1px solid #ded8f5;
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
        color: #777180;
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