'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [hasQuiz, setHasQuiz] = useState(false)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    initialize()
  }, [courseId, lessonId])

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

    setUserId(session.user.id)

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
      data: lessonData,
      error: lessonError,
    } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('published', true)
      .single()

    if (lessonError) {
      setError('Lesson нээж чадсангүй.')
      setLoading(false)
      return
    }

    const {
      data: moduleData,
      error: moduleError,
    } = await supabase
      .from('modules')
      .select('id, course_id, title')
      .eq('id', lessonData.module_id)
      .single()

    if (
      moduleError ||
      moduleData?.course_id !== courseId
    ) {
      router.replace(
        `/dashboard/courses/${courseId}`
      )
      return
    }

    setLesson({
      ...lessonData,
      moduleTitle: moduleData?.title || '',
    })

    const {
      data: progressData,
    } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', session.user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    setCompleted(
      progressData?.completed === true
    )

    const {
      data: quizData,
      error: quizError,
    } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson_id', lessonId)
      .maybeSingle()

    setHasQuiz(
      !quizError && Boolean(quizData)
    )

    setLoading(false)
  }

  async function markComplete() {
    if (!userId) return

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

    if (error) {
      alert(error.message)
      return
    }

    setCompleted(true)
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return null

    try {
      if (url.includes('youtube.com/watch')) {
        const parsed = new URL(url)
        const videoId =
          parsed.searchParams.get('v')

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }

      if (url.includes('youtu.be/')) {
        const videoId = url
          .split('youtu.be/')[1]
          ?.split('?')[0]

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }

      if (url.includes('youtube.com/embed/')) {
        return url
      }

      return url
    } catch {
      return url
    }
  }

  if (loading) {
    return (
      <div className="lesson-center">
        Lesson ачаалж байна...
      </div>
    )
  }

  if (error) {
    return (
      <div className="lesson-center">
        <div className="error-card">
          <h2>Алдаа гарлаа</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/courses/${courseId}`
              )
            }
          >
            Course руу буцах
          </button>
        </div>

        <style jsx>{`
          .lesson-center {
            min-height: calc(100vh - 76px);
            background: #f8f7ff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
          }

          .error-card {
            width: 100%;
            max-width: 460px;
            background: #fff;
            border: 1px solid #eeeaf7;
            border-radius: 20px;
            padding: 30px;
            box-sizing: border-box;
            text-align: center;
          }

          .error-card h2 {
            margin: 0;
            color: #2b2b33;
          }

          .error-card p {
            margin: 12px 0 22px;
            color: #88868f;
          }

          .error-card button {
            border: none;
            border-radius: 11px;
            padding: 12px 18px;
            background: #6c5ce7;
            color: white;
            font-weight: 800;
            cursor: pointer;
          }
        `}</style>
      </div>
    )
  }

  if (!lesson) return null

  const videoUrl =
    getYouTubeEmbedUrl(lesson.video_url)

  return (
    <>
      <div className="lesson-page">
        <div className="lesson-container">

          {/* HEADER */}
          <section className="lesson-header">
            <div className="header-content">
              <div className="header-copy">
                <p className="eyebrow">
                  {lesson.moduleTitle ||
                    'LESSON'}
                </p>

                <h1>{lesson.title}</h1>

                <p className="subtitle">
                  Хичээлээ үзээд дууссаны дараа
                  completion-оо тэмдэглэнэ.
                </p>
              </div>

              <div
                className={
                  completed
                    ? 'status-badge completed'
                    : 'status-badge pending'
                }
              >
                {completed
                  ? '✓ Дууссан'
                  : 'Үзэж байна'}
              </div>
            </div>
          </section>

          {/* MAIN */}
          <div className="lesson-grid">

            {/* LEFT */}
            <div className="lesson-left">

              {/* VIDEO */}
              {videoUrl ? (
                <div className="video-wrapper">
                  <iframe
                    src={videoUrl}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="no-video">
                  <div className="play-icon">
                    ▶
                  </div>

                  <h3>
                    Видео байхгүй
                  </h3>

                  <p>
                    Энэ lesson-д одоогоор видео
                    нэмээгүй байна.
                  </p>
                </div>
              )}

              {/* MOBILE STATUS */}
              <div className="mobile-status">
                <StatusCard
                  completed={completed}
                  hasQuiz={hasQuiz}
                  markComplete={markComplete}
                  router={router}
                  courseId={courseId}
                  lessonId={lessonId}
                />
              </div>

              {/* CONTENT */}
              {lesson.content && (
                <section className="content-card">
                  <p className="section-label">
                    LESSON CONTENT
                  </p>

                  <h2>
                    Хичээлийн агуулга
                  </h2>

                  <div className="lesson-text">
                    {lesson.content}
                  </div>
                </section>
              )}
            </div>

            {/* DESKTOP STATUS */}
            <aside className="desktop-status">
              <StatusCard
                completed={completed}
                hasQuiz={hasQuiz}
                markComplete={markComplete}
                router={router}
                courseId={courseId}
                lessonId={lessonId}
              />
            </aside>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lesson-page {
          min-height: 100%;
          background: #f8f7ff;
          padding: 40px 48px 80px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .lesson-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          min-width: 0;
        }

        .lesson-header {
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 24px;
          padding: 30px;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f7f4ff 100%
            );
          border: 1px solid #ece8fa;
          border-radius: 24px;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          min-width: 0;
        }

        .header-copy {
          flex: 1;
          min-width: 0;
        }

        .eyebrow {
          margin: 0;
          color: #6c5ce7;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.7px;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .lesson-header h1 {
          margin: 10px 0;
          color: #282830;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .subtitle {
          margin: 0;
          color: #8a8892;
          line-height: 1.6;
          font-size: 14px;
        }

        .status-badge {
          flex-shrink: 0;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-badge.completed {
          background: #eaf8ee;
          color: #218647;
        }

        .status-badge.pending {
          background: #f0ecff;
          color: #6c5ce7;
        }

        .lesson-grid {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 290px;
          gap: 22px;
          align-items: start;
          min-width: 0;
        }

        .lesson-left {
          min-width: 0;
          width: 100%;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          margin-bottom: 22px;
          background: #111;
          border-radius: 20px;
          box-shadow:
            0 12px 40px
            rgba(30, 25, 70, 0.06);
        }

        .video-wrapper iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        .no-video {
          width: 100%;
          min-height: 300px;
          box-sizing: border-box;
          margin-bottom: 22px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #fff;
          border: 1px solid #eeeaf7;
          border-radius: 20px;
        }

        .play-icon {
          width: 58px;
          height: 58px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0ecff;
          border-radius: 16px;
          color: #6c5ce7;
          font-size: 20px;
        }

        .no-video h3 {
          margin: 0;
          color: #303038;
        }

        .no-video p {
          margin: 8px 0 0;
          color: #94929b;
          font-size: 14px;
          line-height: 1.6;
        }

        .content-card {
          width: 100%;
          box-sizing: border-box;
          padding: 26px;
          background: #fff;
          border: 1px solid #eeeaf7;
          border-radius: 20px;
          overflow: hidden;
        }

        .section-label {
          margin: 0;
          color: #a19fab;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .content-card h2 {
          margin: 6px 0 18px;
          color: #2d2d35;
          font-size: 23px;
        }

        .lesson-text {
          max-width: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
          color: #55545d;
          line-height: 1.8;
          font-size: 15px;
        }

        .desktop-status {
          position: sticky;
          top: 100px;
          min-width: 0;
        }

        .mobile-status {
          display: none;
        }

        /* TABLET */
        @media (max-width: 960px) {
          .lesson-page {
            padding: 30px 28px 60px;
          }

          .lesson-grid {
            grid-template-columns: 1fr;
          }

          .desktop-status {
            display: none;
          }

          .mobile-status {
            display: block;
            margin-bottom: 22px;
          }
        }

        /* MOBILE */
        @media (max-width: 640px) {
          .lesson-page {
            width: 100%;
            padding:
              18px 14px
              calc(
                40px +
                env(safe-area-inset-bottom)
              );
          }

          .lesson-header {
            margin-bottom: 14px;
            padding: 19px;
            border-radius: 17px;
          }

          .header-content {
            flex-direction: column;
            gap: 14px;
          }

          .lesson-header h1 {
            margin: 8px 0;
            font-size: 26px;
            line-height: 1.22;
          }

          .subtitle {
            font-size: 13px;
          }

          .status-badge {
            padding: 7px 11px;
            font-size: 11px;
          }

          .lesson-grid {
            display: block;
          }

          .video-wrapper {
            margin-bottom: 14px;
            border-radius: 14px;
          }

          .no-video {
            min-height: 210px;
            margin-bottom: 14px;
            padding: 22px 16px;
            border-radius: 14px;
          }

          .play-icon {
            width: 50px;
            height: 50px;
            border-radius: 14px;
          }

          .mobile-status {
            margin-bottom: 14px;
          }

          .content-card {
            padding: 19px;
            border-radius: 15px;
          }

          .content-card h2 {
            margin-bottom: 14px;
            font-size: 20px;
          }

          .lesson-text {
            font-size: 14px;
            line-height: 1.75;
          }
        }

        /* SMALL MOBILE */
        @media (max-width: 380px) {
          .lesson-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .lesson-header {
            padding: 16px;
          }

          .lesson-header h1 {
            font-size: 23px;
          }

          .content-card {
            padding: 16px;
          }
        }
      `}</style>
    </>
  )
}

function StatusCard({
  completed,
  hasQuiz,
  markComplete,
  router,
  courseId,
  lessonId,
}) {
  return (
    <>
      <div className="status-card">
        <p className="side-label">
          LESSON STATUS
        </p>

        <h3>
          Хичээлийн явц
        </h3>

        <div className="status-row">
          <span>Хичээл</span>

          <strong
            className={
              completed ? 'green' : ''
            }
          >
            {completed
              ? 'Дууссан'
              : 'Дуусаагүй'}
          </strong>
        </div>

        <div className="status-row">
          <span>Quiz</span>

          <strong>
            {hasQuiz
              ? 'Байгаа'
              : 'Байхгүй'}
          </strong>
        </div>

        <div className="actions">
          {!completed ? (
            <button
              type="button"
              onClick={markComplete}
              className="complete-button"
            >
              ✓ Хичээл дуусгах
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="completed-button"
            >
              ✓ Дууссан
            </button>
          )}

          {hasQuiz && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/courses/${courseId}/lessons/${lessonId}/quiz`
                )
              }
              className="quiz-button"
            >
              Quiz эхлэх →
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/courses/${courseId}`
              )
            }
            className="back-button"
          >
            ← Course руу
          </button>
        </div>
      </div>

      <style jsx>{`
        .status-card {
          width: 100%;
          box-sizing: border-box;
          padding: 22px;
          background: #fff;
          border: 1px solid #eeeaf7;
          border-radius: 20px;
          overflow: hidden;
        }

        .side-label {
          margin: 0;
          color: #a19fab;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        h3 {
          margin: 6px 0 20px;
          color: #2d2d35;
          font-size: 20px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #f0edf7;
          color: #77757f;
          font-size: 13px;
        }

        .status-row strong {
          color: #38363f;
          text-align: right;
        }

        .status-row strong.green {
          color: #218647;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        button {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          border-radius: 12px;
          padding: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .complete-button {
          background: #fff;
          color: #6c5ce7;
          border: 1px solid #6c5ce7;
        }

        .completed-button {
          background: #eaf8ee;
          color: #218647;
          border: none;
          cursor: default;
        }

        .quiz-button {
          background: #6c5ce7;
          color: #fff;
          border: none;
        }

        .back-button {
          background: #f7f5fb;
          color: #74727d;
          border: none;
        }

        @media (max-width: 640px) {
          .status-card {
            padding: 18px;
            border-radius: 15px;
          }

          h3 {
            margin-bottom: 15px;
            font-size: 18px;
          }

          .actions {
            margin-top: 16px;
          }

          button {
            min-height: 46px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}