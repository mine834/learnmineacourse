'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

export default function StudentLessonPage() {
  const router = useRouter()
  const params = useParams()

  const courseId = params?.courseId
  const lessonId = params?.lessonId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [module, setModule] = useState(null)

  const [allModules, setAllModules] = useState([])
  const [allLessons, setAllLessons] = useState([])
  const [progress, setProgress] = useState([])

  const [completed, setCompleted] = useState(false)
  const [hasQuiz, setHasQuiz] = useState(false)

  useEffect(() => {
    if (courseId && lessonId) {
      loadLesson()
    }

    const handleFocus = () => {
      if (courseId && lessonId) {
        loadLesson(false)
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [courseId, lessonId])

  async function loadLesson(showLoading = true) {
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

      // LIVE ACCESS CHECK
      const {
        data: enrollment,
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

      if (!enrollment) {
        router.replace('/dashboard')
        return
      }

      const [
        courseResult,
        modulesResult,
        progressResult,
      ] = await Promise.all([
        supabase
          .from('courses')
          .select(
            'id, title, description, level, published'
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

      if (modulesResult.error) {
        throw modulesResult.error
      }

      if (progressResult.error) {
        throw progressResult.error
      }

      const moduleData =
        modulesResult.data || []

      const moduleIds =
        moduleData.map(
          (item) => item.id
        )

      let lessonData = []

      if (moduleIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from('lessons')
          .select(
            `
            id,
            module_id,
            title,
            description,
            content,
            video_url,
            position,
            published
            `
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

      const currentLesson =
        lessonData.find(
          (item) =>
            item.id === lessonId
        )

      if (!currentLesson) {
        router.replace(
          `/dashboard/courses/${courseId}`
        )
        return
      }

      const currentModule =
        moduleData.find(
          (item) =>
            item.id ===
            currentLesson.module_id
        ) || null

      const currentProgress =
        (progressResult.data || []).find(
          (item) =>
            item.lesson_id ===
            lessonId
        )

      const {
        data: quizData,
        error: quizError,
      } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (quizError) {
        throw quizError
      }

      setCourse(courseResult.data)
      setAllModules(moduleData)
      setAllLessons(lessonData)
      setProgress(
        progressResult.data || []
      )

      setLesson(currentLesson)
      setModule(currentModule)

      setCompleted(
        currentProgress?.completed ===
          true
      )

      setHasQuiz(Boolean(quizData))
    } catch (error) {
      console.error(
        'Lesson load error:',
        error
      )

      router.replace('/dashboard')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const orderedLessons = useMemo(() => {
    const modulePosition = new Map(
      allModules.map(
        (item, index) => [
          item.id,
          item.position ?? index,
        ]
      )
    )

    return [...allLessons].sort(
      (a, b) => {
        const moduleA =
          modulePosition.get(
            a.module_id
          ) ?? 0

        const moduleB =
          modulePosition.get(
            b.module_id
          ) ?? 0

        if (moduleA !== moduleB) {
          return moduleA - moduleB
        }

        return (
          (a.position || 0) -
          (b.position || 0)
        )
      }
    )
  }, [allLessons, allModules])

  const currentIndex =
    orderedLessons.findIndex(
      (item) => item.id === lessonId
    )

  const previousLesson =
    currentIndex > 0
      ? orderedLessons[
          currentIndex - 1
        ]
      : null

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      orderedLessons.length - 1
      ? orderedLessons[
          currentIndex + 1
        ]
      : null

  const completedIds = useMemo(() => {
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

  const courseProgress =
    orderedLessons.length > 0
      ? Math.round(
          (completedIds.size /
            orderedLessons.length) *
            100
        )
      : 0

  async function markCompleted() {
    if (!lessonId) {
      return
    }

    try {
      setSaving(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const {
        error,
      } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id:
              session.user.id,
            lesson_id:
              lessonId,
            completed: true,
            completed_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              'user_id,lesson_id',
          }
        )

      if (error) {
        throw error
      }

      setCompleted(true)

      await loadLesson(false)
    } catch (error) {
      console.error(
        'Complete lesson error:',
        error
      )

      alert(
        error?.message ||
          'Хичээл дуусгасан төлөв хадгалах үед алдаа гарлаа.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function markIncomplete() {
    try {
      setSaving(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const {
        error,
      } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id:
              session.user.id,
            lesson_id:
              lessonId,
            completed: false,
            completed_at: null,
          },
          {
            onConflict:
              'user_id,lesson_id',
          }
        )

      if (error) {
        throw error
      }

      setCompleted(false)

      await loadLesson(false)
    } catch (error) {
      console.error(
        'Reset lesson error:',
        error
      )
    } finally {
      setSaving(false)
    }
  }

  function openLesson(target) {
    if (!target) {
      return
    }

    router.push(
      `/dashboard/courses/${courseId}/lessons/${target.id}`
    )
  }

  if (loading) {
    return (
      <div className="loading">
        Хичээл ачааллаж байна...

        <style jsx>{`
          .loading {
            padding: 50px 32px;
            color: #9995a4;
          }
        `}</style>
      </div>
    )
  }

  if (!lesson || !course) {
    return null
  }

  return (
    <main className="lesson-page">
      <div className="topbar">
        <button
          className="back"
          onClick={() =>
            router.push(
              `/dashboard/courses/${courseId}`
            )
          }
        >
          ← Сургалт руу
        </button>

        <div className="course-progress">
          <span>
            COURSE PROGRESS
          </span>

          <strong>
            {courseProgress}%
          </strong>
        </div>
      </div>

      <section className="lesson-header">
        <div className="eyebrow">
          {module?.title ||
            'LESSON'}
        </div>

        <div className="lesson-meta">
          <span>
            LESSON{' '}
            {currentIndex + 1}
          </span>

          {completed && (
            <span className="completed-badge">
              ✓ COMPLETED
            </span>
          )}
        </div>

        <h1>
          {lesson.title}
        </h1>

        {lesson.description && (
          <p>
            {lesson.description}
          </p>
        )}
      </section>

      {lesson.video_url && (
        <section className="video-card">
          <video
            src={lesson.video_url}
            controls
            playsInline
            preload="metadata"
          />
        </section>
      )}

      {lesson.content && (
        <section className="content-card">
          <div className="section-label">
            LESSON CONTENT
          </div>

          <div className="lesson-content">
            {lesson.content
              .split('\n')
              .map(
                (line, index) => {
                  if (!line.trim()) {
                    return (
                      <div
                        key={index}
                        className="space"
                      />
                    )
                  }

                  return (
                    <p key={index}>
                      {line}
                    </p>
                  )
                }
              )}
          </div>
        </section>
      )}

      <section className="action-card">
        <div>
          <div className="section-label">
            PROGRESS
          </div>

          <h2>
            {completed
              ? 'Энэ хичээл дууссан.'
              : 'Хичээлээ дуусгасан уу?'}
          </h2>

          <p>
            {completed
              ? 'Progress дээр completed гэж хадгалагдсан байна.'
              : 'Хичээлээ үзэж дууссаны дараа completed болгоно уу.'}
          </p>
        </div>

        {!completed ? (
          <button
            className="complete-button"
            onClick={markCompleted}
            disabled={saving}
          >
            {saving
              ? 'Хадгалж байна...'
              : '✓ Хичээл дуусгах'}
          </button>
        ) : (
          <button
            className="reset-button"
            onClick={markIncomplete}
            disabled={saving}
          >
            Completed цуцлах
          </button>
        )}
      </section>

      {hasQuiz && (
        <section className="quiz-card">
          <div>
            <div className="section-label">
              QUIZ
            </div>

            <h2>
              Хичээлийн quiz
            </h2>

            <p>
              Хичээлээ бататгах
              quiz-аа ажиллаарай.
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                `/dashboard/courses/${courseId}/lessons/${lessonId}/quiz`
              )
            }
          >
            Quiz эхлэх →
          </button>
        </section>
      )}

      <section className="navigation">
        <button
          className="nav-button"
          disabled={!previousLesson}
          onClick={() =>
            openLesson(
              previousLesson
            )
          }
        >
          <span>
            PREVIOUS
          </span>

          <strong>
            {previousLesson
              ? `← ${previousLesson.title}`
              : 'Эхний хичээл'}
          </strong>
        </button>

        <button
          className="nav-button next"
          disabled={!nextLesson}
          onClick={() =>
            openLesson(nextLesson)
          }
        >
          <span>
            NEXT
          </span>

          <strong>
            {nextLesson
              ? `${nextLesson.title} →`
              : 'Сүүлийн хичээл'}
          </strong>
        </button>
      </section>

      <style jsx>{`
        .lesson-page {
          width: 100%;
          max-width: 980px;
          padding: 42px 32px 100px;
          color: #302e38;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .back {
          border: 0;
          padding: 0;
          background: transparent;
          color: #8d8994;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .course-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .course-progress span {
          color: #aaa5b0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .course-progress strong {
          color: #6c5ce7;
          font-size: 12px;
        }

        .lesson-header {
          margin-bottom: 28px;
        }

        .eyebrow,
        .section-label {
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .lesson-meta {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .lesson-meta span {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          background: #efedff;
          color: #6c5ce7;
          font-size: 8px;
          font-weight: 900;
        }

        .lesson-meta .completed-badge {
          background: #e6f6ec;
          color: #347f52;
        }

        .lesson-header h1 {
          margin: 18px 0 10px;
          font-size: 34px;
          letter-spacing: -0.045em;
        }

        .lesson-header p {
          max-width: 680px;
          margin: 0;
          color: #96919e;
          font-size: 14px;
          line-height: 1.7;
        }

        .video-card {
          overflow: hidden;
          margin-bottom: 24px;
          border: 1px solid #e7e3ed;
          border-radius: 20px;
          background: #111;
        }

        .video-card video {
          display: block;
          width: 100%;
          max-height: 560px;
          background: #111;
        }

        .content-card,
        .action-card,
        .quiz-card {
          margin-bottom: 20px;
          padding: 28px;
          border: 1px solid #e7e3ed;
          border-radius: 20px;
          background: white;
        }

        .lesson-content {
          margin-top: 20px;
        }

        .lesson-content p {
          margin: 0 0 12px;
          color: #55515d;
          font-size: 14px;
          line-height: 1.85;
          white-space: pre-wrap;
        }

        .space {
          height: 12px;
        }

        .action-card,
        .quiz-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .action-card h2,
        .quiz-card h2 {
          margin: 8px 0 5px;
          font-size: 18px;
        }

        .action-card p,
        .quiz-card p {
          margin: 0;
          color: #9994a1;
          font-size: 12px;
          line-height: 1.6;
        }

        .complete-button,
        .quiz-card button {
          flex: 0 0 auto;
          padding: 12px 17px;
          border: 0;
          border-radius: 11px;
          background: #6c5ce7;
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .reset-button {
          flex: 0 0 auto;
          padding: 12px 17px;
          border: 1px solid #ded9e7;
          border-radius: 11px;
          background: white;
          color: #797480;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .navigation {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 28px;
        }

        .nav-button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          min-height: 78px;
          padding: 18px;
          border: 1px solid #e3dfea;
          border-radius: 15px;
          background: white;
          text-align: left;
          cursor: pointer;
        }

        .nav-button.next {
          align-items: flex-end;
          text-align: right;
        }

        .nav-button span {
          color: #aaa5b0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .nav-button strong {
          color: #5a5561;
          font-size: 12px;
        }

        @media (max-width: 650px) {
          .lesson-page {
            padding: 28px 16px 100px;
          }

          .lesson-header h1 {
            font-size: 27px;
          }

          .content-card,
          .action-card,
          .quiz-card {
            padding: 20px;
          }

          .action-card,
          .quiz-card {
            align-items: stretch;
            flex-direction: column;
          }

          .complete-button,
          .reset-button,
          .quiz-card button {
            width: 100%;
          }

          .navigation {
            grid-template-columns: 1fr;
          }

          .nav-button.next {
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </main>
  )
}