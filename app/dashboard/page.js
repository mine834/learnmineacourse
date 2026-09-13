'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/login')
      return
    }

    setEmail(session.user.email || '')

    const {
      data: enrollments,
      error: enrollmentError,
    } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', session.user.id)

    if (enrollmentError) {
      setError(enrollmentError.message)
      setLoading(false)
      return
    }

    const courseIds = (enrollments || []).map(
      (item) => item.course_id
    )

    if (courseIds.length === 0) {
      setCourses([])
      setLoading(false)
      return
    }

    const {
      data: courseData,
      error: courseError,
    } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds)
      .eq('published', true)

    if (courseError) {
      setError(courseError.message)
      setLoading(false)
      return
    }

    const {
      data: moduleData,
      error: moduleError,
    } = await supabase
      .from('modules')
      .select('id, course_id, position')
      .in('course_id', courseIds)

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
      const { data, error } = await supabase
        .from('lessons')
        .select(
          'id, module_id, title, position, published'
        )
        .in('module_id', moduleIds)
        .eq('published', true)

      if (error) {
        setError(error.message)
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
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', session.user.id)
        .in('lesson_id', lessonIds)
        .eq('completed', true)

      if (!progressError) {
        completedIds = (progressData || []).map(
          (item) => item.lesson_id
        )
      }
    }

    const modulePosition = {}

    for (const module of moduleData || []) {
      modulePosition[module.id] =
        module.position || 0
    }

    const finalCourses = (courseData || []).map(
      (course) => {
        const courseModuleIds = (
          moduleData || []
        )
          .filter(
            (module) =>
              module.course_id === course.id
          )
          .map((module) => module.id)

        const courseLessons = lessonData
          .filter((lesson) =>
            courseModuleIds.includes(
              lesson.module_id
            )
          )
          .sort((a, b) => {
            const moduleA =
              modulePosition[a.module_id] || 0

            const moduleB =
              modulePosition[b.module_id] || 0

            if (moduleA !== moduleB) {
              return moduleA - moduleB
            }

            return (
              (a.position || 0) -
              (b.position || 0)
            )
          })

        const completedCount =
          courseLessons.filter((lesson) =>
            completedIds.includes(lesson.id)
          ).length

        const totalLessons =
          courseLessons.length

        const progress =
          totalLessons === 0
            ? 0
            : Math.round(
                (completedCount /
                  totalLessons) *
                  100
              )

        const completed =
          totalLessons > 0 &&
          completedCount === totalLessons

        const nextLesson =
          courseLessons.find(
            (lesson) =>
              !completedIds.includes(
                lesson.id
              )
          ) || courseLessons[0]

        return {
          ...course,
          completedCount,
          totalLessons,
          progress,
          completed,
          nextLessonId:
            nextLesson?.id || null,
        }
      }
    )

    setCourses(finalCourses)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Dashboard ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.brand}>
              LEARN·MINEA
            </p>

            <h1 style={styles.heading}>
              Миний сургалтууд
            </h1>

            <p style={styles.email}>
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            style={styles.logout}
          >
            Гарах
          </button>
        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              ▤
            </div>

            <h2>
              Одоогоор сургалт байхгүй
            </h2>

            <p>
              Сургалтын эрх нээгдсэний дараа
              энд харагдана.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <article
                key={course.id}
                style={{
                  ...styles.card,
                  ...(course.completed
                    ? styles.completedCard
                    : {}),
                }}
              >
                <div style={styles.cardTop}>
                  <div
                    style={{
                      ...styles.courseIcon,
                      ...(course.completed
                        ? styles.courseIconDone
                        : {}),
                    }}
                  >
                    {course.completed
                      ? '✓'
                      : '▤'}
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...(course.completed
                        ? styles.completedBadge
                        : {}),
                    }}
                  >
                    {course.completed
                      ? 'COMPLETED'
                      : 'ACTIVE'}
                  </span>
                </div>

                <p style={styles.courseLabel}>
                  COURSE
                </p>

                <h2 style={styles.courseTitle}>
                  {course.title}
                </h2>

                {course.description && (
                  <p
                    style={
                      styles.description
                    }
                  >
                    {course.description}
                  </p>
                )}

                {course.completed && (
                  <div
                    style={
                      styles.completeMessage
                    }
                  >
                    <span>✓</span>

                    <div>
                      <strong>
                        Сургалт дууссан
                      </strong>

                      <p>
                        Бүх хичээлээ
                        амжилттай дуусгалаа.
                      </p>
                    </div>
                  </div>
                )}

                <div style={styles.progressArea}>
                  <div style={styles.progressText}>
                    <span>
                      {course.completedCount} /{' '}
                      {course.totalLessons}{' '}
                      хичээл
                    </span>

                    <strong
                      style={{
                        color: course.completed
                          ? '#218647'
                          : '#6C5CE7',
                      }}
                    >
                      {course.progress}%
                    </strong>
                  </div>

                  <div style={styles.track}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${course.progress}%`,
                        background:
                          course.completed
                            ? '#36A269'
                            : '#6C5CE7',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    ...styles.button,
                    ...(course.completed
                      ? styles.completedButton
                      : {}),
                  }}
                  onClick={() => {
                    if (
                      !course.completed &&
                      course.progress > 0 &&
                      course.nextLessonId
                    ) {
                      router.push(
                        `/dashboard/courses/${course.id}/lessons/${course.nextLessonId}`
                      )
                      return
                    }

                    router.push(
                      `/dashboard/courses/${course.id}`
                    )
                  }}
                >
                  {course.completed
                    ? 'Сургалтыг дахин үзэх →'
                    : course.progress === 0
                      ? 'Суралцах →'
                      : 'Үргэлжлүүлэх →'}
                </button>
              </article>
            ))}
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
    padding: '44px 48px 80px',
  },

  container: {
    maxWidth: '1150px',
    margin: '0 auto',
  },

  loading: {
    minHeight: 'calc(100vh - 76px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F7FF',
    color: '#888',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '25px',
    marginBottom: '38px',
  },

  brand: {
    margin: '0 0 10px',
    color: '#6C5CE7',
    fontWeight: '900',
    fontSize: '12px',
    letterSpacing: '2px',
  },

  heading: {
    margin: 0,
    color: '#27272F',
    fontSize: '44px',
    letterSpacing: '-1px',
  },

  email: {
    color: '#9997A1',
    margin: '12px 0 0',
  },

  logout: {
    background: '#FFFFFF',
    border: '1px solid #E8E4F2',
    borderRadius: '12px',
    padding: '11px 16px',
    color: '#67656F',
    fontWeight: '700',
    cursor: 'pointer',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(310px, 1fr))',
    gap: '22px',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '22px',
    padding: '25px',
    boxShadow:
      '0 10px 35px rgba(45, 38, 90, .04)',
  },

  completedCard: {
    border: '1px solid #D8EDDF',
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },

  courseIcon: {
    width: '48px',
    height: '48px',
    background: '#F0ECFF',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6C5CE7',
    fontSize: '20px',
    fontWeight: '900',
  },

  courseIconDone: {
    background: '#E8F7ED',
    color: '#218647',
  },

  badge: {
    background: '#F1EEFF',
    color: '#6C5CE7',
    borderRadius: '999px',
    padding: '7px 11px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '.8px',
  },

  completedBadge: {
    background: '#E8F7ED',
    color: '#218647',
  },

  courseLabel: {
    margin: 0,
    color: '#A3A1AC',
    fontWeight: '900',
    fontSize: '10px',
    letterSpacing: '1.5px',
  },

  courseTitle: {
    margin: '8px 0 10px',
    color: '#292931',
    fontSize: '25px',
  },

  description: {
    margin: 0,
    color: '#85838D',
    lineHeight: 1.6,
    fontSize: '14px',
    minHeight: '44px',
  },

  completeMessage: {
    marginTop: '20px',
    background: '#F0FAF3',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#218647',
  },

  progressArea: {
    marginTop: '24px',
  },

  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#85838D',
    fontSize: '13px',
    marginBottom: '9px',
  },

  track: {
    height: '9px',
    borderRadius: '999px',
    background: '#EEEAF7',
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    borderRadius: '999px',
  },

  button: {
    marginTop: '22px',
    width: '100%',
    border: 'none',
    borderRadius: '13px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  completedButton: {
    background: '#218647',
  },

  empty: {
    background: '#FFFFFF',
    border: '1px solid #EEEAF7',
    borderRadius: '22px',
    padding: '60px 30px',
    textAlign: 'center',
    color: '#85838D',
  },

  emptyIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },

  error: {
    background: '#FFF0F0',
    color: '#A94444',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
}