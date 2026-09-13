'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../../../lib/supabase'

export default function StudentQuizPage() {
  const { courseId, lessonId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuiz()
  }, [lessonId])

  async function loadQuiz() {
    setLoading(true)
    setError('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/login')
      return
    }

    const { data, error } = await supabase.rpc(
      'get_student_quiz',
      {
        target_lesson_id: lessonId,
      }
    )

    if (error) {
      console.error(error)
      setError(error.message)
      setLoading(false)
      return
    }

    setQuiz(data)
    setLoading(false)
  }

  function selectAnswer(questionId, optionId) {
    if (result) return

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }))
  }

  async function submitQuiz() {
    if (!quiz) return

    if (
      Object.keys(answers).length !==
      quiz.questions.length
    ) {
      alert('Бүх асуултад хариулна уу.')
      return
    }

    setSubmitting(true)

    const answerList = quiz.questions.map(
      (question) => ({
        question_id: question.id,
        option_id: answers[question.id],
      })
    )

    const { data, error } = await supabase.rpc(
      'submit_student_quiz',
      {
        target_quiz_id: quiz.id,
        answers: answerList,
      }
    )

    setSubmitting(false)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setResult(data)
  }

  function retryQuiz() {
    setAnswers({})
    setResult(null)
  }

  if (loading) {
    return (
      <div style={styles.center}>
        Quiz ачаалж байна...
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div>
          <h2>Quiz нээж чадсангүй</h2>
          <p>{error}</p>

          <button
            style={styles.primaryButton}
            onClick={() =>
              router.push(
                `/dashboard/courses/${courseId}`
              )
            }
          >
            Course руу буцах
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div style={styles.center}>
        <div>
          <h2>Quiz байхгүй байна</h2>

          <button
            style={styles.primaryButton}
            onClick={() =>
              router.push(
                `/dashboard/courses/${courseId}`
              )
            }
          >
            Course руу буцах
          </button>
        </div>
      </div>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() =>
            router.push(
              `/dashboard/courses/${courseId}/lessons/${lessonId}`
            )
          }
        >
          ← Lesson руу буцах
        </button>

        <div style={styles.header}>
          <p style={styles.label}>QUIZ</p>

          <h1 style={styles.title}>
            {quiz.title}
          </h1>

          <p style={styles.subtitle}>
            Тэнцэх оноо: {quiz.passing_score}%
          </p>
        </div>

        {!result ? (
          <>
            {quiz.questions.map(
              (question, questionIndex) => (
                <section
                  key={question.id}
                  style={styles.questionCard}
                >
                  <p style={styles.questionNumber}>
                    Асуулт {questionIndex + 1} /{' '}
                    {quiz.questions.length}
                  </p>

                  <h2 style={styles.question}>
                    {question.question}
                  </h2>

                  <div style={styles.options}>
                    {question.options.map(
                      (option, optionIndex) => {
                        const selected =
                          answers[question.id] ===
                          option.id

                        return (
                          <button
                            type="button"
                            key={option.id}
                            onClick={() =>
                              selectAnswer(
                                question.id,
                                option.id
                              )
                            }
                            style={{
                              ...styles.option,
                              ...(selected
                                ? styles.selectedOption
                                : {}),
                            }}
                          >
                            <span
                              style={{
                                ...styles.optionLetter,
                                ...(selected
                                  ? styles.selectedLetter
                                  : {}),
                              }}
                            >
                              {String.fromCharCode(
                                65 + optionIndex
                              )}
                            </span>

                            <span>
                              {option.option_text}
                            </span>
                          </button>
                        )
                      }
                    )}
                  </div>
                </section>
              )
            )}

            <button
              onClick={submitQuiz}
              disabled={submitting}
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting
                ? 'Шалгаж байна...'
                : 'Quiz дуусгах'}
            </button>
          </>
        ) : (
          <section style={styles.resultCard}>
            <div style={styles.resultIcon}>
              {result.passed ? '🎉' : '📚'}
            </div>

            <p style={styles.resultLabel}>
              {result.passed
                ? 'АМЖИЛТТАЙ'
                : 'ДАХИН ОРОЛДООРОЙ'}
            </p>

            <div style={styles.score}>
              {result.score}%
            </div>

            <p style={styles.resultText}>
              {result.correct} / {result.total}{' '}
              зөв хариулт
            </p>

            <p style={styles.resultText}>
              Тэнцэх оноо:{' '}
              {result.passing_score}%
            </p>

            <div style={styles.resultActions}>
              {!result.passed && (
                <button
                  onClick={retryQuiz}
                  style={styles.secondaryButton}
                >
                  Дахин оролдох
                </button>
              )}

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/courses/${courseId}`
                  )
                }
                style={styles.primaryButton}
              >
                Course руу буцах
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8F7FF',
    padding: '40px 20px 80px',
  },

  container: {
    maxWidth: '760px',
    margin: '0 auto',
  },

  center: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    background: '#F8F7FF',
    padding: '20px',
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '25px',
  },

  header: {
    marginBottom: '30px',
  },

  label: {
    color: '#6C5CE7',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '1.5px',
  },

  title: {
    fontSize: '34px',
    margin: '8px 0',
  },

  subtitle: {
    color: '#777',
  },

  questionCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '26px',
    marginBottom: '20px',
  },

  questionNumber: {
    color: '#6C5CE7',
    fontWeight: '700',
    fontSize: '13px',
  },

  question: {
    fontSize: '20px',
    margin: '10px 0 20px',
  },

  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  option: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #E5E5E5',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '15px',
  },

  selectedOption: {
    border: '2px solid #6C5CE7',
    background: '#F4F1FF',
  },

  optionLetter: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#F1F1F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },

  selectedLetter: {
    background: '#6C5CE7',
    color: '#fff',
  },

  submitButton: {
    width: '100%',
    border: 'none',
    borderRadius: '14px',
    background: '#6C5CE7',
    color: '#fff',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '10px',
  },

  resultCard: {
    background: '#fff',
    borderRadius: '22px',
    padding: '45px 30px',
    textAlign: 'center',
  },

  resultIcon: {
    fontSize: '46px',
  },

  resultLabel: {
    color: '#6C5CE7',
    fontWeight: '800',
    marginTop: '16px',
  },

  score: {
    fontSize: '64px',
    fontWeight: '900',
    margin: '10px 0',
  },

  resultText: {
    color: '#666',
  },

  resultActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '28px',
    flexWrap: 'wrap',
  },

  primaryButton: {
    border: 'none',
    background: '#6C5CE7',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  secondaryButton: {
    border: '1px solid #6C5CE7',
    background: '#fff',
    color: '#6C5CE7',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
  },
}