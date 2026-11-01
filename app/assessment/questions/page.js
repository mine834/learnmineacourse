"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { questions, sections } from '../../lib/assessmentData.mjs';
import { assessmentPayload, saveAssessment } from '../../lib/assessmentLogic.mjs';

const BLUE = "#0879D1";

function getSectionQuestions(sectionId) {
  return questions.filter((question) => question.section === sectionId);
}

export default function AssessmentQuestionsPage() {
  const router = useRouter();
  const timerRef = useRef(null);
  const lockedRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [finishedSection, setFinishedSection] = useState(null);

  const currentQuestion = questions[currentIndex];

  const currentSectionIndex = sections.findIndex(
    (section) => section.id === currentQuestion?.section
  );

  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(
    () => getSectionQuestions(currentQuestion?.section),
    [currentQuestion?.section]
  );

  const questionPositionInSection = sectionQuestions.findIndex(
    (question) => question.id === currentQuestion?.id
  );

  const totalProgress =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  function handleSelect(optionIndex) {
    if (lockedRef.current) return;
    lockedRef.current = true;

    setSelectedOption(optionIndex);

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionIndex,
    };

    setAnswers(nextAnswers);

    const isLastQuestion =
      currentIndex === questions.length - 1;

    const nextQuestion = questions[currentIndex + 1];

    const isEndOfSection =
      isLastQuestion ||
      nextQuestion?.section !== currentQuestion.section;

    timerRef.current = window.setTimeout(() => {
      lockedRef.current = false;
      setSelectedOption(null);

      if (isEndOfSection) {
        setFinishedSection(currentSection);
        setShowTransition(true);
        return;
      }

      setCurrentIndex((previous) => previous + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 260);
  }

  function continueAfterTransition() {
    const isLastQuestion =
      currentIndex === questions.length - 1;

    if (isLastQuestion) {
      try {
        setSaveError('');
        saveAssessment(assessmentPayload(answers), window.localStorage, window.sessionStorage);
        router.push("/assessment/result");
      } catch (error) {
        setSaveError(error.message);
      }
      return;
    }

    setShowTransition(false);
    setFinishedSection(null);
    setCurrentIndex((previous) => previous + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goBack() {
    if (lockedRef.current) return;
    if (currentIndex === 0) {
      router.push("/assessment");
      return;
    }

    const previousIndex = currentIndex - 1;
    const previousQuestion = questions[previousIndex];

    setAnswers((previous) => {
      const copy = { ...previous };
      delete copy[previousQuestion.id];
      return copy;
    });

    setSelectedOption(null);
    setCurrentIndex(previousIndex);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!currentQuestion) return null;

  if (showTransition && finishedSection) {
    const isFinal =
      currentIndex === questions.length - 1;

    const nextSection = !isFinal
      ? sections[currentSectionIndex + 1]
      : null;

    return (
      <main style={styles.page}>
        <div style={styles.transitionWrap}>
          <div style={styles.brandRow}>
            <span style={styles.brandDot} />
            <span style={styles.brand}>
              LEARN·MINEA
            </span>
          </div>

          <div style={styles.sectionMiniProgress}>
            {sections.map((section, index) => {
              const completed =
                index <= currentSectionIndex;

              return (
                <div
                  key={section.id}
                  style={{
                    ...styles.sectionMiniBar,
                    background: completed
                      ? BLUE
                      : "#E2EDF6",
                  }}
                />
              );
            })}
          </div>

          <div style={styles.transitionCard}>
            <div style={styles.transitionTop}>
              <div style={styles.transitionIcon}>
                {finishedSection.transitionEmoji}
              </div>

              <div style={styles.transitionEyebrow}>
                {finishedSection.label} ·{" "}
                {finishedSection.title.toUpperCase()}
              </div>

              <h1 style={styles.transitionTitle}>
                {finishedSection.transitionTitle}
              </h1>

              <p style={styles.transitionText}>
                {finishedSection.transitionText}
              </p>
            </div>

            {!isFinal ? (
              <div style={styles.nextBlock}>
                <div style={styles.nextIcon}>
                  {nextSection?.emoji}
                </div>

                <div>
                  <div style={styles.nextLabel}>
                    Дараагийн хэсэг
                  </div>

                  <div style={styles.nextTitle}>
                    {nextSection?.title}
                  </div>

                  <div style={styles.nextDescription}>
                    {nextSection?.shortTitle}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.finalBlock}>
                <div style={styles.finalEmoji}>
                  ✨
                </div>

                <div>
                  <div style={styles.nextLabel}>
                    28 / 28 АСУУЛТ
                  </div>

                  <div style={styles.nextTitle}>
                    Чиний үр дүн бэлэн
                  </div>

                  <div style={styles.nextDescription}>
                    Хариултуудаас чинь сурах хэв
                    маяг, гол саад, тохирох хэмнэлийг
                    нэгтгэнэ.
                  </div>
                </div>
              </div>
            )}

            {saveError && <p role="alert" style={{ color: '#b42318' }}>{saveError}</p>}
            <button
              onClick={continueAfterTransition}
              style={styles.continueButton}
            >
              <span>
                {isFinal
                  ? "Үр дүнгээ харах"
                  : "Дараагийн хэсэг"}
              </span>

              <span style={{ fontSize: 22 }}>→</span>
            </button>
          </div>

          <div style={styles.transitionQuote}>
            <span style={{ color: BLUE }}>✦</span>
            Чамд тохирох арга гэдэг хамгийн хэцүү
            аргыг сонгох биш, удаан хугацаанд
            үргэлжлүүлж чадах аргаа олох юм.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.quizWrap}>
        <header style={styles.header}>
          <a href="/" style={{ display:'inline-block', marginBottom:20, color:'#718096', textDecoration:'none' }}>‹ Нүүр хуудас</a>
          <div style={styles.headerTop}>
            <div style={styles.brandRow}>
              <span style={styles.brandDot} />
              <span style={styles.brand}>
                LEARN·MINEA
              </span>
            </div>

            <div style={styles.counter}>
              {String(currentIndex + 1).padStart(
                2,
                "0"
              )}{" "}
              / {questions.length}
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${totalProgress}%`,
              }}
            />
          </div>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              {currentSection.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div style={styles.sectionLabel}>
                ХЭСЭГ {currentSection.label} ·{" "}
                {currentSection.title}
              </div>

              <div style={styles.sectionProgressText}>
                {questionPositionInSection + 1} /{" "}
                {sectionQuestions.length}
              </div>
            </div>
          </div>
        </header>

        <section style={styles.questionCard}>
          <div style={styles.questionEmoji}>
            {currentQuestion.emoji}
          </div>

          <h1 style={styles.questionTitle}>
            {currentQuestion.question}
          </h1>

          <p style={styles.questionSub}>
            {currentQuestion.sub}
          </p>

          <div style={styles.options}>
            {currentQuestion.options.map(
              (option, optionIndex) => {
                const selected =
                  selectedOption === optionIndex;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      handleSelect(optionIndex)
                    }
                    style={{
                      ...styles.option,
                      ...(selected
                        ? styles.optionSelected
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.radio,
                        ...(selected
                          ? styles.radioSelected
                          : {}),
                      }}
                    >
                      {selected ? "✓" : ""}
                    </div>

                    <div style={styles.optionEmoji}>
                      {option.emoji}
                    </div>

                    <div style={styles.optionText}>
                      {option.text}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        <footer style={styles.footer}>
          <button
            onClick={goBack}
            style={styles.backButton}
          >
            ← Буцах
          </button>

        </footer>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #f7fbff;
        }

        body {
          margin: 0;
          background: #f7fbff;
          color: #142536;
        }

        button {
          font-family: inherit;
        }

        @media (max-width: 700px) {
          .assessment-hide-mobile {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 15% 0%, rgba(8,121,209,0.08), transparent 30%), #F7FBFF",
    color: "#142536",
  },

  quizWrap: {
    width: "min(760px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "26px 0 40px",
  },

  header: {
    marginBottom: 22,
  },

  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  brandDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    background: BLUE,
    boxShadow:
      "0 0 0 6px rgba(8,121,209,.10)",
  },

  brand: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.13em",
  },

  counter: {
    fontSize: 14,
    fontWeight: 800,
    color: "#7C91A3",
    letterSpacing: "0.08em",
  },

  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#E2EDF6",
    overflow: "hidden",
    marginBottom: 24,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: BLUE,
    transition: "width .35s ease",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "#EAF5FF",
    fontSize: 24,
  },

  sectionLabel: {
    color: BLUE,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.1em",
    marginBottom: 4,
  },

  sectionProgressText: {
    color: "#7C91A3",
    fontSize: 13,
    fontWeight: 700,
  },

  questionCard: {
    background: "#FFFFFF",
    border: "1px solid #DDEAF5",
    borderRadius: 24,
    padding: "clamp(18px, 3vw, 28px)",
    boxShadow:
      "0 24px 70px rgba(8, 70, 120, 0.07)",
  },

  questionEmoji: {
    width: 46,
    height: 46,
    display: "grid",
    placeItems: "center",
    borderRadius: 20,
    background: "#EAF5FF",
    fontSize: 23,
    marginBottom: 18,
  },

  questionTitle: {
    margin: 0,
    maxWidth: 760,
    fontSize: "clamp(20px, 2.6vw, 26px)",
    lineHeight: 1.35,
    letterSpacing: "-0.04em",
    fontWeight: 900,
  },

  questionSub: {
    margin: "12px 0 24px",
    color: "#64788B",
    fontSize: "clamp(14px, 1.6vw, 15px)",
    lineHeight: 1.65,
  },

  options: {
    display: "grid",
    gap: 10,
  },

  option: {
    width: "100%",
    minHeight: 56,
    display: "flex",
    alignItems: "center",
    gap: 16,
    textAlign: "left",
    padding: "11px 14px",
    borderRadius: 16,
    border: "1.5px solid #DDEAF5",
    background: "#FFFFFF",
    cursor: "pointer",
    transition:
      "border-color .18s ease, background .18s ease, transform .18s ease",
    color: "#243C50",
  },

  optionSelected: {
  border: `2px solid ${BLUE}`,
  background: "#EAF5FF",
  transform: "translateY(-1px)",
},

  radio: {
    width: 26,
    height: 26,
    flex: "0 0 26px",
    borderRadius: 999,
    border: "2px solid #B8CCDC",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#FFFFFF",
    fontSize: 15,
  },

 radioSelected: {
  background: BLUE,
  border: `2px solid ${BLUE}`,
},

  optionEmoji: {
    fontSize: 21,
    width: 26,
    textAlign: "center",
    flex: "0 0 26px",
  },

  optionText: {
    fontSize: "clamp(14px, 1.6vw, 15px)",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "22px 6px 0",
  },

  backButton: {
    border: 0,
    background: "transparent",
    color: "#64788B",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    padding: "10px 0",
  },

  transitionWrap: {
    width: "min(760px, calc(100% - 32px))",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "42px 0 60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  sectionMiniProgress: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 8,
    margin: "24px 0",
  },

  sectionMiniBar: {
    height: 7,
    borderRadius: 999,
  },

  transitionCard: {
    background: "#FFFFFF",
    border: "1px solid #DDEAF5",
    borderRadius: 34,
    padding: "clamp(24px, 4vw, 38px)",
    boxShadow:
      "0 28px 80px rgba(8, 70, 120, .08)",
  },

  transitionTop: {
    marginBottom: 36,
  },

  transitionIcon: {
    width: 78,
    height: 78,
    borderRadius: 26,
    display: "grid",
    placeItems: "center",
    fontSize: 38,
    background: "#EAF5FF",
    marginBottom: 18,
  },

  transitionEyebrow: {
    color: BLUE,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.12em",
    marginBottom: 13,
  },

  transitionTitle: {
    margin: 0,
    maxWidth: 650,
    fontSize: "clamp(22px, 3vw, 30px)",
    lineHeight: 1.08,
    letterSpacing: "-0.045em",
    fontWeight: 900,
  },

  transitionText: {
    maxWidth: 650,
    margin: "20px 0 0",
    color: "#64788B",
    fontSize: "clamp(14px, 2vw, 16px)",
    lineHeight: 1.7,
  },

  nextBlock: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: "#F3F9FF",
    border: "1px solid #DDEAF5",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },

  finalBlock: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background:
      "linear-gradient(135deg, #EAF5FF 0%, #F7FBFF 100%)",
    border: "1px solid #DDEAF5",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },

  nextIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontSize: 27,
    flex: "0 0 54px",
  },

  finalEmoji: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontSize: 27,
    flex: "0 0 54px",
  },

  nextLabel: {
    color: "#7C91A3",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 4,
  },

  nextTitle: {
    fontSize: 19,
    fontWeight: 900,
    marginBottom: 3,
  },

  nextDescription: {
    color: "#64788B",
    fontSize: 14,
    lineHeight: 1.5,
  },

  continueButton: {
    width: "100%",
    minHeight: 54,
    border: 0,
    borderRadius: 16,
    background: "#0879D1",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  transitionQuote: {
    margin: "22px auto 0",
    maxWidth: 620,
    color: "#7C91A3",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 1.7,
  },
};