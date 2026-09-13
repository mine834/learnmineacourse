'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function StudentDashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])

  useEffect(() => {
    loadDashboard()

    const handleFocus = () => {
      loadDashboard(false)
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  async function loadDashboard(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', currentUser.id)
        .single()

      setProfile(profileData || null)

      /*
       * LIVE ENROLLMENT
       * revoke хийсэн course эндээс шууд алга болно.
       */
      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', currentUser.id)

      if (enrollmentError) {
        throw enrollmentError
      }

      const courseIds = [
        ...new Set(
          (enrollmentData || []).map(
            (item) => item.course_id
          )
        ),
      ]

      if (courseIds.length === 0) {
        setCourses([])
        setModules([])
        setLessons([])
        setProgress([])

        if (showLoading) {
          setLoading(false)
        }

        return
      }

      const [
        courseResult,
        moduleResult,
        progressResult,
      ] = await Promise.all([
        supabase
          .from('courses')
          .select(
            'id, title, description, level, price, published, created_at'
          )
          .in('id', courseIds)
          .eq('published', true),

        supabase
          .from('modules')
          .select(
            'id, course_id, title, position'
          )
          .in('course_id', courseIds)
          .order('position', {
            ascending: true,
          }),

        supabase
          .from('lesson_progress')
          .select(
            'lesson_id, completed, completed_at'
          )
          .eq('user_id', currentUser.id),
      ])

      if (courseResult.error) {
        throw courseResult.error
      }

      if (moduleResult.error) {
        throw moduleResult.error
      }

      if (progressResult.error) {
        throw progressResult.error
      }

      const liveCourses =
        courseResult.data || []

      const liveModules =
        moduleResult.data || []

      const moduleIds =
        liveModules.map(
          (module) => module.id
        )

      let lessonData = []

      if (moduleIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from('lessons')
          .select(
            'id, module_id, title, position, published'
          )
          .in('module_id', moduleIds)
          .eq('published', true)
          .order('position', {
            ascending: true,
          })

        if (error) {
          throw error
        }

        lessonData = data || []
      }

      setCourses(liveCourses)
      setModules(liveModules)
      setLessons(lessonData)
      setProgress(
        progressResult.data || []
      )
    } catch (error) {
      console.error(
        'Dashboard load error:',
        error
      )

      alert(
        error?.message ||
          'Dashboard ачааллахад алдаа гарлаа.'
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const completedLessonIds = useMemo(() => {
    return new Set(
      progress
        .filter(
          (item) =>
            item.completed === true
        )
        .map(
          (item) => item.lesson_id
        )
    )
  }, [progress])

  function getCourseData(course) {
    const courseModules =
      modules
        .filter(
          (module) =>
            module.course_id ===
            course.id
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        )

    const moduleIds =
      new Set(
        courseModules.map(
          (module) => module.id
        )
      )

    const courseLessons =
      lessons
        .filter(
          (lesson) =>
            moduleIds.has(
              lesson.module_id
            )
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        )

    const completed =
      courseLessons.filter(
        (lesson) =>
          completedLessonIds.has(
            lesson.id
          )
      ).length

    const total =
      courseLessons.length

    const percentage =
      total > 0
        ? Math.round(
            (completed / total) *
              100
          )
        : 0

    const isCompleted =
      total > 0 &&
      completed === total

    const nextLesson =
      courseLessons.find(
        (lesson) =>
          !completedLessonIds.has(
            lesson.id
          )
      ) ||
      courseLessons[0] ||
      null

    return {
      total,
      completed,
      percentage,
      isCompleted,
      nextLesson,
    }
  }

  function openCourse(course) {
    router.push(
      `/dashboard/courses/${course.id}`
    )
  }

  function continueCourse(course) {
    const data =
      getCourseData(course)

    if (data.nextLesson) {
      router.push(
        `/dashboard/courses/${course.id}/lessons/${data.nextLesson.id}`
      )

      return
    }

    openCourse(course)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="loading">
        Dashboard ачааллаж байна...

        <style jsx>{`
          .loading {
            padding: 50px 32px;
            color: #9995a4;
          }
        `}</style>
      </div>
    )
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">
            STUDENT DASHBOARD
          </div>

          <h1>
            Сайн уу
            {profile?.full_name
              ? `, ${profile.full_name}`
              : ''}
            .
          </h1>

          <p>
            Сургалтаа үргэлжлүүлж,
            хичээлүүдийн progress-оо
            эндээс хянаарай.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="refresh"
            onClick={() =>
              loadDashboard(false)
            }
          >
            ↻ Шинэчлэх
          </button>

          <button
            className="logout"
            onClick={logout}
          >
            Гарах
          </button>
        </div>
      </header>

      {courses.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon">
            ◇
          </div>

          <div className="empty-label">
            MY COURSES
          </div>

          <h2>
            Одоогоор идэвхтэй
            сургалт байхгүй байна.
          </h2>

          <p>
            Сургалтын төлбөр
            баталгаажсаны дараа таны
            сургалт энд автоматаар
            нэмэгдэнэ.
          </p>

          <button
            onClick={() =>
              router.push(
                '/dashboard/payments'
              )
            }
          >
            Төлбөрийн хэсэг рүү →
          </button>
        </section>
      ) : (
        <>
          <section className="overview">
            <div className="overview-card">
              <span>
                ACTIVE COURSES
              </span>

              <strong>
                {
                  courses.filter(
                    (course) =>
                      !getCourseData(
                        course
                      ).isCompleted
                  ).length
                }
              </strong>
            </div>

            <div className="overview-card">
              <span>
                COMPLETED
              </span>

              <strong>
                {
                  courses.filter(
                    (course) =>
                      getCourseData(
                        course
                      ).isCompleted
                  ).length
                }
              </strong>
            </div>

            <div className="overview-card">
              <span>
                TOTAL COURSES
              </span>

              <strong>
                {courses.length}
              </strong>
            </div>
          </section>

          <section className="courses-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  MY COURSES
                </div>

                <h2>
                  Миний сургалтууд
                </h2>
              </div>
            </div>

            <div className="course-grid">
              {courses.map(
                (course) => {
                  const data =
                    getCourseData(
                      course
                    )

                  return (
                    <article
                      className={`course-card ${
                        data.isCompleted
                          ? 'completed'
                          : ''
                      }`}
                      key={course.id}
                    >
                      <div className="course-top">
                        <span
                          className={`badge ${
                            data.isCompleted
                              ? 'done'
                              : ''
                          }`}
                        >
                          {data.isCompleted
                            ? 'COMPLETED'
                            : 'ACTIVE'}
                        </span>

                        {course.level && (
                          <span className="level">
                            {
                              course.level
                            }
                          </span>
                        )}
                      </div>

                      <h3>
                        {course.title}
                      </h3>

                      <p className="description">
                        {course.description ||
                          'Сургалтын хичээлүүдээ дарааллаар нь үзэж progress-оо ахиулаарай.'}
                      </p>

                      <div className="progress-info">
                        <div>
                          <span>
                            PROGRESS
                          </span>

                          <strong>
                            {
                              data.completed
                            }
                            /
                            {data.total}
                          </strong>
                        </div>

                        <b>
                          {
                            data.percentage
                          }
                          %
                        </b>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${data.percentage}%`,
                          }}
                        />
                      </div>

                      {data.isCompleted ? (
                        <div className="completed-message">
                          <span>
                            ✓
                          </span>

                          Сургалтаа амжилттай
                          дуусгалаа
                        </div>
                      ) : data.nextLesson ? (
                        <div className="next-lesson">
                          <span>
                            NEXT LESSON
                          </span>

                          <strong>
                            {
                              data.nextLesson
                                .title
                            }
                          </strong>
                        </div>
                      ) : (
                        <div className="next-lesson">
                          <span>
                            COURSE
                          </span>

                          <strong>
                            Хичээл удахгүй
                            нэмэгдэнэ
                          </strong>
                        </div>
                      )}

                      <div className="course-actions">
                        <button
                          className="secondary"
                          onClick={() =>
                            openCourse(
                              course
                            )
                          }
                        >
                          Сургалт үзэх
                        </button>

                        <button
                          className="primary"
                          onClick={() =>
                            continueCourse(
                              course
                            )
                          }
                        >
                          {data.isCompleted
                            ? 'Дахин үзэх'
                            : data.completed >
                                0
                              ? 'Үргэлжлүүлэх →'
                              : 'Суралцах →'}
                        </button>
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          </section>
        </>
      )}

      <style jsx>{`
        .dashboard {
          width: 100%;
          max-width: 1180px;
          padding: 48px 36px 100px;
          color: #302e38;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #6c5ce7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .header h1 {
          margin: 9px 0 0;
          font-size: 32px;
          letter-spacing: -0.045em;
        }

        .header p {
          max-width: 600px;
          margin: 10px 0 0;
          color: #9995a3;
          font-size: 14px;
          line-height: 1.65;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .refresh,
        .logout {
          border: 1px solid #e1ddec;
          border-radius: 10px;
          padding: 10px 13px;
          background: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .refresh {
          color: #6c5ce7;
        }

        .logout {
          color: #7e7986;
        }

        .overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 38px;
        }

        .overview-card {
          padding: 20px;
          border: 1px solid #e9e5f1;
          border-radius: 16px;
          background: white;
        }

        .overview-card span {
          display: block;
          margin-bottom: 12px;
          color: #a09ba8;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .overview-card strong {
          font-size: 27px;
          color: #4c4854;
        }

        .section-heading {
          margin-bottom: 17px;
        }

        .section-heading h2 {
          margin: 7px 0 0;
          font-size: 23px;
        }

        .course-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 18px;
        }

        .course-card {
          padding: 25px;
          border: 1px solid #e7e3ed;
          border-radius: 20px;
          background: white;
        }

        .course-card.completed {
          border-color: #cfe8d8;
        }

        .course-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .badge {
          padding: 7px 10px;
          border-radius: 999px;
          background: #efedff;
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .badge.done {
          background: #e8f7ed;
          color: #318255;
        }

        .level {
          color: #a39eaa;
          font-size: 10px;
          font-weight: 700;
        }

        .course-card h3 {
          margin: 20px 0 8px;
          font-size: 23px;
          letter-spacing: -0.03em;
        }

        .description {
          min-height: 44px;
          margin: 0;
          color: #96919f;
          font-size: 12px;
          line-height: 1.65;
        }

        .progress-info {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 24px;
        }

        .progress-info span {
          display: block;
          margin-bottom: 5px;
          color: #aaa5b1;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .progress-info strong {
          color: #5b5662;
          font-size: 12px;
        }

        .progress-info b {
          color: #6c5ce7;
          font-size: 14px;
        }

        .progress-track {
          height: 6px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #efedf4;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #6c5ce7;
          transition: width 0.25s ease;
        }

        .completed .progress-fill {
          background: #48a46e;
        }

        .next-lesson,
        .completed-message {
          margin-top: 22px;
          padding: 14px;
          border-radius: 12px;
        }

        .next-lesson {
          background: #f8f7fc;
        }

        .next-lesson span {
          display: block;
          margin-bottom: 5px;
          color: #a29da9;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .next-lesson strong {
          font-size: 12px;
          color: #55515c;
        }

        .completed-message {
          background: #ebf8ef;
          color: #347e51;
          font-size: 12px;
          font-weight: 800;
        }

        .completed-message span {
          margin-right: 6px;
        }

        .course-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 18px;
        }

        .course-actions button {
          min-height: 43px;
          border-radius: 11px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .secondary {
          border: 1px solid #ded9e8;
          background: white;
          color: #67616f;
        }

        .primary {
          border: 0;
          background: #6c5ce7;
          color: white;
        }

        .empty-state {
          padding: 70px 30px;
          border: 1px solid #e8e4ef;
          border-radius: 22px;
          background: white;
          text-align: center;
        }

        .empty-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 17px;
          background: #f0edff;
          color: #6c5ce7;
          font-size: 25px;
        }

        .empty-label {
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .empty-state h2 {
          margin: 9px 0;
          font-size: 22px;
        }

        .empty-state p {
          max-width: 460px;
          margin: 0 auto;
          color: #9994a2;
          font-size: 13px;
          line-height: 1.7;
        }

        .empty-state button {
          margin-top: 22px;
          padding: 12px 18px;
          border: 0;
          border-radius: 11px;
          background: #6c5ce7;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .course-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .dashboard {
            padding: 28px 16px 110px;
          }

          .header {
            flex-direction: column;
          }

          .header h1 {
            font-size: 26px;
          }

          .overview {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .overview-card {
            padding: 15px 12px;
          }

          .overview-card strong {
            font-size: 22px;
          }

          .course-card {
            padding: 19px;
          }

          .course-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 420px) {
          .overview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}