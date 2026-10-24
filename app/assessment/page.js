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
          Оношилгоо эхлүүлэх <span>→</span>
        </button>

        <div className="note">
          <span>✦</span> Зөв, буруу хариулт байхгүй. Өөртөө үнэнчээр хариулаарай.
        </div>
      </section>

      <style jsx>{`
        .assessment {
          min-height: 100vh;
          background:
            radial-gradient(circle at 80% 20%, #eeeaff 0%, transparent 35%),
            radial-gradient(circle at 10% 90%, #f0ecff 0%, transparent 35%),
            #f8f7ff;
          padding: 28px 6% 90px;
          color: #27213d;
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
          color: #817991;
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
          margin: 70px auto 0;
          background: white;
          border: 1px solid #ebe6fb;
          border-radius: 32px;
          padding: 65px 55px;
          text-align: center;
          box-shadow: 0 24px 70px rgba(87, 68, 155, 0.07);
        }

        .icon {
          width: 88px;
          height: 88px;
          margin: 0 auto 28px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background: #eeeaff;
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
          font-size: clamp(35px, 5.5vw, 60px);
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
          font-size: 17px;
          line-height: 1.85;
          color: #80798f;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          max-width: 510px;
          margin: 42px auto 0;
          border: 1px solid #e8e2f8;
          border-radius: 20px;
          background: #faf9ff;
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
          box-shadow: 0 10px 25px rgba(108, 92, 231, 0.22);
          transition: transform 0.2s, background 0.2s;
        }

        .start:hover {
          background: #5948d6;
          transform: translateY(-2px);
        }

        .start span {
          font-size: 22px;
        }

        .note {
          margin-top: 23px;
          color: #938ba2;
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
        borderRight: label !== "Минут" ? "1px solid #E8E2F8" : "none",
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
          color: "#817991",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}