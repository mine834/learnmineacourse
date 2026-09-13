'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function CoursesAdminPage() {
  const router = useRouter()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    level: '',
    price: '',
    published: false,
  })

  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user) {
      router.replace('/login')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      router.replace('/dashboard')
      return
    }

    await loadCourses()
    setLoading(false)
  }

  async function loadCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setCourses(data || [])
  }

  function changeForm(e) {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function createSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
  }

  async function saveCourse(e) {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Course нэр оруулна уу.')
      return
    }

    setSaving(true)

    const courseData = {
      title: form.title,
      slug: form.slug || createSlug(form.title),
      description: form.description,
      thumbnail_url: form.thumbnail_url,
      level: form.level,
      price: form.price ? Number(form.price) : 0,
      published: form.published,
    }

    let error

    if (editingId) {
      const result = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', editingId)

      error = result.error
    } else {
      const result = await supabase
        .from('courses')
        .insert(courseData)

      error = result.error
    }

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    resetForm()
    await loadCourses()
    setSaving(false)
  }

  function editCourse(course) {
    setEditingId(course.id)

    setForm({
      title: course.title || '',
      slug: course.slug || '',
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      level: course.level || '',
      price: course.price || '',
      published: course.published ?? false,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteCourse(id) {
    const confirmed = window.confirm(
      'Энэ course-ийг устгах уу? Module, lesson-ууд нь мөн устаж болно.'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadCourses()
  }

  function resetForm() {
    setEditingId(null)

    setForm({
      title: '',
      slug: '',
      description: '',
      thumbnail_url: '',
      level: '',
      price: '',
      published: false,
    })
  }

  if (loading) {
    return (
      <main style={styles.center}>
        <p>Уншиж байна...</p>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => router.push('/admin')}
        >
          ← Admin Dashboard
        </button>

        <div style={styles.header}>
          <p style={styles.eyebrow}>LEARN·MINEA ADMIN</p>
          <h1 style={styles.title}>Courses</h1>
          <p style={styles.subtitle}>
            Сургалт нэмэх, засах, publish хийх.
          </p>
        </div>

        <section style={styles.formCard}>
          <h2>
            {editingId ? 'Course засах' : '+ Шинэ course'}
          </h2>

          <form onSubmit={saveCourse}>
            <label style={styles.label}>Course нэр</label>
            <input
              style={styles.input}
              name="title"
              value={form.title}
              onChange={changeForm}
              placeholder="Жишээ: TOPIK Master"
            />

            <label style={styles.label}>Slug</label>
            <input
              style={styles.input}
              name="slug"
              value={form.slug}
              onChange={changeForm}
              placeholder="Хоосон орхивол автоматаар үүснэ"
            />

            <label style={styles.label}>Тайлбар</label>
            <textarea
              style={styles.textarea}
              name="description"
              value={form.description}
              onChange={changeForm}
              placeholder="Course-ийн тайлбар..."
            />

            <div style={styles.twoColumns}>
              <div>
                <label style={styles.label}>Түвшин</label>
                <select
                  style={styles.input}
                  name="level"
                  value={form.level}
                  onChange={changeForm}
                >
                  <option value="">Сонгох</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="TOPIK">TOPIK</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Үнэ</label>
                <input
                  style={styles.input}
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={changeForm}
                  placeholder="149000"
                />
              </div>
            </div>

            <label style={styles.label}>Thumbnail URL</label>
            <input
              style={styles.input}
              name="thumbnail_url"
              value={form.thumbnail_url}
              onChange={changeForm}
              placeholder="https://..."
            />

            {form.thumbnail_url && (
              <img
                src={form.thumbnail_url}
                alt=""
                style={styles.thumbnailPreview}
              />
            )}

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={changeForm}
              />
              Сурагчдад харуулах
            </label>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? 'Хадгалж байна...'
                  : editingId
                    ? 'Өөрчлөлт хадгалах'
                    : 'Course нэмэх'}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={resetForm}
                >
                  Болих
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.listSection}>
          <h2>Одоогийн сургалтууд</h2>

          {courses.length === 0 ? (
            <div style={styles.emptyCard}>
              Одоогоор course байхгүй байна.
            </div>
          ) : (
            <div style={styles.grid}>
              {courses.map((course) => (
                <article key={course.id} style={styles.courseCard}>
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      style={styles.courseImage}
                    />
                  ) : (
                    <div style={styles.noImage}>
                      Thumbnail байхгүй
                    </div>
                  )}

                  <div style={styles.courseBody}>
                    <div style={styles.statusRow}>
                      <span
                        style={
                          course.published
                            ? styles.published
                            : styles.hidden
                        }
                      >
                        {course.published
                          ? 'Published'
                          : 'Draft'}
                      </span>

                      {course.level && (
                        <span style={styles.levelBadge}>
                          {course.level}
                        </span>
                      )}
                    </div>

                    <h3 style={styles.courseTitle}>
                      {course.title}
                    </h3>

                    <p style={styles.description}>
                      {course.description}
                    </p>

                    <strong style={styles.price}>
                      ₮{Number(course.price || 0).toLocaleString()}
                    </strong>

                    <div style={styles.cardButtons}>
                      <button
                        style={styles.editButton}
                        onClick={() => editCourse(course)}
                      >
                        Засах
                      </button>

                      <button
                        style={styles.manageButton}
                        onClick={() =>
                          router.push(
                            `/admin/courses/${course.id}`
                          )
                        }
                      >
                        Хичээлүүд
                      </button>

                      <button
                        style={styles.deleteButton}
                        onClick={() =>
                          deleteCourse(course.id)
                        }
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  page: {
    minHeight: '100vh',
    background: '#f8f7ff',
    fontFamily: 'Arial, sans-serif',
    color: '#20202a',
    padding: '45px 25px',
  },

  container: {
    maxWidth: '1150px',
    margin: '0 auto',
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '28px',
    fontSize: '14px',
  },

  header: {
    marginBottom: '30px',
  },

  eyebrow: {
    color: '#6c5ce7',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  title: {
    fontSize: '40px',
    margin: '6px 0',
  },

  subtitle: {
    color: '#777',
  },

  formCard: {
    background: '#fff',
    padding: '32px',
    borderRadius: '22px',
  },

  label: {
    display: 'block',
    fontWeight: '700',
    marginTop: '20px',
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '11px',
    fontSize: '15px',
    background: '#fff',
  },

  textarea: {
    width: '100%',
    minHeight: '130px',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '11px',
    fontSize: '15px',
    resize: 'vertical',
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
  },

  thumbnailPreview: {
    width: '220px',
    height: '130px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginTop: '14px',
  },

  checkbox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '22px',
  },

  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
  },

  saveButton: {
    border: 'none',
    background: '#6c5ce7',
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  cancelButton: {
    border: '1px solid #ddd',
    background: '#fff',
    padding: '14px 24px',
    borderRadius: '11px',
    cursor: 'pointer',
  },

  listSection: {
    marginTop: '40px',
  },

  emptyCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '18px',
    color: '#777',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },

  courseCard: {
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
  },

  courseImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },

  noImage: {
    height: '180px',
    background: '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
  },

  courseBody: {
    padding: '22px',
  },

  statusRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },

  published: {
    background: '#eafff2',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  hidden: {
    background: '#eee',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  levelBadge: {
    background: '#f1efff',
    color: '#6c5ce7',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  courseTitle: {
    fontSize: '21px',
    margin: '0 0 10px',
  },

  description: {
    color: '#777',
    lineHeight: '1.5',
    minHeight: '60px',
  },

  price: {
    display: 'block',
    marginTop: '15px',
    fontSize: '19px',
  },

  cardButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },

  editButton: {
    border: 'none',
    background: '#6c5ce7',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
  },

  manageButton: {
    border: '1px solid #6c5ce7',
    background: '#fff',
    color: '#6c5ce7',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
  },

  deleteButton: {
    border: '1px solid #ddd',
    background: '#fff',
    color: '#555',
    padding: '10px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
  },
}