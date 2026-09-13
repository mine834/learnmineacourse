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
  }, [courseId, lessonId])

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

    const {
      data: enrollment,
      error: enrollmentError,
    } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (enrollmentError) {
      console.error(enrollmentError)
      setError(enrollmentError.message)
      setLoading(false)
      return
    }

    if (!enrollment) {
      router.replace('/dashboard')
      return
    }

    const {
      data: lessonData,
      error: lessonError,
    } = await supabase
      .from('lessons')
      .select(`
        id,
        module_id,
        published,
        modules!inner (
          course_id
        )
      `)
      .eq('id', lessonId)
      .eq('published', true)
      .single()

    if (lessonError) {
      console.error(lessonError)
      setError('Lesson нээж чадсангүй.')
      setLoading(false)
      return
    }

    if (
      lessonData?.modules?.course_id !== courseId
    ) {
      router.replace(
        `/dashboard/courses/${courseId}`
      )
      return
    }

    const {
      data,
      error: quizError,
    } = await supabase.rpc(
      'get_student_quiz',
      {
        target_lesson_id: lessonId,
      }
    )

    if (quizError) {
      console.error(quizError)
      setError(quizError.message)
      setLoading(false)
      return
    }

    setQuiz(data || null)
    setLoading(false)
  }

  function selectAnswer(questionId, optionId) {
    if (result) return

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  async function submitQuiz() {
    if (!quiz) return

    const questions = quiz.questions || []

    if (
      Object.keys(answers).length !==
      questions.length
    ) {
      alert('Бүх асуултад хариулна уу.')
      return
    }

    setSubmitting(true)

    const answerList = questions.map(
      (question) => ({
        question_id: question.id,
        option_id: answers[question.id],
      })
    )

    const {
      data,
      error: submitError,
    } = await supabase.rpc(
      'submit_student_quiz',
      {
        target_quiz_id: quiz.id,
        answers: answerList,
      }
    )

    setSubmitting(false)

    if (submitError) {
      console.error(submitError)
      alert(submitError.message)
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
        <div style={styles.messageCard}>
          <div style={styles.messageIcon}>!</div>

          <h2 style={styles.messageTitle}>
            Quiz нээж чадсангүй
          </h2>

          <p style={styles.messageText}>
            {error}
          </p>

          <button
            type="button"
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
        <div style={styles.messageCard}>
          <div style={styles.messageIcon}>?</div>

          <h2 style={styles.messageTitle}>
            Quiz байхгүй байна
          </h2>

          <p style={styles.messageText}>
            Энэ lesson-д одоогоор Quiz үүсгээгүй байна.
          </p>

          <button
            type="button"
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

  const questions = quiz.questions || []

  const answeredCount =
    Object.keys(answers).length

  const answerProgress =
    questions.length === 0
      ? 0
      : Math.round(
          (answeredCount / questions.length) * 100
        )

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {!result ? (
          <>
            <section style={styles.hero}>
              <div>
                <p style={styles.eyebrow}>
                  QUIZ
                </p>

                <h1 style={styles.title}>
                  {quiz.title || 'Lesson Quiz'}
                </h1>

                <p style={styles.subtitle}>
                  Бүх асуултад хариулаад Quiz-ээ дуусгана.
                </p>
              </div>

              <div style={styles.passBox}>
                <span style={styles.passLabel}>
                  PASS
                </span>

                <strong style={styles.passScore}>
                  {quiz.passing_score || 70}%
                </strong>
              </div>
            </section>

            <section style={styles.progressCard}>
              <div style={styles.progressTop}>
                <span>
                  {answeredCount} / {questions.length} хариулсан
                </span>

                <strong>
                  {answerProgress}%
                </strong>
              </div>

              <div style={styles.track}>
                <div
                  style={{
                    ...styles.bar,
                    width: `${answerProgress}%`,
                  }}
                />
              </div>
            </section>

            {questions.length === 0 ? (
              <div style={styles.emptyCard}>
                Энэ Quiz асуултгүй байна.
              </div>
            ) : (
              <div style={styles.questionList}>
                {questions.map(
                  (question, questionIndex) => (
                    <section
                      key={question.id}
                      style={styles.questionCard}
                    >
                      <div style={styles.questionHeader}>
                        <span style={styles.questionNumber}>
                          {questionIndex + 1}
                        </span>

                        <span style={styles.questionCount}>
                          QUESTION {questionIndex + 1} /{' '}
                          {questions.length}
                        </span>
                      </div>

                      <h2 style={styles.questionText}>
                        {question.question}
                      </h2>

                      <div style={styles.options}>
                        {(question.options || []).map(
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
                                    ? styles.optionSelected
                                    : {}),
                                }}
                              >
                                <span
                                  style={{
                                    ...styles.optionLetter,
                                    ...(selected
                                      ? styles.optionLetterSelected
                                      : {}),
                                  }}
                                >
                                  {String.fromCharCode(
                                    65 + optionIndex
                                  )}
                                </span>

                                <span style={styles.optionText}>
                                  {option.option_text}
                                </span>

                                {selected && (
                                  <span style={styles.check}>
                                    ✓
                                  </span>
                                )}
                              </button>
                            )
                          }
                        )}
                      </div>
                    </section>
                  )
                )}
              </div>
            )}

            {questions.length > 0 && (
              <div style={styles.bottomActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() =>
                    router.push(
                      `/dashboard/courses/${courseId}/lessons/${lessonId}`
                    )
                  }
                >
                  ← Lesson руу
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitQuiz}
                  style={{
                    ...styles.submitButton,
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                  {submitting
                    ? 'Шалгаж байна...'
                    : 'Quiz дуусгах →'}
                </button>
              </div>
            )}
          </>
        ) : (
          <section style={styles.resultCard}>
            <div
              style={{
                ...styles.resultIcon,
                ...(result.passed
                  ? styles.resultPassed
                  : styles.resultFailed),
              }}
            >
              {result.passed ? '✓' : '!'}
            </div>

            <p style={styles.resultEyebrow}>
              {result.passed
                ? 'QUIZ PASSED'
                : 'TRY AGAIN'}
            </p>

            <h1 style={styles.resultScore}>
              {result.score}%
            </h1>

            <h2 style={styles.resultTitle}>
              {result.passed
                ? 'Амжилттай тэнцлээ'
                : 'Дахин оролдоорой'}
            </h2>

            <div style={styles.resultStats}>
              <div style={styles.statBox}>
                <span>Зөв</span>

                <strong>
                  {result.correct} / {result.total}
                </strong>
              </div>

              <div style={styles.statBox}>
                <span>Тэнцэх оноо</span>

                <strong>
                  {result.passing_score}%
                </strong>
              </div>
            </div>

            <div style={styles.resultActions}>
              {!result.passed && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={retryQuiz}
                >
                  Дахин оролдох
                </button>
              )}

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() =>
                  router.push(
                    `/dashboard/courses/${courseId}`
                  )
                }
              >
                Course руу буцах →
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100%',
    background: '#F8F7FF',
    padding: '40px 48px 80px',
  },

  container: {
    maxWidth: '850px',
    margin: '0 auto',
  },

  center: {
    minHeight: 'calc(100vh - 76px)',
    background: '#F8F7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },

  messageCard: {
    width: '100%',
    maxWidth: '460px',
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '22px',
    padding: '38px',
    textAlign: 'center',
  },

  messageIcon: {
    width: '58px',
    height: '58px',
    margin: '0 auto 16px',
    borderRadius: '16px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    fontWeight: '900',
  },

  messageTitle: {
    margin: 0,
    color: '#292932',
    fontSize: '24px',
  },

  messageText: {
    margin: '10px 0 24px',
    color: '#8C8A94',
    lineHeight: 1.6,
  },

  hero: {
    background:
      'linear-gradient(135deg, #ffffff 0%, #f6f3ff 100%)',
    border: '1px solid #ECE8FA',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '25px',
    marginBottom: '18px',
  },

  eyebrow: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.7px',
  },

  title: {
    margin: '8px 0 9px',
    fontSize: '34px',
    color: '#292932',
  },

  subtitle: {
    margin: 0,
    color: '#898791',
    fontSize: '14px',
    lineHeight: 1.6,
  },

  passBox: {
    minWidth: '92px',
    background: '#FFFFFF',
    border: '1px solid #EAE6F8',
    borderRadius: '16px',
    padding: '14px',
    textAlign: 'center',
  },

  passLabel: {
    display: 'block',
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },

  passScore: {
    display: 'block',
    color: '#6C5CE7',
    fontSize: '22px',
    marginTop: '4px',
  },

  progressCard: {
    background: '#FFFFFF',
    border: '1px solid #EEEAF7',
    borderRadius: '16px',
    padding: '16px 18px',
    marginBottom: '22px',
  },

  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    color: '#77757F',
    fontSize: '12px',
  },

  track: {
    height: '8px',
    background: '#EEEAF8',
    borderRadius: '999px',
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    background: '#6C5CE7',
    borderRadius: '999px',
    transition: 'width .2s ease',
  },

  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  questionCard: {
    background: '#FFFFFF',
    border: '1px solid #EEEAF7',
    borderRadius: '20px',
    padding: '24px',
  },

  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },

  questionNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  questionCount: {
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },

  questionText: {
    margin: '0 0 20px',
    color: '#2D2D35',
    fontSize: '20px',
    lineHeight: 1.5,
  },

  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  option: {
    width: '100%',
    border: '1px solid #E9E6F1',
    background: '#FFFFFF',
    borderRadius: '13px',
    padding: '13px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left',
    cursor: 'pointer',
  },

  optionSelected: {
    border: '2px solid #6C5CE7',
    background: '#F5F2FF',
  },

  optionLetter: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#F4F3F7',
    color: '#73717B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    flexShrink: 0,
  },

  optionLetterSelected: {
    background: '#6C5CE7',
    color: '#FFFFFF',
  },

  optionText: {
    flex: 1,
    color: '#45444D',
    fontSize: '14px',
  },

  check: {
    color: '#6C5CE7',
    fontWeight: '900',
  },

  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '24px',
  },

  submitButton: {
    flex: 1,
    border: 'none',
    borderRadius: '13px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '15px 18px',
    fontWeight: '800',
  },

  secondaryButton: {
    border: '1px solid #E1DDF0',
    borderRadius: '13px',
    background: '#FFFFFF',
    color: '#65636D',
    padding: '14px 18px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  primaryButton: {
    border: 'none',
    borderRadius: '13px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '14px 20px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  emptyCard: {
    background: '#FFFFFF',
    border: '1px solid #EEEAF7',
    borderRadius: '20px',
    padding: '35px',
    textAlign: 'center',
    color: '#8B8993',
  },

  resultCard: {
    background: '#FFFFFF',
    border: '1px solid #EEEAF7',
    borderRadius: '24px',
    padding: '48px 32px',
    textAlign: 'center',
  },

  resultIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '900',
  },

  resultPassed: {
    background: '#EAF8EE',
    color: '#218647',
  },

  resultFailed: {
    background: '#FFF1F1',
    color: '#C84F4F',
  },

  resultEyebrow: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.5px',
  },

  resultScore: {
    margin: '10px 0 4px',
    fontSize: '62px',
    color: '#282830',
  },

  resultTitle: {
    margin: 0,
    color: '#424149',
    fontSize: '22px',
  },

  resultStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    maxWidth: '420px',
    margin: '30px auto 0',
  },

  statBox: {
    background: '#F8F7FC',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    color: '#84828C',
    fontSize: '12px',
  },

  resultActions: {
    marginTop: '28px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
}