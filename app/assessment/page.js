"use client";

import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F7FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "inherit",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "820px",
          background: "#FFFFFF",
          borderRadius: "32px",
          padding: "70px 60px",
          boxShadow: "0 20px 60px rgba(20, 20, 40, 0.06)",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "800",
            letterSpacing: "3px",
            color: "#6C5CE7",
            marginBottom: "50px",
          }}
        >
          LEARN·MINEA
        </div>

        {/* Icon */}
        <div
          style={{
            width: "92px",
            height: "92px",
            borderRadius: "28px",
            background: "#F0EDFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "42px",
            margin: "0 auto 32px",
          }}
        >
          🧠
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(36px, 6vw, 58px)",
            lineHeight: "1.08",
            letterSpacing: "-2.5px",
            color: "#111218",
            fontWeight: "900",
          }}
        >
          Чамд яг тохирох
          <br />
          сурах аргыг олъё.
        </h1>

        {/* Description */}
        <p
          style={{
            maxWidth: "620px",
            margin: "28px auto 0",
            fontSize: "20px",
            lineHeight: "1.7",
            color: "#60697A",
          }}
        >
          Солонгос хэл сурах зорилго, одоогийн түвшин, хамгийн их
          гацдаг зүйл болон сурах хэв маягийг чинь тодорхойлно.
        </p>

        {/* Info */}
        <div
          style={{
            margin: "42px auto 0",
            maxWidth: "520px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            border: "1px solid #ECECF2",
            borderRadius: "22px",
            overflow: "hidden",
          }}
        >
          <Info value="6" label="хэсэг" />
          <Info value="28" label="асуулт" border />
          <Info value="~5" label="минут" />
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/assessment/questions")}
          style={{
            marginTop: "42px",
            border: "none",
            background: "#111218",
            color: "#FFFFFF",
            padding: "20px 38px",
            borderRadius: "999px",
            fontSize: "18px",
            fontWeight: "800",
            cursor: "pointer",
            minWidth: "240px",
          }}
        >
          Эхлэх →
        </button>

        <p
          style={{
            marginTop: "20px",
            marginBottom: 0,
            fontSize: "14px",
            color: "#9A9EAA",
          }}
        >
          Зөв, буруу хариулт байхгүй.
        </p>
      </section>
    </main>
  );
}

function Info({ value, label, border }) {
  return (
    <div
      style={{
        padding: "20px 10px",
        borderLeft: border ? "1px solid #ECECF2" : "none",
        borderRight: border ? "1px solid #ECECF2" : "none",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "900",
          color: "#111218",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "13px",
          color: "#858B99",
        }}
      >
        {label}
      </div>
    </div>
  );
}