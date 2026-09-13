'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const parts = pathname.split('/').filter(Boolean)

  const courseIndex = parts.indexOf('courses')
  const lessonIndex = parts.indexOf('lessons')

  const currentCourseId =
    courseIndex !== -1
      ? parts[courseIndex + 1]
      : null

  const currentLessonId =
    lessonIndex !== -1
      ? parts[lessonIndex + 1]
      : null

  const isQuiz = pathname.endsWith('/quiz')

  const [coursePath, setCoursePath] = useState(null)
  const [lessonPath, setLessonPath] = useState(null)
  const [quizPath, setQuizPath] = useState(null)

  const [courseMenuOpen, setCourseMenuOpen] = useState(
    Boolean(currentCourseId)
  )

  useEffect(() => {
    loadNavigation()
  }, [pathname])

  useEffect(() => {
    if (currentCourseId) {
      setCourseMenuOpen(true)
    }
  }, [currentCourseId])

  async function loadNavigation() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    let targetCourseId = currentCourseId

    // Хэрэв course дотор биш бол
    // хэрэглэгчийн эхний enrolled course-г авна.
    if (!targetCourseId) {
      const {
        data: enrollment,
      } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle()

      targetCourseId =
        enrollment?.course_id || null
    }

    if (!targetCourseId) {
      setCoursePath(null)
      setLessonPath(null)
      setQuizPath(null)
      return
    }

    const nextCoursePath =
      `/dashboard/courses/${targetCourseId}`

    setCoursePath(nextCoursePath)

    let targetLessonId = currentLessonId

    // Course дотор байгаа ч lesson сонгогдоогүй бол
    // эхний published lesson-г авна.
    if (!targetLessonId) {
      const {
        data: modules,
      } = await supabase
        .from('modules')
        .select('id, position')
        .eq('course_id', targetCourseId)
        .order('position', {
          ascending: true,
        })

      if (!modules?.length) {
        setLessonPath(null)
        setQuizPath(null)
        return
      }

      const moduleIds =
        modules.map((module) => module.id)

      const {
        data: lessons,
      } = await supabase
        .from('lessons')
        .select('id, module_id, position')
        .in('module_id', moduleIds)
        .eq('published', true)
        .order('position', {
          ascending: true,
        })

      if (!lessons?.length) {
        setLessonPath(null)
        setQuizPath(null)
        return
      }

      targetLessonId = lessons[0].id
    }

    const nextLessonPath =
      `/dashboard/courses/${targetCourseId}/lessons/${targetLessonId}`

    setLessonPath(nextLessonPath)

    const {
      data: quiz,
    } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson_id', targetLessonId)
      .limit(1)
      .maybeSingle()

    if (quiz) {
      setQuizPath(
        `/dashboard/courses/${targetCourseId}/lessons/${targetLessonId}/quiz`
      )
    } else {
      setQuizPath(null)
    }
  }

  function handleCourseClick() {
    if (!coursePath) return

    setCourseMenuOpen((current) => !current)

    if (!currentCourseId) {
      router.push(coursePath)
    }
  }

  function getPageTitle() {
    if (pathname === '/dashboard/payments') {
      return 'Payment'
    }

    if (isQuiz) {
      return 'Quiz'
    }

    if (currentLessonId) {
      return 'Lesson'
    }

    if (currentCourseId) {
      return 'Course'
    }

    return 'Dashboard'
  }

  const dashboardActive =
    pathname === '/dashboard'

  const paymentActive =
    pathname === '/dashboard/payments'

  const courseActive =
    Boolean(currentCourseId)

  const lessonActive =
    Boolean(currentLessonId) &&
    !isQuiz

  const quizActive =
    isQuiz

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <button
            type="button"
            onClick={() =>
              router.push('/dashboard')
            }
            style={styles.logoButton}
          >
            LEARN
            <span style={styles.logoDot}>·</span>
            MINEA
          </button>

          <div style={styles.sectionLabel}>
            LEARNING
          </div>

          <nav style={styles.nav}>
            {/* DASHBOARD */}
            <button
              type="button"
              onClick={() =>
                router.push('/dashboard')
              }
              style={{
                ...styles.navButton,
                ...(dashboardActive
                  ? styles.navButtonActive
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.navIndicator,
                  ...(dashboardActive
                    ? styles.navIndicatorActive
                    : {}),
                }}
              />

              <span>
                Dashboard
              </span>
            </button>

            {/* PAYMENT */}
            <button
              type="button"
              onClick={() =>
                router.push('/dashboard/payments')
              }
              style={{
                ...styles.navButton,
                ...(paymentActive
                  ? styles.navButtonActive
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.navIndicator,
                  ...(paymentActive
                    ? styles.navIndicatorActive
                    : {}),
                }}
              />

              <span>
                Payment
              </span>
            </button>

            {/* COURSE */}
            <button
              type="button"
              disabled={!coursePath}
              onClick={handleCourseClick}
              style={{
                ...styles.navButton,

                ...(courseActive
                  ? styles.navButtonActive
                  : {}),

                ...(!coursePath
                  ? styles.navButtonDisabled
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.navIndicator,

                  ...(courseActive
                    ? styles.navIndicatorActive
                    : {}),
                }}
              />

              <span>
                Course
              </span>

              <span style={styles.arrow}>
                {courseMenuOpen
                  ? '⌄'
                  : '›'}
              </span>
            </button>

            {/* COURSE SUB MENU */}
            {courseMenuOpen &&
              coursePath && (
                <div style={styles.subMenu}>
                  <button
                    type="button"
                    disabled={!lessonPath}
                    onClick={() => {
                      if (lessonPath) {
                        router.push(
                          lessonPath
                        )
                      }
                    }}
                    style={{
                      ...styles.subButton,

                      ...(lessonActive
                        ? styles.subButtonActive
                        : {}),

                      ...(!lessonPath
                        ? styles.subButtonDisabled
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.subLineDot,

                        ...(lessonActive
                          ? styles.subLineDotActive
                          : {}),
                      }}
                    />

                    Lesson
                  </button>

                  <button
                    type="button"
                    disabled={!quizPath}
                    onClick={() => {
                      if (quizPath) {
                        router.push(
                          quizPath
                        )
                      }
                    }}
                    style={{
                      ...styles.subButton,

                      ...(quizActive
                        ? styles.subButtonActive
                        : {}),

                      ...(!quizPath
                        ? styles.subButtonDisabled
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.subLineDot,

                        ...(quizActive
                          ? styles.subLineDotActive
                          : {}),
                      }}
                    />

                    Quiz
                  </button>
                </div>
              )}
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.keyboardHint}>
            <span style={styles.key}>
              TAB
            </span>

            <span>navigate</span>

            <span style={styles.key}>
              ↵
            </span>

            <span>open</span>
          </div>

          <div style={styles.version}>
            LEARN·MINEA
          </div>
        </div>
      </aside>

      {/* RIGHT */}
      <div style={styles.right}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.topbarLabel}>
              STUDENT PORTAL
            </div>

            <div style={styles.pageTitle}>
              {getPageTitle()}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push('/dashboard')
            }
            style={styles.homeButton}
          >
            My Learning
          </button>
        </header>

        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#F8F7FF',
  },

  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,

    width: '250px',
    height: '100vh',

    boxSizing: 'border-box',

    padding: '30px 20px 22px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    background: '#FFFFFF',

    borderRight:
      '1px solid #ECE9F6',

    zIndex: 20,
  },

  logoButton: {
    border: 'none',
    background: 'transparent',

    padding: 0,
    margin: '0 10px',

    color: '#292833',

    fontSize: '18px',
    fontWeight: '900',

    cursor: 'pointer',
  },

  logoDot: {
    color: '#6C5CE7',
  },

  sectionLabel: {
    margin:
      '38px 10px 12px',

    color: '#AAA7B2',

    fontSize: '10px',
    fontWeight: '900',

    letterSpacing: '1.6px',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  navButton: {
    width: '100%',

    border: 'none',
    borderRadius: '12px',

    padding:
      '12px 14px 12px 18px',

    display: 'flex',
    alignItems: 'center',

    gap: '12px',

    background: 'transparent',
    color: '#77747F',

    fontSize: '13px',
    fontWeight: '700',

    textAlign: 'left',

    cursor: 'pointer',
  },

  navButtonActive: {
    background: '#F2EFFF',
    color: '#6C5CE7',
  },

  navButtonDisabled: {
    color: '#D1CED8',
    cursor: 'default',
  },

  navIndicator: {
    width: '6px',
    height: '6px',

    flexShrink: 0,

    borderRadius: '999px',

    background: '#D5D1DE',
  },

  navIndicatorActive: {
    background: '#6C5CE7',
  },

  arrow: {
    marginLeft: 'auto',

    color: '#AAA6B4',

    fontSize: '16px',
    fontWeight: '800',
  },

  subMenu: {
    position: 'relative',

    margin:
      '0 0 4px 31px',

    paddingLeft: '16px',

    display: 'flex',
    flexDirection: 'column',
    gap: '3px',

    borderLeft:
      '1px solid #E5E1F0',
  },

  subButton: {
    width: '100%',

    border: 'none',
    borderRadius: '9px',

    padding: '10px 12px',

    display: 'flex',
    alignItems: 'center',

    gap: '10px',

    background: 'transparent',

    color: '#87838F',

    fontSize: '12px',
    fontWeight: '700',

    textAlign: 'left',

    cursor: 'pointer',
  },

  subButtonActive: {
    background: '#F7F5FF',
    color: '#6C5CE7',
  },

  subButtonDisabled: {
    color: '#D4D1DA',
    cursor: 'default',
  },

  subLineDot: {
    width: '5px',
    height: '5px',

    borderRadius: '999px',

    background: '#DAD6E1',

    flexShrink: 0,
  },

  subLineDotActive: {
    background: '#6C5CE7',
  },

  sidebarBottom: {
    padding: '0 8px',
  },

  keyboardHint: {
    display: 'flex',
    alignItems: 'center',

    flexWrap: 'wrap',
    gap: '6px',

    marginBottom: '16px',

    color: '#AAA7B2',

    fontSize: '9px',
  },

  key: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    minWidth: '20px',
    height: '20px',

    padding: '0 5px',

    border:
      '1px solid #E5E1EC',

    borderRadius: '5px',

    background: '#FAF9FD',

    color: '#85828D',

    fontSize: '8px',
    fontWeight: '900',
  },

  version: {
    paddingTop: '13px',

    borderTop:
      '1px solid #F0EDF5',

    color: '#C0BDC6',

    fontSize: '9px',
    fontWeight: '800',
  },

  right: {
    marginLeft: '250px',
    minHeight: '100vh',
  },

  topbar: {
    position: 'sticky',
    top: 0,

    height: '82px',

    boxSizing: 'border-box',

    padding: '0 40px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    background:
      'rgba(255,255,255,0.94)',

    borderBottom:
      '1px solid #ECE9F6',

    backdropFilter: 'blur(12px)',

    zIndex: 10,
  },

  topbarLabel: {
    marginBottom: '3px',

    color: '#AAA7B2',

    fontSize: '9px',
    fontWeight: '900',

    letterSpacing: '1.4px',
  },

  pageTitle: {
    color: '#35333D',

    fontSize: '17px',
    fontWeight: '850',
  },

  homeButton: {
    border:
      '1px solid #E4DFF4',

    borderRadius: '10px',

    padding: '9px 14px',

    background: '#FFFFFF',

    color: '#6C5CE7',

    fontSize: '11px',
    fontWeight: '850',

    cursor: 'pointer',
  },

  main: {
    minHeight:
      'calc(100vh - 82px)',
  },
}