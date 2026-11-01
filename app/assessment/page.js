"use client";

import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const router = useRouter();

  return (
    <main className="assessment">
      <div className="topbar">
        <button onClick={() => router.push("/")} className="back">
          ← Нүүр хуудас
        </button>
        <span className="brand">LEARN·MINEA</span>
      </div>

      <section className="intro">
        <div className="icon">🧠</div>

        <div className="eyebrow">PERSONALIZED LEARNING ASSESSMENT</div>

        <h1>
          Чамд яг тохирох
          <br />
          <span>сурах аргыг олъё.</span>
        </h1>

        <p className="description">
          Солонгос хэл сурах зорилго, одоогийн түвшин,
          хамгийн их гацдаг зүйл болон сурах хэв маягийг
          чинь тодорхойлно.
        </p>

        <div className="stats">
          <Info value="06" label="Хэсэг" />
          <Info value="28" label="Асуулт" />
          <Info value="~5" label="Минут" />
        </div>

        <button
          className="start"
          onClick={() => router.push("/assessment/questions")}
        >
          Судалгааг эхлүүлэх <span>→</span>
        </button>

        <div className="note">
          <span>✦</span> Зөв, буруу хариулт байхгүй. Өөртөө үнэнчээр хариулаарай.
        </div>
      </section>

      <style jsx>{`
        .assessment {
          min-height: 100vh;
          background:
            radial-gradient(circle at 80% 20%, #EAF5FF 0%, transparent 35%),
            radial-gradient(circle at 10% 90%, #EAF5FF 0%, transparent 35%),
            #F3F9FF;
          padding: 28px 6% 90px;
          color: #142536;
        }

        .topbar {
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back {
          background: none;
          border: 0;
          color: #64788B;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .brand {
          font-size: 13px;
          font-weight: 900;
          color: #0879D1;
          letter-spacing: 0.15em;
        }

        .intro {
          max-width: 860px;
          margin: 44px auto 0;
          background: white;
          border: 1px solid #DDEAF5;
          border-radius: 32px;
          padding: 42px 36px;
          text-align: center;
          box-shadow: 0 24px 70px rgba(8, 70, 120, 0.07);
        }

        .icon {
          width: 88px;
          height: 88px;
          margin: 0 auto 28px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background: #EAF5FF;
          font-size: 39px;
        }

        .eyebrow {
          color: #0879D1;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        h1 span {
          color: #0879D1;
        }

        .description {
          max-width: 590px;
          margin: 25px auto 0;
          font-size: 15px;
          line-height: 1.85;
          color: #64788B;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          max-width: 510px;
          margin: 42px auto 0;
          border: 1px solid #DDEAF5;
          border-radius: 20px;
          background: #F7FBFF;
          overflow: hidden;
        }

        .start {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          margin-top: 38px;
          min-width: 255px;
          padding: 18px 27px;
          background: #0879D1;
          border: 0;
          border-radius: 999px;
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(8, 121, 209, 0.22);
          transition: transform 0.2s, background 0.2s;
        }

        .start:hover {
          background: #0669B7;
          transform: translateY(-2px);
        }

        .start span {
          font-size: 22px;
        }

        .note {
          margin-top: 23px;
          color: #7C91A3;
          font-size: 12px;
          line-height: 1.7;
        }

        .note span {
          color: #0879D1;
        }

        @media (max-width: 650px) {
          .assessment {
            padding: 23px 15px 60px;
          }

          .intro {
            margin-top: 35px;
            padding: 42px 22px;
            border-radius: 24px;
          }

          .description {
            font-size: 14px;
          }

          .stats {
            margin-top: 30px;
          }

          .start {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </main>
  );
}

function Info({ value, label }) {
  return (
    <div
      style={{
        padding: "22px 8px",
        borderRight: label !== "Минут" ? "1px solid #DDEAF5" : "none",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: 900,
          color: "#0879D1",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: "5px",
          fontSize: "12px",
          color: "#64788B",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}