'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AdminCourseBuilderPage() {
  const { courseId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])

  const [moduleTitle, setModuleTitle] = useState('')
  const [addingModule, setAddingModule] = useState(false)

  const [lessonTitle, setLessonTitle] = useState({})
  const [addingLesson, setAddingLesson] = useState(null)

  const [uploadingLessonId, setUploadingLessonId] =
    useState(null)

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
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (
      profileError ||
      profile?.role !== 'admin'
    ) {
      router.replace('/dashboard')
      return
    }

    await loadCourse()
    await loadModules()

    setLoading(false)
  }

  async function loadCourse() {
    const {
      data,
      error,
    } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error) {
      setError(error.message)
      return
    }

    setCourse(data)
  }

  async function loadModules() {
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
        .order('position', { ascending: true })

      if (lessonError) {
        setError(lessonError.message)
        return
      }

      lessonData = data || []
    }

    const combined = (moduleData || []).map(
      (module) => ({
        ...module,
        lessons: lessonData.filter(
          (lesson) =>
            lesson.module_id === module.id
        ),
      })
    )

    setModules(combined)
  }

  async function addModule() {
    const title = moduleTitle.trim()

    if (!title) return

    setAddingModule(true)

    const nextPosition =
      modules.length === 0
        ? 1
        : Math.max(
            ...modules.map(
              (module) =>
                module.position || 0
            )
          ) + 1

    const { error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        title,
        position: nextPosition,
      })

    setAddingModule(false)

    if (error) {
      alert(error.message)
      return
    }

    setModuleTitle('')
    await loadModules()
  }

  async function deleteModule(moduleId) {
    const confirmed = window.confirm(
      'Энэ module болон доторх lesson-үүдийг устгах уу?'
    )

    if (!confirmed) return

    const target = modules.find(
      (module) => module.id === moduleId
    )

    for (const lesson of target?.lessons || []) {
      if (lesson.video_url) {
        await deleteVideoFile(
          lesson.video_url
        )
      }

      await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id)
    }

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId)

    if (error) {
      alert(error.message)
      return
    }

    await loadModules()
  }

  async function addLesson(moduleId) {
    const title =
      lessonTitle[moduleId]?.trim()

    if (!title) return

    setAddingLesson(moduleId)

    const targetModule = modules.find(
      (module) => module.id === moduleId
    )

    const lessons =
      targetModule?.lessons || []

    const nextPosition =
      lessons.length === 0
        ? 1
        : Math.max(
            ...lessons.map(
              (lesson) =>
                lesson.position || 0
            )
          ) + 1

    const { error } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        title,
        position: nextPosition,
        published: true,
      })

    setAddingLesson(null)

    if (error) {
      alert(error.message)
      return
    }

    setLessonTitle((prev) => ({
      ...prev,
      [moduleId]: '',
    }))

    await loadModules()
  }

  async function deleteLesson(lesson) {
    const confirmed = window.confirm(
      `"${lesson.title}" lesson-ийг устгах уу?`
    )

    if (!confirmed) return

    if (lesson.video_url) {
      await deleteVideoFile(
        lesson.video_url
      )
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lesson.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadModules()
  }

  async function uploadVideo(
    lesson,
    file
  ) {
    if (!file) return

    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        'MP4, WebM эсвэл MOV видео оруулна уу.'
      )
      return
    }

    const maxSize =
      500 * 1024 * 1024

    if (file.size > maxSize) {
      alert(
        'Видео 500MB-аас бага байх ёстой.'
      )
      return
    }

    setUploadingLessonId(lesson.id)

    try {
      if (lesson.video_url) {
        await deleteVideoFile(
          lesson.video_url
        )
      }

      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'mp4'

      const filePath =
        `${courseId}/${lesson.id}/` +
        `${Date.now()}.${extension}`

      const {
        error: uploadError,
      } = await supabase.storage
        .from('lesson-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from('lesson-videos')
        .getPublicUrl(filePath)

      const videoUrl =
        publicUrlData.publicUrl

      const {
        error: updateError,
      } = await supabase
        .from('lessons')
        .update({
          video_url: videoUrl,
        })
        .eq('id', lesson.id)

      if (updateError) {
        await supabase.storage
          .from('lesson-videos')
          .remove([filePath])

        throw updateError
      }

      await loadModules()
    } catch (err) {
      console.error(err)
      alert(
        err?.message ||
          'Видео upload хийхэд алдаа гарлаа.'
      )
    } finally {
      setUploadingLessonId(null)
    }
  }

  async function removeVideo(lesson) {
    if (!lesson.video_url) return

    const confirmed = window.confirm(
      'Энэ lesson-ийн видеог устгах уу?'
    )

    if (!confirmed) return

    setUploadingLessonId(lesson.id)

    await deleteVideoFile(
      lesson.video_url
    )

    const { error } = await supabase
      .from('lessons')
      .update({
        video_url: null,
      })
      .eq('id', lesson.id)

    setUploadingLessonId(null)

    if (error) {
      alert(error.message)
      return
    }

    await loadModules()
  }

  async function deleteVideoFile(url) {
    try {
      const marker =
        '/storage/v1/object/public/lesson-videos/'

      if (!url.includes(marker)) return

      const path = decodeURIComponent(
        url.split(marker)[1]
      )

      if (!path) return

      await supabase.storage
        .from('lesson-videos')
        .remove([path])
    } catch (error) {
      console.error(error)
    }
  }

  async function togglePublished(
    lesson
  ) {
    const { error } = await supabase
      .from('lessons')
      .update({
        published: !lesson.published,
      })
      .eq('id', lesson.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadModules()
  }

  if (loading) {
    return (
      <div style={styles.center}>
        Course builder ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              COURSE BUILDER
            </p>

            <h1 style={styles.title}>
              {course?.title ||
                'Course'}
            </h1>

            <p style={styles.subtitle}>
              Module, lesson, video болон
              quiz удирдана.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() =>
              router.push(
                '/admin/courses'
              )
            }
          >
            ← Courses
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <section style={styles.addModuleCard}>
          <div>
            <p style={styles.smallLabel}>
              NEW MODULE
            </p>

            <h2 style={styles.cardTitle}>
              Module нэмэх
            </h2>
          </div>

          <div style={styles.addRow}>
            <input
              value={moduleTitle}
              onChange={(event) =>
                setModuleTitle(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  addModule()
                }
              }}
              placeholder="Жишээ: TOPIK Writing"
              style={styles.input}
            />

            <button
              type="button"
              onClick={addModule}
              disabled={addingModule}
              style={styles.primaryButton}
            >
              {addingModule
                ? 'Нэмж байна...'
                : '+ Module'}
            </button>
          </div>
        </section>

        <div style={styles.moduleList}>
          {modules.length === 0 ? (
            <div style={styles.empty}>
              Одоогоор module байхгүй.
            </div>
          ) : (
            modules.map(
              (module, moduleIndex) => (
                <section
                  key={module.id}
                  style={styles.moduleCard}
                >
                  <div
                    style={
                      styles.moduleHeader
                    }
                  >
                    <div
                      style={
                        styles.moduleNumber
                      }
                    >
                      {String(
                        moduleIndex + 1
                      ).padStart(2, '0')}
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <p
                        style={
                          styles.moduleLabel
                        }
                      >
                        MODULE{' '}
                        {moduleIndex + 1}
                      </p>

                      <h2
                        style={
                          styles.moduleTitle
                        }
                      >
                        {module.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      style={
                        styles.deleteButton
                      }
                      onClick={() =>
                        deleteModule(
                          module.id
                        )
                      }
                    >
                      Устгах
                    </button>
                  </div>

                  <div
                    style={
                      styles.lessonContainer
                    }
                  >
                    {module.lessons.map(
                      (
                        lesson,
                        lessonIndex
                      ) => (
                        <div
                          key={lesson.id}
                          style={
                            styles.lessonCard
                          }
                        >
                          <div
                            style={
                              styles.lessonTop
                            }
                          >
                            <div
                              style={
                                styles.lessonLeft
                              }
                            >
                              <div
                                style={
                                  styles.lessonNumber
                                }
                              >
                                {lessonIndex +
                                  1}
                              </div>

                              <div>
                                <h3
                                  style={
                                    styles.lessonTitle
                                  }
                                >
                                  {
                                    lesson.title
                                  }
                                </h3>

                                <div
                                  style={
                                    styles.lessonBadges
                                  }
                                >
                                  <span
                                    style={{
                                      ...styles.badge,
                                      ...(lesson.published
                                        ? styles.publishedBadge
                                        : styles.draftBadge),
                                    }}
                                  >
                                    {lesson.published
                                      ? 'PUBLISHED'
                                      : 'DRAFT'}
                                  </span>

                                  {lesson.video_url && (
                                    <span
                                      style={
                                        styles.videoBadge
                                      }
                                    >
                                      VIDEO ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              style={
                                styles.smallDelete
                              }
                              onClick={() =>
                                deleteLesson(
                                  lesson
                                )
                              }
                            >
                              Устгах
                            </button>
                          </div>

                          <div
                            style={
                              styles.actionGrid
                            }
                          >
                            <label
                              style={
                                styles.uploadButton
                              }
                            >
                              {uploadingLessonId ===
                              lesson.id
                                ? 'Видео upload хийж байна...'
                                : lesson.video_url
                                  ? 'Видео солих'
                                  : 'Видео upload'}

                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                disabled={
                                  uploadingLessonId ===
                                  lesson.id
                                }
                                onChange={(
                                  event
                                ) => {
                                  const file =
                                    event
                                      .target
                                      .files?.[0]

                                  uploadVideo(
                                    lesson,
                                    file
                                  )

                                  event.target.value =
                                    ''
                                }}
                                style={{
                                  display:
                                    'none',
                                }}
                              />
                            </label>

                            {lesson.video_url && (
                              <button
                                type="button"
                                style={
                                  styles.removeVideoButton
                                }
                                onClick={() =>
                                  removeVideo(
                                    lesson
                                  )
                                }
                                disabled={
                                  uploadingLessonId ===
                                  lesson.id
                                }
                              >
                                Видео устгах
                              </button>
                            )}

                            <button
                              type="button"
                              style={
                                styles.quizButton
                              }
                              onClick={() =>
                                router.push(
                                  `/admin/courses/${courseId}/lessons/${lesson.id}/quiz`
                                )
                              }
                            >
                              Quiz
                            </button>

                            <button
                              type="button"
                              style={
                                styles.publishButton
                              }
                              onClick={() =>
                                togglePublished(
                                  lesson
                                )
                              }
                            >
                              {lesson.published
                                ? 'Draft болгох'
                                : 'Publish'}
                            </button>
                          </div>

                          {lesson.video_url && (
                            <div
                              style={
                                styles.videoPreview
                              }
                            >
                              <video
                                src={
                                  lesson.video_url
                                }
                                controls
                                style={
                                  styles.video
                                }
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}

                    <div
                      style={
                        styles.addLessonBox
                      }
                    >
                      <input
                        value={
                          lessonTitle[
                            module.id
                          ] || ''
                        }
                        onChange={(
                          event
                        ) =>
                          setLessonTitle(
                            (prev) => ({
                              ...prev,
                              [module.id]:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                            'Enter'
                          ) {
                            addLesson(
                              module.id
                            )
                          }
                        }}
                        placeholder="Шинэ lesson нэр"
                        style={styles.input}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          addLesson(
                            module.id
                          )
                        }
                        disabled={
                          addingLesson ===
                          module.id
                        }
                        style={
                          styles.addLessonButton
                        }
                      >
                        {addingLesson ===
                        module.id
                          ? 'Нэмж байна...'
                          : '+ Lesson'}
                      </button>
                    </div>
                  </div>
                </section>
              )
            )
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100%',
    background: '#F8F7FF',
    padding: '40px 46px 80px',
  },

  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },

  center: {
    minHeight: 'calc(100vh - 82px)',
    background: '#F8F7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#85838D',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '28px',
  },

  eyebrow: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1.6px',
  },

  title: {
    margin: '8px 0 7px',
    fontSize: '38px',
    color: '#282830',
  },

  subtitle: {
    margin: 0,
    color: '#8B8993',
  },

  backButton: {
    border: '1px solid #E4E0EF',
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '11px 15px',
    color: '#65636D',
    fontWeight: '700',
    cursor: 'pointer',
  },

  error: {
    background: '#FFF1F1',
    color: '#B44D4D',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '20px',
  },

  addModuleCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    padding: '22px',
    marginBottom: '22px',
  },

  smallLabel: {
    margin: 0,
    color: '#A19FAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.4px',
  },

  cardTitle: {
    margin: '5px 0 16px',
    color: '#2D2D35',
    fontSize: '20px',
  },

  addRow: {
    display: 'flex',
    gap: '10px',
  },

  input: {
    flex: 1,
    minWidth: 0,
    border: '1px solid #E3DFEC',
    borderRadius: '11px',
    padding: '12px 13px',
    fontSize: '14px',
    outline: 'none',
    background: '#FFFFFF',
  },

  primaryButton: {
    border: 'none',
    borderRadius: '11px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '12px 18px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  moduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  moduleCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    overflow: 'hidden',
  },

  moduleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px 22px',
    borderBottom: '1px solid #EEEAF6',
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
    color: '#A3A1AC',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },

  moduleTitle: {
    margin: '5px 0 0',
    color: '#292931',
    fontSize: '20px',
  },

  deleteButton: {
    border: '1px solid #F0DADA',
    background: '#FFF9F9',
    color: '#C65C5C',
    borderRadius: '10px',
    padding: '9px 12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  lessonContainer: {
    padding: '18px',
  },

  lessonCard: {
    border: '1px solid #EEEAF6',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '14px',
  },

  lessonTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    alignItems: 'flex-start',
  },

  lessonLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  lessonNumber: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: '#F4F2FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6C5CE7',
    fontWeight: '900',
  },

  lessonTitle: {
    margin: 0,
    color: '#303038',
    fontSize: '16px',
  },

  lessonBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '7px',
  },

  badge: {
    borderRadius: '999px',
    padding: '5px 8px',
    fontSize: '9px',
    fontWeight: '900',
    letterSpacing: '.7px',
  },

  publishedBadge: {
    background: '#EAF8EE',
    color: '#218647',
  },

  draftBadge: {
    background: '#F3F1F6',
    color: '#85828C',
  },

  videoBadge: {
    borderRadius: '999px',
    padding: '5px 8px',
    fontSize: '9px',
    fontWeight: '900',
    letterSpacing: '.7px',
    background: '#F0ECFF',
    color: '#6C5CE7',
  },

  smallDelete: {
    border: 'none',
    background: 'transparent',
    color: '#C55D5D',
    fontWeight: '700',
    cursor: 'pointer',
  },

  actionGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },

  uploadButton: {
    background: '#6C5CE7',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '10px 13px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  removeVideoButton: {
    border: '1px solid #E3DFEC',
    background: '#FFFFFF',
    color: '#77747F',
    borderRadius: '10px',
    padding: '10px 13px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  quizButton: {
    border: '1px solid #D9D3F2',
    background: '#F6F3FF',
    color: '#6C5CE7',
    borderRadius: '10px',
    padding: '10px 13px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  publishButton: {
    border: '1px solid #E3DFEC',
    background: '#FFFFFF',
    color: '#66646D',
    borderRadius: '10px',
    padding: '10px 13px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  videoPreview: {
    marginTop: '16px',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#111111',
  },

  video: {
    display: 'block',
    width: '100%',
    maxHeight: '440px',
  },

  addLessonBox: {
    display: 'flex',
    gap: '10px',
    paddingTop: '8px',
  },

  addLessonButton: {
    border: 'none',
    borderRadius: '11px',
    background: '#2E2D35',
    color: '#FFFFFF',
    padding: '12px 18px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  empty: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    color: '#8B8993',
  },
}