'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AdminStudentsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])

  const [search, setSearch] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const [processing, setProcessing] = useState(false)
  const [processingCourseId, setProcessingCourseId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

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
          .select('id, title, price, published')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('enrollments')
          .select('id, user_id, course_id'),
      ])

      if (studentsResult.error) {
        throw studentsResult.error
      }

      if (coursesResult.error) {
        throw coursesResult.error
      }

      if (enrollmentsResult.error) {
        throw enrollmentsResult.error
      }

      setStudents(studentsResult.data || [])
      setCourses(coursesResult.data || [])
      setEnrollments(enrollmentsResult.data || [])

      if (selectedStudent) {
        const refreshedStudent =
          (studentsResult.data || []).find(
            (student) =>
              student.id === selectedStudent.id
          )

        if (refreshedStudent) {
          setSelectedStudent(refreshedStudent)
        }
      }
    } catch (error) {
      console.error(
        'Load students error:',
        error
      )

      alert(
        error?.message ||
          'Сурагчдын мэдээлэл ачааллахад алдаа гарлаа.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function refreshEnrollments() {
    const {
      data,
      error,
    } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id')

    if (error) {
      throw error
    }

    setEnrollments(data || [])
  }

  const filteredStudents = useMemo(() => {
    const keyword =
      search.trim().toLowerCase()

    if (!keyword) {
      return students
    }

    return students.filter((student) => {
      const text = [
        student.full_name,
        student.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return text.includes(keyword)
    })
  }, [students, search])

  function getStudentEnrollments(studentId) {
    return enrollments.filter(
      (item) =>
        item.user_id === studentId
    )
  }

  function getStudentCourses(studentId) {
    const studentEnrollments =
      getStudentEnrollments(studentId)

    const courseIds =
      new Set(
        studentEnrollments.map(
          (item) => item.course_id
        )
      )

    return courses.filter(
      (course) =>
        courseIds.has(course.id)
    )
  }

  function getAvailableCourses(studentId) {
    const currentCourseIds =
      new Set(
        getStudentEnrollments(studentId).map(
          (item) => item.course_id
        )
      )

    return courses.filter(
      (course) =>
        !currentCourseIds.has(course.id)
    )
  }

  async function grantCourseAccess() {
    if (!selectedStudent?.id) {
      return
    }

    if (!selectedCourseId) {
      alert('Course сонгоно уу.')
      return
    }

    try {
      setProcessing(true)

      const {
        error,
      } = await supabase
        .from('enrollments')
        .insert({
          user_id:
            selectedStudent.id,

          course_id:
            selectedCourseId,
        })

      if (error) {
        throw error
      }

      await refreshEnrollments()

      setSelectedCourseId('')

      alert(
        'Сургалтын эрх амжилттай нээгдлээ.'
      )
    } catch (error) {
      console.error(
        'Grant course access error:',
        error
      )

      alert(
        error?.message ||
          'Сургалтын эрх нээхэд алдаа гарлаа.'
      )
    } finally {
      setProcessing(false)
    }
  }

  // ==========================================
  // REVOKE COURSE ACCESS
  // SECURE RPC
  // ==========================================

  async function revokeCourseAccess(course) {
    if (!selectedStudent?.id) {
      return
    }

    if (!course?.id) {
      return
    }

    const confirmed =
      window.confirm(
        `${course.title} сургалтын эрхийг цуцлах уу?`
      )

    if (!confirmed) {
      return
    }

    try {
      setProcessingCourseId(
        course.id
      )

      const {
        data,
        error,
      } = await supabase.rpc(
        'revoke_course_access',
        {
          target_user_id:
            selectedStudent.id,

          target_course_id:
            course.id,
        }
      )

      if (error) {
        throw error
      }

      console.log(
        'Revoke result:',
        data
      )

      await refreshEnrollments()

      alert(
        'Сургалтын эрх амжилттай цуцлагдлаа.'
      )
    } catch (error) {
      console.error(
        'Revoke course access error:',
        error
      )

      alert(
        error?.message ||
          'Сургалтын эрх цуцлахад алдаа гарлаа.'
      )
    } finally {
      setProcessingCourseId(null)
    }
  }

  function prepareEmail(student) {
    if (!student?.email) {
      alert(
        'Student email олдсонгүй.'
      )
      return
    }

    router.push(
      `/admin/email?to=${encodeURIComponent(
        student.email
      )}`
    )
  }

  function formatDate(value) {
    if (!value) {
      return '—'
    }

    return new Date(
      value
    ).toLocaleDateString('mn-MN')
  }

  const selectedStudentCourses =
    selectedStudent
      ? getStudentCourses(
          selectedStudent.id
        )
      : []

  const availableCourses =
    selectedStudent
      ? getAvailableCourses(
          selectedStudent.id
        )
      : []

  return (
    <div className="students-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            STUDENT MANAGEMENT
          </div>

          <h1>
            Сурагчид
          </h1>

          <p>
            Сурагчийн сургалтын эрх,
            email болон account
            мэдээллийг удирдана.
          </p>
        </div>

        <div className="student-count">
          <strong>
            {students.length}
          </strong>

          <span>
            STUDENTS
          </span>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Нэр эсвэл email хайх..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      {loading ? (
        <div className="empty-card">
          Сурагчдын мэдээлэл
          ачааллаж байна...
        </div>
      ) : filteredStudents.length ===
        0 ? (
        <div className="empty-card">
          Сурагч олдсонгүй.
        </div>
      ) : (
        <div className="students-list">
          {filteredStudents.map(
            (student) => {
              const studentCourses =
                getStudentCourses(
                  student.id
                )

              return (
                <button
                  type="button"
                  className="student-card"
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(
                      student
                    )

                    setSelectedCourseId(
                      ''
                    )
                  }}
                >
                  <div className="student-left">
                    <div className="avatar">
                      {(
                        student.full_name ||
                        student.email ||
                        'S'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="student-name">
                        {student.full_name ||
                          student.email ||
                          'Student'}
                      </div>

                      <div className="student-email">
                        {student.email ||
                          'Email байхгүй'}
                      </div>
                    </div>
                  </div>

                  <div className="student-meta">
                    <div>
                      <span>
                        COURSE ACCESS
                      </span>

                      <strong>
                        {
                          studentCourses.length
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        JOINED
                      </span>

                      <strong>
                        {formatDate(
                          student.created_at
                        )}
                      </strong>
                    </div>

                    <div className="manage">
                      Удирдах →
                    </div>
                  </div>
                </button>
              )
            }
          )}
        </div>
      )}

      {selectedStudent && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedStudent(
              null
            )
          }
        >
          <aside
            className="student-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panel-header">
              <div className="panel-person">
                <div className="large-avatar">
                  {(
                    selectedStudent.full_name ||
                    selectedStudent.email ||
                    'S'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>
                    {selectedStudent.full_name ||
                      selectedStudent.email ||
                      'Student'}
                  </h2>

                  <p>
                    {selectedStudent.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="panel-content">
              <section>
                <div className="section-label">
                  COURSE ACCESS
                </div>

                <h3>
                  Одоогийн сургалтууд
                </h3>

                {selectedStudentCourses.length ===
                0 ? (
                  <div className="no-access">
                    Одоогоор сургалтын
                    эрхгүй.
                  </div>
                ) : (
                  <div className="access-list">
                    {selectedStudentCourses.map(
                      (course) => (
                        <div
                          className="access-card"
                          key={
                            course.id
                          }
                        >
                          <div>
                            <strong>
                              {
                                course.title
                              }
                            </strong>

                            <span>
                              ACTIVE
                            </span>
                          </div>

                          <button
                            type="button"
                            className="revoke-button"
                            disabled={
                              processingCourseId ===
                              course.id
                            }
                            onClick={() =>
                              revokeCourseAccess(
                                course
                              )
                            }
                          >
                            {processingCourseId ===
                            course.id
                              ? 'Цуцалж байна...'
                              : 'Эрх цуцлах'}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="add-access-section">
                <div className="section-label">
                  ADD ACCESS
                </div>

                <h3>
                  Шинэ сургалтын эрх
                </h3>

                {availableCourses.length >
                0 ? (
                  <div className="grant-row">
                    <select
                      value={
                        selectedCourseId
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedCourseId(
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Course сонгох
                      </option>

                      {availableCourses.map(
                        (course) => (
                          <option
                            key={
                              course.id
                            }
                            value={
                              course.id
                            }
                          >
                            {
                              course.title
                            }
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      className="grant-button"
                      onClick={
                        grantCourseAccess
                      }
                      disabled={
                        processing ||
                        !selectedCourseId
                      }
                    >
                      {processing
                        ? 'Нээж байна...'
                        : 'Эрх нээх'}
                    </button>
                  </div>
                ) : (
                  <div className="no-access">
                    Нэмэх боломжтой
                    course байхгүй.
                  </div>
                )}
              </section>

              <button
                type="button"
                className="email-button"
                onClick={() =>
                  prepareEmail(
                    selectedStudent
                  )
                }
              >
                <span>
                  ✉
                </span>

                Email бэлдэх
              </button>
            </div>
          </aside>
        </div>
      )}

      <style jsx>{`
        .students-page {
          width: 100%;
          max-width: 1180px;

          padding:
            46px
            34px
            90px;

          color: #302e38;
        }

        .page-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 24px;

          margin-bottom: 26px;
        }

        .eyebrow,
        .section-label {
          color: #6c5ce7;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.14em;
        }

        .page-heading h1 {
          margin:
            8px
            0
            0;

          font-size: 30px;

          letter-spacing: -0.04em;
        }

        .page-heading p {
          margin:
            9px
            0
            0;

          color: #9995a3;

          font-size: 14px;

          line-height: 1.6;
        }

        .student-count {
          min-width: 105px;

          padding:
            14px
            16px;

          border:
            1px solid
            #e9e5f2;

          border-radius: 14px;

          background: white;

          text-align: center;
        }

        .student-count strong {
          display: block;

          font-size: 24px;

          color: #6c5ce7;
        }

        .student-count span {
          display: block;

          margin-top: 4px;

          color: #a19ca9;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.1em;
        }

        .search-bar {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 18px;

          padding:
            0
            14px;

          border:
            1px solid
            #e6e2ed;

          border-radius: 13px;

          background: white;
        }

        .search-icon {
          color: #9994a4;

          font-size: 18px;
        }

        .search-bar input {
          width: 100%;

          border: 0;
          outline: none;

          padding:
            13px
            0;

          background: transparent;

          font-size: 13px;
        }

        .students-list {
          display: flex;
          flex-direction: column;

          gap: 11px;
        }

        .student-card {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 18px;

          border:
            1px solid
            #e9e5f1;

          border-radius: 16px;

          background: white;

          color: inherit;

          text-align: left;

          cursor: pointer;

          transition:
            border-color 0.16s ease,
            transform 0.16s ease,
            background 0.16s ease;
        }

        .student-card:hover {
          border-color: #cfc8f3;

          background: #fdfcff;

          transform:
            translateY(-1px);
        }

        .student-left {
          display: flex;
          align-items: center;

          gap: 12px;

          min-width: 0;
        }

        .avatar,
        .large-avatar {
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #eeebff;
          color: #6c5ce7;

          font-weight: 800;
        }

        .avatar {
          width: 42px;
          height: 42px;

          border-radius: 13px;
        }

        .large-avatar {
          width: 52px;
          height: 52px;

          border-radius: 15px;

          font-size: 18px;
        }

        .student-name {
          color: #34313b;

          font-size: 14px;
          font-weight: 800;
        }

        .student-email {
          margin-top: 4px;

          color: #a29eaa;

          font-size: 12px;
        }

        .student-meta {
          display: flex;
          align-items: center;

          gap: 30px;
        }

        .student-meta > div:not(.manage) {
          min-width: 75px;
        }

        .student-meta span {
          display: block;

          margin-bottom: 5px;

          color: #aaa5b1;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.1em;
        }

        .student-meta strong {
          color: #5d5864;

          font-size: 12px;
        }

        .manage {
          color: #6c5ce7;

          font-size: 12px;
          font-weight: 800;
        }

        .empty-card,
        .no-access {
          padding:
            30px
            18px;

          border-radius: 13px;

          background: #f9f8fc;

          color: #9e99a7;

          text-align: center;

          font-size: 13px;
        }

        .modal-backdrop {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: flex;
          justify-content: flex-end;

          background:
            rgba(
              30,
              27,
              42,
              0.32
            );

          backdrop-filter:
            blur(3px);
        }

        .student-panel {
          width:
            min(
              500px,
              100%
            );

          height: 100vh;

          overflow-y: auto;

          background: white;

          box-shadow:
            -18px
            0
            50px
            rgba(
              40,
              30,
              80,
              0.13
            );
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          padding:
            26px
            26px
            22px;

          border-bottom:
            1px solid
            #eeeaf4;
        }

        .panel-person {
          display: flex;
          align-items: center;

          gap: 13px;

          min-width: 0;
        }

        .panel-person h2 {
          margin: 0;

          color: #34313a;

          font-size: 19px;

          word-break: break-word;
        }

        .panel-person p {
          margin:
            5px
            0
            0;

          color: #9994a2;

          font-size: 12px;

          word-break: break-all;
        }

        .close-button {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          border: 0;

          border-radius: 999px;

          background: #f4f2f8;

          color: #595461;

          font-size: 22px;

          cursor: pointer;
        }

        .panel-content {
          padding:
            28px
            26px
            40px;
        }

        .panel-content section + section {
          margin-top: 34px;
        }

        .panel-content h3 {
          margin:
            10px
            0
            16px;

          font-size: 20px;

          font-weight: 500;
        }

        .access-list {
          display: flex;
          flex-direction: column;

          gap: 9px;
        }

        .access-card {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding:
            14px
            15px;

          border:
            1px solid
            #e9e5f1;

          border-radius: 12px;

          background: #faf9fd;
        }

        .access-card strong {
          display: block;

          color: #45414b;

          font-size: 13px;
        }

        .access-card span {
          display: inline-block;

          margin-top: 5px;

          color: #398259;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.08em;
        }

        .revoke-button {
          border:
            1px solid
            #efcfd2;

          border-radius: 8px;

          padding:
            8px
            10px;

          background: white;

          color: #c3545d;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;
        }

        .revoke-button:disabled {
          opacity: 0.55;

          cursor: wait;
        }

        .grant-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto;

          gap: 10px;
        }

        .grant-row select {
          width: 100%;

          border:
            1px solid
            #dfdae9;

          border-radius: 11px;

          padding:
            11px
            12px;

          background: white;

          color: #3e3a46;

          outline: none;
        }

        .grant-row select:focus {
          border-color: #6c5ce7;

          box-shadow:
            0 0 0 3px
            rgba(
              108,
              92,
              231,
              0.08
            );
        }

        .grant-button {
          border: 0;

          border-radius: 11px;

          padding:
            0
            18px;

          background: #6c5ce7;

          color: white;

          font-weight: 800;

          cursor: pointer;
        }

        .grant-button:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }

        .email-button {
          width: 100%;

          margin-top: 36px;

          border:
            1px solid
            #d9d1ff;

          border-radius: 13px;

          padding:
            13px
            16px;

          background: #f8f6ff;

          color: #6c5ce7;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;
        }

        .email-button span {
          margin-right: 7px;
        }

        @media (
          max-width: 760px
        ) {
          .students-page {
            padding:
              28px
              16px
              100px;
          }

          .page-heading {
            align-items: flex-start;
          }

          .page-heading h1 {
            font-size: 25px;
          }

          .student-meta {
            gap: 12px;
          }

          .student-meta > div:not(.manage) {
            display: none;
          }

          .student-card {
            padding: 14px;
          }

          .student-panel {
            width: 100%;
          }
        }

        @media (
          max-width: 480px
        ) {
          .student-count {
            display: none;
          }

          .grant-row {
            grid-template-columns:
              1fr;
          }

          .grant-button {
            min-height: 44px;
          }

          .panel-header {
            padding:
              20px
              18px;
          }

          .panel-content {
            padding:
              24px
              18px
              36px;
          }
        }
      `}</style>
    </div>
  )
}