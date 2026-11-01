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
  const [accessDenied, setAccessDenied] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [module, setModule] = useState(null)
  const [allModules, setAllModules] = useState([])
  const [allLessons, setAllLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [completed, setCompleted] = useState(false)
  const [hasQuiz, setHasQuiz] = useState(false)
  const [signedVideoUrl, setSignedVideoUrl] = useState('')
  const [videoError, setVideoError] = useState('')

  useEffect(() => {
    if (courseId && lessonId) loadLesson()

    const handleFocus = () => {
      if (courseId && lessonId) loadLesson(false)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [courseId, lessonId])

  async function checkAccess() {
    const { data, error } = await supabase.rpc('has_course_access', {
      target_course_id: courseId,
    })

    if (error) throw error
    return data === true
  }

  function denyAccess() {
    setAccessDenied(true)
    setLesson(null)
    setSignedVideoUrl('')
    setVideoError('')
    setCourse(null)
    setAllLessons([])
    setProgress([])
  }

  async function loadLesson(showLoading = true) {
    try {
      setLoadError('')
      setSignedVideoUrl('')
      setVideoError('')
      if (showLoading) setLoading(true)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const userId = session.user.id

      // Сургалтын эрхийг Supabase-ээс шалгана.
      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      setAccessDenied(false)

      const [courseResult, modulesResult, progressResult] =
        await Promise.all([
          supabase
            .from('courses')
            .select('id, title, description, level, published')
            .eq('id', courseId)
            .eq('published', true)
            .single(),

          supabase
            .from('modules')
            .select('id, course_id, title, position')
            .eq('course_id', courseId)
            .order('position', { ascending: true }),

          supabase
            .from('lesson_progress')
            .select('lesson_id, completed, completed_at')
            .eq('user_id', userId),
        ])

      if (courseResult.error) throw courseResult.error
      if (modulesResult.error) throw modulesResult.error
      if (progressResult.error) throw progressResult.error

      const moduleData = modulesResult.data || []
      const moduleIds = moduleData.map((item) => item.id)

      let lessonData = []

      if (moduleIds.length > 0) {
        const { data, error } = await supabase
          .from('lessons')
          .select(`
            id,
            module_id,
            title,
            description,
            content,
            video_url,
            position,
            published
          `)
          .in('module_id', moduleIds)
          .eq('published', true)
          .order('position', { ascending: true })

        if (error) throw error
        lessonData = data || []
      }

      const currentLesson = lessonData.find(
        (item) => item.id === lessonId
      )

      if (!currentLesson) {
        router.replace(`/dashboard/courses/${courseId}`)
        return
      }

      const currentModule =
        moduleData.find(
          (item) => item.id === currentLesson.module_id
        ) || null

      // Lesson мөн тухайн сургалтад хамаарах эсэхийг шалгана.
      const { data: lessonAllowed, error: lessonAccessError } =
        await supabase.rpc('has_lesson_access', {
          target_module_id: currentLesson.module_id,
        })

      if (lessonAccessError) throw lessonAccessError

      if (lessonAllowed !== true) {
        denyAccess()
        return
      }

      const currentProgress = (progressResult.data || []).find(
        (item) => item.lesson_id === lessonId
      )

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (quizError) throw quizError

      // Ачаалж байх хооронд эрх цуцлагдсан эсэхийг дахин шалгана.
      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      // Create a time-limited URL only after both access checks succeed.
      let nextSignedVideoUrl = ''
      let nextVideoError = ''
      if (currentLesson.video_url) {
        try {
          const originalUrl = currentLesson.video_url.trim()
          const marker = '/lesson-videos/'
          const markerIndex = originalUrl.indexOf(marker)
          const videoPath = markerIndex >= 0
            ? decodeURIComponent(originalUrl.slice(markerIndex + marker.length).split('?')[0])
            : originalUrl

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from('lesson-videos')
              .createSignedUrl(videoPath, 3600)

          if (signedError) throw signedError
          nextSignedVideoUrl = signedData?.signedUrl || ''
        } catch (videoErr) {
          console.error('Video signed URL error:', videoErr)
          nextVideoError = 'Видео ачаалах боломжгүй байна. Storage-ийн эрх болон видео замыг шалгана уу.'
        }
      }

      // Check again if enrollment was revoked during signed URL creation.
      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      setSignedVideoUrl(nextSignedVideoUrl)
      setVideoError(nextVideoError)
      setCourse(courseResult.data)
      setAllModules(moduleData)
      setAllLessons(lessonData)
      setProgress(progressResult.data || [])
      setLesson(currentLesson)
      setModule(currentModule)
      setCompleted(currentProgress?.completed === true)
      setHasQuiz(Boolean(quizData))
    } catch (error) {
      console.error('Lesson load error:', error)
      setLoadError(
        error?.message || 'Хичээл ачаалахад алдаа гарлаа.'
      )
      setLesson(null)
      setSignedVideoUrl('')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const orderedLessons = useMemo(() => {
    const modulePosition = new Map(
      allModules.map((item, index) => [
        item.id,
        item.position ?? index,
      ])
    )

    return [...allLessons].sort((a, b) => {
      const moduleA = modulePosition.get(a.module_id) ?? 0
      const moduleB = modulePosition.get(b.module_id) ?? 0

      if (moduleA !== moduleB) return moduleA - moduleB

      return (a.position || 0) - (b.position || 0)
    })
  }, [allLessons, allModules])

  const currentIndex = orderedLessons.findIndex(
    (item) => item.id === lessonId
  )

  const previousLesson =
    currentIndex > 0 ? orderedLessons[currentIndex - 1] : null

  const nextLesson =
    currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null

  const completedIds = useMemo(() => {
    return new Set(
      progress
        .filter((item) => item.completed === true)
        .map((item) => item.lesson_id)
    )
  }, [progress])

  const courseProgress =
    orderedLessons.length > 0
      ? Math.round(
          (orderedLessons.filter((item) => completedIds.has(item.id))
            .length /
            orderedLessons.length) *
            100
        )
      : 0

  async function updateCompletion(value) {
    if (!lessonId || saving) return

    try {
      setSaving(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: session.user.id,
            lesson_id: lessonId,
            completed: value,
            completed_at: value ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,lesson_id' }
        )

      if (error) throw error

      setCompleted(value)
      await loadLesson(false)
    } catch (error) {
      console.error('Update lesson progress error:', error)
      alert(
        error?.message ||
          'Хичээлийн progress хадгалахад алдаа гарлаа.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function openLesson(target) {
    if (!target) return

    try {
      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      router.push(
        `/dashboard/courses/${courseId}/lessons/${target.id}`
      )
    } catch (error) {
      alert(
        error?.message || 'Сургалтын эрхийг шалгахад алдаа гарлаа.'
      )
    }
  }

  async function openQuiz() {
    try {
      if (!(await checkAccess())) {
        denyAccess()
        return
      }

      router.push(
        `/dashboard/courses/${courseId}/lessons/${lessonId}/quiz`
      )
    } catch (error) {
      alert(
        error?.message || 'Сургалтын эрхийг шалгахад алдаа гарлаа.'
      )
    }
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

  if (accessDenied) {
    return (
      <main className="access-page">
        <div className="access-card">
          <div className="lock-icon">🔒</div>
          <h1>Сургалтын эрх идэвхгүй байна</h1>
          <p>
            Таны энэ сургалтад хандах эрх байхгүй эсвэл
            цуцлагдсан байна.
          </p>
          <button
            onClick={() => router.replace('/dashboard/payments')}
          >
            Төлбөрийн хэсэг рүү очих →
          </button>
        </div>

        <style jsx>{`
          .access-page {
            padding: 60px 20px;
            color: #302e38;
          }
          .access-card {
            max-width: 540px;
            margin: auto;
            padding: 45px 30px;
            border: 1px solid #e7e3ed;
            border-radius: 20px;
            background: white;
            text-align: center;
          }
          .lock-icon {
            font-size: 40px;
          }
          h1 {
            font-size: 25px;
            margin: 20px 0;
          }
          p {
            color: #918a9d;
            line-height: 1.8;
          }
          button {
            margin-top: 15px;
            padding: 13px 20px;
            border: none;
            border-radius: 11px;
            background: #0879D1;
            color: white;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </main>
    )
  }

  if (loadError) {
    return (
      <main style={{ padding: 32 }}>
        <h2>Хичээл ачаалж чадсангүй</h2>
        <p>{loadError}</p>
        <button onClick={() => loadLesson()}>
          Дахин оролдох
        </button>
      </main>
    )
  }

  if (!lesson || !course) return null

  return (
    <main className="lesson-page">
      <div className="topbar">
        <button
          className="back"
          onClick={() =>
            router.push(`/dashboard/courses/${courseId}`)
          }
        >
          ← Сургалт руу
        </button>

        <div className="course-progress">
          <span>COURSE PROGRESS</span>
          <strong>{courseProgress}%</strong>
        </div>
      </div>

      <section className="lesson-header">
        <div className="eyebrow">
          {module?.title || 'LESSON'}
        </div>

        <div className="lesson-meta">
          <span>LESSON {currentIndex + 1}</span>

          {completed && (
            <span className="completed-badge">
              ✓ COMPLETED
            </span>
          )}
        </div>

        <h1>{lesson.title}</h1>

        {lesson.description && (
          <p>{lesson.description}</p>
        )}
      </section>

      {lesson.video_url && (
        <section className="video-card">
          {signedVideoUrl ? (
            <video
              key={`${lesson.id}-${signedVideoUrl}`}
              src={signedVideoUrl}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoError('Видео тоглуулахад алдаа гарлаа.')}
            />
          ) : (
            <p style={{ padding: 22, color: '#fff' }}>
              {videoError || 'Видео ачаалж байна...'}
            </p>
          )}
        </section>
      )}

      {lesson.content && (
        <section className="content-card">
          <div className="section-label">
            LESSON CONTENT
          </div>

          <div className="lesson-content">
            {lesson.content.split('\n').map((line, index) => {
              if (!line.trim()) {
                return <div key={index} className="space" />
              }

              return <p key={index}>{line}</p>
            })}
          </div>
        </section>
      )}

      <section className="action-card">
        <div>
          <div className="section-label">PROGRESS</div>

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
            onClick={() => updateCompletion(true)}
            disabled={saving}
          >
            {saving
              ? 'Хадгалж байна...'
              : '✓ Хичээл дуусгах'}
          </button>
        ) : (
          <button
            className="reset-button"
            onClick={() => updateCompletion(false)}
            disabled={saving}
          >
            Completed цуцлах
          </button>
        )}
      </section>

      {hasQuiz && (
        <section className="quiz-card">
          <div>
            <div className="section-label">QUIZ</div>

            <h2>Хичээлийн quiz</h2>

            <p>
              Хичээлээ бататгах quiz-аа ажиллаарай.
            </p>
          </div>

          <button onClick={openQuiz}>
            Quiz эхлэх →
          </button>
        </section>
      )}

      <section className="navigation">
        <button
          className="nav-button"
          disabled={!previousLesson}
          onClick={() => openLesson(previousLesson)}
        >
          <span>PREVIOUS</span>

          <strong>
            {previousLesson
              ? `← ${previousLesson.title}`
              : 'Эхний хичээл'}
          </strong>
        </button>

        <button
          className="nav-button next"
          disabled={!nextLesson}
          onClick={() => openLesson(nextLesson)}
        >
          <span>NEXT</span>

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
          color: #0879D1;
          font-size: 12px;
        }

        .lesson-header {
          margin-bottom: 28px;
        }

        .eyebrow,
        .section-label {
          color: #0879D1;
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
          color: #0879D1;
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
          background: #0879D1;
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