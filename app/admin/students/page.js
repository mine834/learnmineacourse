'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])

  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    const [
      studentsResult,
      coursesResult,
      enrollmentsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .eq('role', 'student')
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('courses')
        .select('id, title, published')
        .order('title'),

      supabase
        .from('enrollments')
        .select('id, user_id, course_id'),
    ])

    if (studentsResult.error) {
      setError(studentsResult.error.message)
      setLoading(false)
      return
    }

    if (coursesResult.error) {
      setError(coursesResult.error.message)
      setLoading(false)
      return
    }

    if (enrollmentsResult.error) {
      setError(enrollmentsResult.error.message)
      setLoading(false)
      return
    }

    setStudents(studentsResult.data || [])
    setCourses(coursesResult.data || [])
    setEnrollments(enrollmentsResult.data || [])

    setLoading(false)
  }

  const filteredStudents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    if (!query) return students

    return students.filter((student) => {
      const email =
        student.email?.toLowerCase() || ''

      const name =
        student.full_name?.toLowerCase() || ''

      return (
        email.includes(query) ||
        name.includes(query)
      )
    })
  }, [students, search])

  function getStudentEnrollments(userId) {
    return enrollments.filter(
      (item) => item.user_id === userId
    )
  }

  function getCourseTitle(courseId) {
    return (
      courses.find(
        (course) => course.id === courseId
      )?.title || 'Unknown course'
    )
  }

  function studentHasCourse(userId, courseId) {
    return enrollments.some(
      (item) =>
        item.user_id === userId &&
        item.course_id === courseId
    )
  }

  async function grantAccess() {
    if (!selectedStudent) return

    if (!selectedCourseId) {
      alert('Course сонгоно уу.')
      return
    }

    if (
      studentHasCourse(
        selectedStudent.id,
        selectedCourseId
      )
    ) {
      alert(
        'Энэ сурагчид уг сургалтын эрх аль хэдийн байна.'
      )
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: selectedStudent.id,
        course_id: selectedCourseId,
      })

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    setSelectedCourseId('')
    await loadData()
  }

  async function revokeAccess(
    userId,
    courseId
  ) {
    const confirmed = window.confirm(
      'Энэ сургалтын эрхийг цуцлах уу?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
  }

  function openStudent(student) {
    setSelectedStudent(student)
    setSelectedCourseId('')
  }

  function closeStudent() {
    setSelectedStudent(null)
    setSelectedCourseId('')
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Students ачаалж байна...
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              USERS
            </p>

            <h1 style={styles.title}>
              Students
            </h1>

            <p style={styles.subtitle}>
              Сурагч болон сургалтын эрхүүдийг
              эндээс удирдана.
            </p>
          </div>

          <div style={styles.studentCount}>
            <strong>{students.length}</strong>
            <span>students</span>
          </div>
        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.searchCard}>
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Нэр эсвэл email-аар хайх..."
            style={styles.searchInput}
          />

          <span style={styles.searchResult}>
            {filteredStudents.length} үр дүн
          </span>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span>STUDENT</span>
            <span>COURSES</span>
            <span>STATUS</span>
            <span></span>
          </div>

          {filteredStudents.length === 0 ? (
            <div style={styles.empty}>
              Student олдсонгүй.
            </div>
          ) : (
            filteredStudents.map(
              (student) => {
                const studentEnrollments =
                  getStudentEnrollments(
                    student.id
                  )

                return (
                  <div
                    key={student.id}
                    style={styles.studentRow}
                  >
                    <div style={styles.studentInfo}>
                      <div style={styles.avatar}>
                        {(
                          student.full_name ||
                          student.email ||
                          'S'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div style={styles.studentText}>
                        <strong>
                          {student.full_name ||
                            'Нэр оруулаагүй'}
                        </strong>

                        <span>
                          {student.email}
                        </span>
                      </div>
                    </div>

                    <div style={styles.courseCount}>
                      <strong>
                        {
                          studentEnrollments.length
                        }
                      </strong>
                      <span>
                        сургалтын эрх
                      </span>
                    </div>

                    <span style={styles.activeBadge}>
                      ACTIVE
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        openStudent(student)
                      }
                      style={styles.manageButton}
                    >
                      Удирдах →
                    </button>
                  </div>
                )
              }
            )
          )}
        </div>

        {selectedStudent && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.modalLabel}>
                    STUDENT
                  </p>

                  <h2 style={styles.modalTitle}>
                    {selectedStudent.full_name ||
                      selectedStudent.email}
                  </h2>

                  <p style={styles.modalEmail}>
                    {selectedStudent.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeStudent}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <section style={styles.accessSection}>
                <p style={styles.sectionLabel}>
                  COURSE ACCESS
                </p>

                <h3 style={styles.sectionTitle}>
                  Одоогийн сургалтууд
                </h3>

                {getStudentEnrollments(
                  selectedStudent.id
                ).length === 0 ? (
                  <div style={styles.noAccess}>
                    Одоогоор сургалтын эрхгүй.
                  </div>
                ) : (
                  <div style={styles.accessList}>
                    {getStudentEnrollments(
                      selectedStudent.id
                    ).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        style={styles.accessRow}
                      >
                        <div>
                          <strong
                            style={
                              styles.accessTitle
                            }
                          >
                            {getCourseTitle(
                              enrollment.course_id
                            )}
                          </strong>

                          <p
                            style={
                              styles.accessStatus
                            }
                          >
                            Access granted
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            revokeAccess(
                              selectedStudent.id,
                              enrollment.course_id
                            )
                          }
                          style={styles.revokeButton}
                        >
                          Эрх цуцлах
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section style={styles.grantSection}>
                <p style={styles.sectionLabel}>
                  ADD ACCESS
                </p>

                <h3 style={styles.sectionTitle}>
                  Шинэ сургалтын эрх
                </h3>

                <div style={styles.grantRow}>
                  <select
                    value={selectedCourseId}
                    onChange={(event) =>
                      setSelectedCourseId(
                        event.target.value
                      )
                    }
                    style={styles.select}
                  >
                    <option value="">
                      Course сонгох
                    </option>

                    {courses
                      .filter(
                        (course) =>
                          !studentHasCourse(
                            selectedStudent.id,
                            course.id
                          )
                      )
                      .map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.title}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={grantAccess}
                    style={styles.grantButton}
                  >
                    {saving
                      ? 'Нээж байна...'
                      : 'Эрх нээх'}
                  </button>
                </div>
              </section>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    `/admin/email?to=${encodeURIComponent(
                      selectedStudent.email
                    )}`
                }
                style={styles.emailButton}
              >
                ✉ Email бэлдэх
              </button>
            </div>
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
    padding: '40px 46px 80px',
  },

  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },

  loading: {
    minHeight: 'calc(100vh - 82px)',
    background: '#F8F7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '27px',
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
    color: '#292931',
    fontSize: '38px',
  },

  subtitle: {
    margin: 0,
    color: '#898791',
  },

  studentCount: {
    minWidth: '105px',
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '16px',
    padding: '13px 18px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },

  error: {
    background: '#FFF1F1',
    color: '#B74B4B',
    borderRadius: '12px',
    padding: '13px',
    marginBottom: '18px',
  },

  searchCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '17px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '18px',
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    padding: '7px',
  },

  searchResult: {
    color: '#9996A0',
    fontSize: '12px',
  },

  tableCard: {
    background: '#FFFFFF',
    border: '1px solid #ECE8F7',
    borderRadius: '20px',
    overflow: 'hidden',
  },

  tableHeader: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(260px, 2fr) 1fr 120px 120px',
    gap: '20px',
    padding: '14px 20px',
    background: '#FAF9FD',
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1px',
  },

  studentRow: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(260px, 2fr) 1fr 120px 120px',
    gap: '20px',
    alignItems: 'center',
    padding: '18px 20px',
    borderTop: '1px solid #F0EDF6',
  },

  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },

  avatar: {
    width: '42px',
    height: '42px',
    minWidth: '42px',
    borderRadius: '12px',
    background: '#F0ECFF',
    color: '#6C5CE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },

  studentText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: '4px',
  },

  courseCount: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    color: '#77757F',
    fontSize: '11px',
  },

  activeBadge: {
    width: 'fit-content',
    borderRadius: '999px',
    background: '#EAF8EE',
    color: '#218647',
    padding: '6px 9px',
    fontSize: '9px',
    fontWeight: '900',
  },

  manageButton: {
    border: '1px solid #DCD6F3',
    background: '#F7F4FF',
    color: '#6C5CE7',
    borderRadius: '10px',
    padding: '9px 11px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  empty: {
    padding: '50px',
    textAlign: 'center',
    color: '#9997A0',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(25, 22, 40, .28)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 100,
  },

  modal: {
    width: '480px',
    maxWidth: '100%',
    height: '100vh',
    overflowY: 'auto',
    background: '#FFFFFF',
    padding: '28px',
    boxShadow:
      '-20px 0 50px rgba(30, 25, 70, .12)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    paddingBottom: '22px',
    borderBottom: '1px solid #EEEAF6',
  },

  modalLabel: {
    margin: 0,
    color: '#6C5CE7',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.4px',
  },

  modalTitle: {
    margin: '6px 0 4px',
    color: '#2C2C34',
  },

  modalEmail: {
    margin: 0,
    color: '#94919B',
    fontSize: '13px',
  },

  closeButton: {
    width: '38px',
    height: '38px',
    border: 'none',
    borderRadius: '11px',
    background: '#F5F3F8',
    fontSize: '23px',
    cursor: 'pointer',
  },

  accessSection: {
    marginTop: '26px',
  },

  grantSection: {
    marginTop: '30px',
  },

  sectionLabel: {
    margin: 0,
    color: '#A09EAA',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },

  sectionTitle: {
    margin: '5px 0 14px',
    color: '#313139',
    fontSize: '18px',
  },

  accessList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },

  accessRow: {
    border: '1px solid #EEEAF6',
    borderRadius: '13px',
    padding: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },

  accessTitle: {
    color: '#3B3942',
    fontSize: '13px',
  },

  accessStatus: {
    margin: '4px 0 0',
    color: '#218647',
    fontSize: '10px',
  },

  revokeButton: {
    border: 'none',
    background: '#FFF1F1',
    color: '#BC5252',
    borderRadius: '9px',
    padding: '8px 9px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
  },

  noAccess: {
    background: '#F8F7FB',
    color: '#92909A',
    borderRadius: '12px',
    padding: '18px',
    textAlign: 'center',
    fontSize: '13px',
  },

  grantRow: {
    display: 'flex',
    gap: '9px',
  },

  select: {
    flex: 1,
    minWidth: 0,
    border: '1px solid #E2DEEB',
    borderRadius: '11px',
    padding: '12px',
    background: '#FFFFFF',
  },

  grantButton: {
    border: 'none',
    borderRadius: '11px',
    background: '#6C5CE7',
    color: '#FFFFFF',
    padding: '12px 15px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  emailButton: {
    marginTop: '30px',
    width: '100%',
    border: '1px solid #DCD6F3',
    background: '#F7F4FF',
    color: '#6C5CE7',
    borderRadius: '12px',
    padding: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },
}