'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function CoursePage() {
  const { courseId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    initialize()
  }, [courseId])

  async function initialize() {
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
      setError(enrollmentError.message)
      setLoading(false)
      return
    }

    if (!enrollment) {
      router.replace('/dashboard')
      return
    }

    const {
      data: courseData,
      error: courseError,
    } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('published', true)
      .single()

    if (courseError) {
      setError(courseError.message)
      setLoading(false)
      return
    }

    setCourse(courseData)

    const {
      data: moduleData,
      error: moduleError,
    } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true })

    if (moduleError) {
      setError(moduleError.message)
      setLoading(false)
      return
    }

    const moduleIds = (moduleData || []).map(
      (module) => module.id
    )

    let lessonData = []

    if (moduleIds.length > 0) {
      const {
        data,
        error: lessonError,
      } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .eq('published', true)
        .order('position', { ascending: true })

      if (lessonError) {
        setError(lessonError.message)
        setLoading(false)
        return
      }

      lessonData = data || []
    }

    const lessonIds = lessonData.map(
      (lesson) => lesson.id
    )

    let completedIds = []

    if (lessonIds.length > 0) {
      const {
        data: progressData,
      } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', session.user.id)
        .in('lesson_id', lessonIds)
        .eq('completed', true)

      completedIds = (progressData || []).map(
        (item) => item.lesson_id
      )
    }

    const combined = (moduleData || []).map(
      (module) => ({
        ...module,
        lessons: lessonData
          .filter(
            (lesson) =>
              lesson.module_id === module.id
          )
          .map((lesson) => ({
            ...lesson,
            completed:
              completedIds.includes(lesson.id),
          })),
      })
    )

    setModules(combined)
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={styles.center}>
        Course ачаалж байна...
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorCard}>
          <h2>Алдаа гарлаа</h2>
          <p>{error}</p>

          <button
            style={styles.primaryButton}
            onClick={() =>
              router.push('/dashboard')
            }
          >
            Dashboard руу буцах
          </button>
        </div>
      </div>
    )
  }

  if (!course) return null

  const allLessons = modules.flatMap(
    (module) => module.lessons
  )

  const completedCount = allLessons.filter(
    (lesson) => lesson.completed
  ).length

  const totalLessons = allLessons.length

  const progress =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedCount / totalLessons) * 100
        )

  const courseCompleted =
    totalLessons > 0 &&
    completedCount === totalLessons

  const nextLesson =
    allLessons.find(
      (lesson) => !lesson.completed
    ) || allLessons[0]

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {courseCompleted && (
          <section style={styles.completionCard}>
            <div style={styles.completeIcon}>
              ✓
            </div>

            <div style={{ flex: 1 }}>
              <p style={styles.completeLabel}>
                COURSE COMPLETED
              </p>

              <h2 style={styles.completeTitle}>
                Сургалтаа амжилттай дуусгалаа
              </h2>

              <p style={styles.completeText}>
                Та бүх {totalLessons} хичээлийг
                амжилттай дуусгасан байна.
              </p>
            </div>

            <div style={styles.completePercent}>
              100%
            </div>
          </section>
        )}

        <section style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <p style={styles.eyebrow}>
                COURSE
              </p>

              <h1 style={styles.title}>
                {course.title}
              </h1>

              {course.description && (
                <p style={styles.description}>
                  {course.description}
                </p>
              )}
            </div>

            <div
              style={{
                ...styles.progressCircle,
                ...(courseCompleted
                  ? styles.progressCircleDone
                  : {}),
              }}
            >
              <strong>{progress}%</strong>
              <span>
                {courseCompleted
                  ? 'completed'
                  : 'progress'}
              </span>
            </div>
          </div>

          <div style={styles.progressInfo}>
            <div style={styles.progressText}>
              <span>
                {completedCount} / {totalLessons} хичээл
              </span>

              <strong>{progress}%</strong>
            </div>

            <div style={styles.track}>
              <div
                style={{
                  ...styles.bar,
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {nextLesson && (
            <button
              type="button"
              style={styles.continueButton}
              onClick={() =>
                router.push(
                  `/dashboard/courses/${courseId}/lessons/${nextLesson.id}`
                )
              }
            >
              {courseCompleted
                ? 'Дахин үзэх'
                : progress === 0
                  ? 'Эхлэх'
                  : 'Үргэлжлүүлэх'}{' '}
              →
            </button>
          )}
        </section>

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionLabel}>
              CURRICULUM
            </p>

            <h2 style={styles.sectionTitle}>
              Хичээлийн агуулга
            </h2>
          </div>

          <span style={styles.lessonCount}>
            {totalLessons} lesson
          </span>
        </div>

        {modules.length === 0 ? (
          <div style={styles.emptyCard}>
            Одоогоор хичээл байхгүй байна.
          </div>
        ) : (
          <div style={styles.moduleList}>
            {modules.map(
              (module, moduleIndex) => (
                <section
                  key={module.id}
                  style={styles.moduleCard}
                >
                  <div style={styles.moduleHeader}>
                    <div style={styles.moduleNumber}>
                      {String(moduleIndex + 1).padStart(
                        2,
                        '0'
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={styles.moduleLabel}>
                        MODULE {moduleIndex + 1}
                      </p>

                      <h3 style={styles.moduleTitle}>
                        {module.title}
                      </h3>
                    </div>

                    <span style={styles.moduleMeta}>
                      {module.lessons.length} lesson
                    </span>
                  </div>

                  <div style={styles.lessonList}>
                    {module.lessons.map(
                      (lesson, lessonIndex) => (
                        <button
                          type="button"
                          key={lesson.id}
                          style={styles.lessonRow}
                          onClick={() =>
                            router.push(
                              `/dashboard/courses/${courseId}/lessons/${lesson.id}`
                            )
                          }
                        >
                          <div style={styles.lessonLeft}>
                            <div
                              style={{
                                ...styles.lessonIndex,
                                ...(lesson.completed
                                  ? styles.completedIndex
                                  : {}),
                              }}
                            >
                              {lesson.completed
                                ? '✓'
                                : lessonIndex + 1}
                            </div>

                            <div>
                              <strong
                                style={styles.lessonTitle}
                              >
                                {lesson.title}
                              </strong>

                              <p style={styles.lessonMeta}>
                                {lesson.completed
                                  ? 'Дууссан'
                                  : 'Үзэх'}
                              </p>
                            </div>
                          </div>

                          <span style={styles.openArrow}>
                            →
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </section>
              )
            )}
          </div>
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
    maxWidth: '1050px',
    margin: '0 auto',
  },

  center: {
    minHeight: 'calc(100vh - 76px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F8F7FF',
    padding: '20px',
  },

  errorCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    textAlign: 'center',
  },

  completionCard: {
    background: '#FFFFFF',
    border: '1px solid #DDEFE3',
    borderRadius: '22px',
    padding: '24px 26px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },

  completeIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    background: '#EAF8EE',
    color: '#218647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '900',
  },

  completeLabel: {
    margin: 0,
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.5px',
    color: '#218647',
  },

  completeTitle: {
    margin: '5px 0',
    color: '#292932',
    fontSize: '22px',
  },

  completeText: {
    margin: 0,
    color: '#85838C',
    fontSize: '14px',
  },

  completePercent: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#218647',
  },

  hero: {
    background:
      'linear-gradient(135deg, #ffffff 0%, #f7f4ff 100%)',
    border: '1px solid #ECE8FA',
    borderRadius: '24px',
    padding: '30px',
    marginBottom: '40px',
  },

  heroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px',
  },

  eyebrow: {
    margin: 0,
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.7px',
    color: '#6C5CE7',
  },

  title: {
    margin: '10px 0 12px',
    fontSize: '38px',
    color: '#26262E',
  },

  description: {
    color: '#7E7D87',
    lineHeight: 1.7,
    maxWidth: '650px',
  },

  progressCircle: {
    width: '94px',
    height: '94px',
    borderRadius: '50%',
    border: '8px solid #ECE8FF',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6C5CE7',
  },

  progressCircleDone: {
    borderColor: '#DDF1E4',
    color: '#218647',
  },

  progressInfo: {
    marginTop: '28px',
  },

  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '9px',
    color: '#777680',
    fontSize: '13px',
  },

  track: {
    height: '10px',
    background: '#ECE8F8',
    borderRadius: '999px',
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    background: '#6C5CE7',
    borderRadius: '999px',
  },

  continueButton: {
    marginTop: '22px',
    background: '#6C5CE7',
    color: '#fff',
    border: 'none',
    borderRadius: '13px',
    padding: '14px 20px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },

  sectionLabel: {
    margin: 0,
    fontSize: '11px',
    fontWeight: '900',
    color: '#A29FAC',
  },

  sectionTitle: {
    margin: '6px 0 0',
    fontSize: '28px',
    color: '#2A2A32',
  },

  lessonCount: {
    color: '#88868F',
    fontSize: '13px',
  },

  moduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  moduleCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #EEEAF7',
    overflow: 'hidden',
  },

  moduleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '22px 24px',
    borderBottom: '1px solid #F0EDF7',
  },

  moduleNumber: {
    width: '46px',
    height: '46px',
    borderRadius: '13px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  moduleLabel: {
    margin: 0,
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
  },

  moduleTitle: {
    margin: '5px 0 0',
    color: '#292932',
    fontSize: '20px',
  },

  moduleMeta: {
    color: '#9997A0',
    fontSize: '12px',
  },

  lessonList: {
    padding: '0 20px',
  },

  lessonRow: {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #F0EDF6',
    background: 'transparent',
    padding: '18px 4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },

  lessonLeft: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
  },

  lessonIndex: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: '#F5F3FA',
    color: '#777580',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },

  completedIndex: {
    background: '#EAF8EE',
    color: '#218647',
  },

  lessonTitle: {
    color: '#303038',
    fontSize: '15px',
  },

  lessonMeta: {
    margin: '5px 0 0',
    color: '#9A98A1',
    fontSize: '12px',
  },

  openArrow: {
    color: '#6C5CE7',
    fontWeight: '900',
  },

  emptyCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '35px',
    textAlign: 'center',
    color: '#8B8993',
  },

  primaryButton: {
    background: '#6C5CE7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    fontWeight: '800',
    cursor: 'pointer',
  },
}