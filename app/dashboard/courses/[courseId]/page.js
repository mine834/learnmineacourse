'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function StudentCoursePage() {
  const router = useRouter()
  const params = useParams()

  const courseId = params?.courseId

  const [loading, setLoading] = useState(true)

  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }

    const handleFocus = () => {
      if (courseId) {
        loadCourse(false)
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [courseId])

  async function loadCourse(showLoading = true) {
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

      const userId = session.user.id

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (enrollmentError) {
        throw enrollmentError
      }

      if (!enrollmentData) {
        router.replace('/dashboard')
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
          .eq('id', courseId)
          .eq('published', true)
          .single(),

        supabase
          .from('modules')
          .select(
            'id, course_id, title, position'
          )
          .eq('course_id', courseId)
          .order('position', {
            ascending: true,
          }),

        supabase
          .from('lesson_progress')
          .select(
            'lesson_id, completed, completed_at'
          )
          .eq('user_id', userId),
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
            'id, module_id, title, description, position, published'
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

      setCourse(courseResult.data)
      setModules(liveModules)
      setLessons(lessonData)
      setProgress(
        progressResult.data || []
      )
    } catch (error) {
      console.error(
        'Course page load error:',
        error
      )

      router.replace('/dashboard')
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

  const courseStats = useMemo(() => {
    const total = lessons.length

    const completed =
      lessons.filter(
        (lesson) =>
          completedLessonIds.has(
            lesson.id
          )
      ).length

    const percentage =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0

    return {
      total,
      completed,
      percentage,
      isCompleted:
        total > 0 &&
        total === completed,
    }
  }, [
    lessons,
    completedLessonIds,
  ])

  function getModuleLessons(moduleId) {
    return lessons
      .filter(
        (lesson) =>
          lesson.module_id === moduleId
      )
      .sort(
        (a, b) =>
          (a.position || 0) -
          (b.position || 0)
      )
  }

  function openLesson(lessonId) {
    router.push(
      `/dashboard/courses/${courseId}/lessons/${lessonId}`
    )
  }

  function continueLearning() {
    const nextLesson =
      lessons.find(
        (lesson) =>
          !completedLessonIds.has(
            lesson.id
          )
      )

    const target =
      nextLesson ||
      lessons[0]

    if (!target) {
      return
    }

    openLesson(target.id)
  }

  if (loading) {
    return (
      <div className="loading">
        Сургалт ачааллаж байна...

        <style jsx>{`
          .loading {
            padding: 50px 32px;
            color: #9995a4;
          }
        `}</style>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <main className="course-page">
      <button
        className="back-button"
        onClick={() =>
          router.push('/dashboard')
        }
      >
        ← Dashboard
      </button>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            MY COURSE
          </div>

          <div className="hero-meta">
            {course.level && (
              <span>
                {course.level}
              </span>
            )}

            {courseStats.isCompleted && (
              <span className="completed-badge">
                COMPLETED
              </span>
            )}
          </div>

          <h1>
            {course.title}
          </h1>

          <p>
            {course.description ||
              'Сургалтын хичээлүүдээ дарааллаар нь үзэж дуусгаарай.'}
          </p>

          <div className="progress-row">
            <div>
              <span>
                COURSE PROGRESS
              </span>

              <strong>
                {courseStats.completed}/
                {courseStats.total} хичээл
              </strong>
            </div>

            <b>
              {courseStats.percentage}%
            </b>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${courseStats.percentage}%`,
              }}
            />
          </div>

          {lessons.length > 0 && (
            <button
              className="continue-button"
              onClick={continueLearning}
            >
              {courseStats.isCompleted
                ? 'Дахин үзэх →'
                : courseStats.completed > 0
                  ? 'Үргэлжлүүлэх →'
                  : 'Эхлэх →'}
            </button>
          )}
        </div>
      </section>

      <section className="curriculum-section">
        <div className="section-heading">
          <div className="eyebrow">
            CURRICULUM
          </div>

          <h2>
            Хичээлийн бүтэц
          </h2>
        </div>

        {modules.length === 0 ? (
          <div className="empty">
            Одоогоор module нэмэгдээгүй байна.
          </div>
        ) : (
          <div className="module-list">
            {modules.map(
              (module, moduleIndex) => {
                const moduleLessons =
                  getModuleLessons(
                    module.id
                  )

                const moduleCompleted =
                  moduleLessons.filter(
                    (lesson) =>
                      completedLessonIds.has(
                        lesson.id
                      )
                  ).length

                return (
                  <section
                    className="module-card"
                    key={module.id}
                  >
                    <div className="module-header">
                      <div className="module-left">
                        <div className="module-number">
                          {String(
                            moduleIndex + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </div>

                        <div>
                          <span>
                            MODULE
                          </span>

                          <h3>
                            {module.title}
                          </h3>
                        </div>
                      </div>

                      <div className="module-stat">
                        {moduleCompleted}/
                        {
                          moduleLessons.length
                        }
                      </div>
                    </div>

                    {moduleLessons.length ===
                    0 ? (
                      <div className="no-lessons">
                        Хичээл хараахан
                        нэмэгдээгүй байна.
                      </div>
                    ) : (
                      <div className="lesson-list">
                        {moduleLessons.map(
                          (
                            lesson,
                            lessonIndex
                          ) => {
                            const completed =
                              completedLessonIds.has(
                                lesson.id
                              )

                            return (
                              <button
                                className="lesson-row"
                                key={
                                  lesson.id
                                }
                                onClick={() =>
                                  openLesson(
                                    lesson.id
                                  )
                                }
                              >
                                <div className="lesson-left">
                                  <div
                                    className={`lesson-icon ${
                                      completed
                                        ? 'completed'
                                        : ''
                                    }`}
                                  >
                                    {completed
                                      ? '✓'
                                      : lessonIndex +
                                        1}
                                  </div>

                                  <div className="lesson-text">
                                    <span>
                                      LESSON{' '}
                                      {lessonIndex +
                                        1}
                                    </span>

                                    <strong>
                                      {
                                        lesson.title
                                      }
                                    </strong>

                                    {lesson.description && (
                                      <p>
                                        {
                                          lesson.description
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="lesson-right">
                                  <span
                                    className={`lesson-status ${
                                      completed
                                        ? 'done'
                                        : ''
                                    }`}
                                  >
                                    {completed
                                      ? 'COMPLETED'
                                      : 'START'}
                                  </span>

                                  <b>→</b>
                                </div>
                              </button>
                            )
                          }
                        )}
                      </div>
                    )}
                  </section>
                )
              }
            )}
          </div>
        )}
      </section>

      <style jsx>{`
        .course-page {
          width: 100%;
          max-width: 1080px;
          padding: 42px 32px 100px;
          color: #302e38;
        }

        .back-button {
          margin-bottom: 20px;
          border: 0;
          background: transparent;
          color: #8d8994;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .hero {
          padding: 38px;
          border: 1px solid #e6e1f2;
          border-radius: 24px;
          background: #f8f7ff;
        }

        .hero-content {
          max-width: 720px;
        }

        .eyebrow {
          color: #6c5ce7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .hero-meta {
          display: flex;
          gap: 8px;
          margin-top: 18px;
        }

        .hero-meta span {
          padding: 7px 10px;
          border-radius: 999px;
          background: #edeaff;
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
        }

        .hero-meta .completed-badge {
          background: #e7f6ec;
          color: #378154;
        }

        .hero h1 {
          margin: 18px 0 10px;
          font-size: 36px;
          letter-spacing: -0.045em;
        }

        .hero p {
          max-width: 620px;
          margin: 0;
          color: #8f8a98;
          font-size: 14px;
          line-height: 1.7;
        }

        .progress-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 28px;
        }

        .progress-row span {
          display: block;
          margin-bottom: 6px;
          color: #a29daa;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .progress-row strong {
          font-size: 13px;
          color: #5a5660;
        }

        .progress-row b {
          color: #6c5ce7;
          font-size: 17px;
        }

        .progress-track {
          height: 7px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #e6e2ef;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #6c5ce7;
          transition: width 0.25s ease;
        }

        .continue-button {
          margin-top: 24px;
          padding: 13px 20px;
          border: 0;
          border-radius: 11px;
          background: #6c5ce7;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .curriculum-section {
          margin-top: 38px;
        }

        .section-heading {
          margin-bottom: 18px;
        }

        .section-heading h2 {
          margin: 7px 0 0;
          font-size: 24px;
        }

        .module-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .module-card {
          overflow: hidden;
          border: 1px solid #e6e2ec;
          border-radius: 20px;
          background: white;
        }

        .module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 22px;
          border-bottom: 1px solid #eeeaf3;
        }

        .module-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .module-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f0edff;
          color: #6c5ce7;
          font-size: 11px;
          font-weight: 900;
        }

        .module-left span {
          display: block;
          margin-bottom: 4px;
          color: #aaa5b0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .module-left h3 {
          margin: 0;
          font-size: 17px;
        }

        .module-stat {
          color: #918c99;
          font-size: 11px;
          font-weight: 800;
        }

        .lesson-list {
          display: flex;
          flex-direction: column;
        }

        .lesson-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 17px 22px;
          border: 0;
          border-bottom: 1px solid #f0edf4;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .lesson-row:last-child {
          border-bottom: 0;
        }

        .lesson-row:hover {
          background: #faf9fd;
        }

        .lesson-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .lesson-icon {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f2eff6;
          color: #89838f;
          font-size: 10px;
          font-weight: 900;
        }

        .lesson-icon.completed {
          background: #e5f5eb;
          color: #398258;
        }

        .lesson-text {
          min-width: 0;
        }

        .lesson-text span {
          display: block;
          margin-bottom: 4px;
          color: #aaa6b0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .lesson-text strong {
          display: block;
          color: #47434d;
          font-size: 13px;
        }

        .lesson-text p {
          margin: 5px 0 0;
          color: #9b96a2;
          font-size: 11px;
          line-height: 1.5;
        }

        .lesson-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .lesson-status {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f0edff;
          color: #6c5ce7;
          font-size: 8px;
          font-weight: 900;
        }

        .lesson-status.done {
          background: #e8f6ec;
          color: #378154;
        }

        .lesson-right b {
          color: #aaa5b0;
        }

        .empty,
        .no-lessons {
          padding: 30px;
          color: #9c97a3;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 650px) {
          .course-page {
            padding: 28px 16px 100px;
          }

          .hero {
            padding: 24px 20px;
          }

          .hero h1 {
            font-size: 28px;
          }

          .module-header {
            padding: 17px;
          }

          .lesson-row {
            padding: 15px 17px;
          }

          .lesson-status {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}