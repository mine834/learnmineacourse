'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function StudentPaymentsPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [requests, setRequests] = useState([])

  const [courseId, setCourseId] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [note, setNote] = useState('')
  const [proofFile, setProofFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    initializePage()
  }, [])

  async function initializePage() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      router.replace('/login')
      return
    }

    const currentUser = session.user

    setUser(currentUser)

    const [
      profileResult,
      coursesResult,
      enrollmentsResult,
      requestsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle(),

      supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', currentUser.id),

      supabase
        .from('payment_requests')
        .select(`
          *,
          courses (
            id,
            title,
            price
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', {
          ascending: false,
        }),
    ])

    if (profileResult.error) {
      console.error(
        'PROFILE ERROR:',
        profileResult.error
      )
    }

    if (coursesResult.error) {
      console.error(
        'COURSES ERROR:',
        coursesResult.error
      )
    }

    if (enrollmentsResult.error) {
      console.error(
        'ENROLLMENTS ERROR:',
        enrollmentsResult.error
      )
    }

    if (requestsResult.error) {
      console.error(
        'REQUESTS ERROR:',
        requestsResult.error
      )
    }

    setProfile(profileResult.data || null)

    setCourses(
      coursesResult.data || []
    )

    setEnrollments(
      enrollmentsResult.data || []
    )

    setRequests(
      requestsResult.data || []
    )

    setSenderName(
      profileResult.data?.full_name || ''
    )

    setLoading(false)
  }

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        enrollments.map(
          (item) => item.course_id
        )
      ),
    [enrollments]
  )

  const availableCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          !enrolledCourseIds.has(
            course.id
          )
      ),
    [courses, enrolledCourseIds]
  )

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course.id === courseId
      ) || null,
    [courses, courseId]
  )

  async function submitPayment(
    event
  ) {
    event.preventDefault()

    if (!user) return

    if (!courseId) {
      alert(
        'Сургалтаа сонгоно уу.'
      )
      return
    }

    if (!senderName.trim()) {
      alert(
        'Шилжүүлэг хийсэн нэрээ оруулна уу.'
      )
      return
    }

    if (!senderPhone.trim()) {
      alert(
        'Утасны дугаараа оруулна уу.'
      )
      return
    }

    const existingPending =
      requests.find(
        (item) =>
          item.course_id ===
            courseId &&
          item.status === 'pending'
      )

    if (existingPending) {
      alert(
        'Энэ сургалтын төлбөрийн хүсэлт аль хэдийн хүлээгдэж байна.'
      )
      return
    }

    setSubmitting(true)

    let proofPath = ''

    try {
      if (proofFile) {
        const extension =
          proofFile.name
            .split('.')
            .pop()
            ?.toLowerCase() ||
          'jpg'

        const filePath = `${user.id}/${courseId}/${Date.now()}.${extension}`

        const {
          error: uploadError,
        } = await supabase.storage
          .from('payment-proofs')
          .upload(
            filePath,
            proofFile,
            {
              cacheControl: '3600',
              upsert: false,
            }
          )

        if (uploadError) {
          throw uploadError
        }

        proofPath = filePath
      }

      const {
        error: requestError,
      } = await supabase.rpc(
        'create_payment_request',
        {
          target_course_id:
            courseId,

          sender_name_input:
            senderName.trim(),

          sender_phone_input:
            senderPhone.trim(),

          note_input:
            note.trim(),

          proof_path_input:
            proofPath,
        }
      )

      if (requestError) {
        throw requestError
      }

      alert(
        'Төлбөрийн хүсэлт амжилттай илгээгдлээ.'
      )

      setCourseId('')
      setNote('')
      setProofFile(null)

      const fileInput =
        document.getElementById(
          'payment-proof'
        )

      if (fileInput) {
        fileInput.value = ''
      }

      await initializePage()
    } catch (error) {
      console.error(
        'PAYMENT ERROR:',
        error
      )

      if (
        error.message?.includes(
          'Pending request already exists'
        )
      ) {
        alert(
          'Энэ сургалтын төлбөрийн хүсэлт аль хэдийн хүлээгдэж байна.'
        )
      } else if (
        error.message?.includes(
          'Already enrolled'
        )
      ) {
        alert(
          'Та энэ сургалтын эрхтэй байна.'
        )
      } else {
        alert(
          error.message ||
            'Алдаа гарлаа.'
        )
      }
    }

    setSubmitting(false)
  }

  function money(value) {
    return Number(
      value || 0
    ).toLocaleString()
  }

  function formatDate(value) {
    if (!value) return '-'

    return new Date(
      value
    ).toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function statusInfo(status) {
    if (status === 'approved') {
      return {
        text: 'APPROVED',
        title:
          'Төлбөр баталгаажсан',
        description:
          'Таны сургалтын эрх нээгдсэн байна.',
      }
    }

    if (status === 'rejected') {
      return {
        text: 'REJECTED',
        title:
          'Хүсэлт татгалзсан',
        description:
          'Төлбөрийн мэдээллээ шалгаад дахин хүсэлт илгээнэ үү.',
      }
    }

    return {
      text: 'PENDING',
      title:
        'Шалгаж байна',
      description:
        'Таны төлбөрийн хүсэлтийг админ шалгаж байна.',
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Payment мэдээлэл
          ачаалж байна...
        </div>

        <style jsx>{`
          .page {
            padding: 40px;
          }

          .loading {
            padding: 50px;
            background: white;
            border-radius: 20px;
            text-align: center;
            color: #9995a4;
          }
        `}</style>
      </main>
    )
  }

  return (
    <>
      <main className="page">
        <div className="page-header">
          <p className="eyebrow">
            PAYMENT
          </p>

          <h1>
            Төлбөр
          </h1>

          <p>
            Сургалтаа сонгож
            төлбөрийн хүсэлтээ
            илгээнэ үү.
          </p>
        </div>

        <div className="main-grid">
          <section className="payment-form-card">
            <div className="section-heading">
              <div>
                <span>
                  NEW REQUEST
                </span>

                <h2>
                  Төлбөрийн хүсэлт
                </h2>
              </div>
            </div>

            {availableCourses.length ===
            0 ? (
              <div className="empty-box">
                <strong>
                  Худалдан авах шинэ
                  сургалт алга.
                </strong>

                <p>
                  Таны сургалтын
                  эрхүүд Dashboard
                  дээр харагдана.
                </p>

                <button
                  onClick={() =>
                    router.push(
                      '/dashboard'
                    )
                  }
                >
                  Dashboard →
                </button>
              </div>
            ) : (
              <form
                onSubmit={
                  submitPayment
                }
              >
                <label>
                  Сургалт
                </label>

                <select
                  value={courseId}
                  onChange={(event) =>
                    setCourseId(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Сургалт сонгох
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
                        {course.title}
                      </option>
                    )
                  )}
                </select>

                {selectedCourse && (
                  <div className="price-box">
                    <span>
                      ТӨЛБӨР
                    </span>

                    <strong>
                      ₮
                      {money(
                        selectedCourse.price
                      )}
                    </strong>

                    <p>
                      Хүсэлт илгээхэд
                      систем тухайн
                      сургалтын үнийг
                      автоматаар
                      баталгаажуулна.
                    </p>
                  </div>
                )}

                <div className="two-columns">
                  <div>
                    <label>
                      Шилжүүлэг
                      хийсэн нэр
                    </label>

                    <input
                      value={
                        senderName
                      }
                      onChange={(
                        event
                      ) =>
                        setSenderName(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Нэр"
                    />
                  </div>

                  <div>
                    <label>
                      Утасны дугаар
                    </label>

                    <input
                      value={
                        senderPhone
                      }
                      onChange={(
                        event
                      ) =>
                        setSenderPhone(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="9911..."
                    />
                  </div>
                </div>

                <label>
                  Төлбөрийн баримт
                </label>

                <div className="upload-box">
                  <input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={(
                      event
                    ) =>
                      setProofFile(
                        event
                          .target
                          .files?.[0] ||
                          null
                      )
                    }
                  />

                  {proofFile && (
                    <p>
                      ✓{' '}
                      {
                        proofFile.name
                      }
                    </p>
                  )}
                </div>

                <label>
                  Нэмэлт тайлбар
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target
                        .value
                    )
                  }
                  placeholder="Шаардлагатай бол тайлбар бичнэ үү."
                />

                <button
                  className="submit-button"
                  type="submit"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? 'Илгээж байна...'
                    : 'Төлбөрийн хүсэлт илгээх →'}
                </button>
              </form>
            )}
          </section>

          <aside className="info-card">
            <span>
              HOW IT WORKS
            </span>

            <h2>
              Дараа нь юу болох вэ?
            </h2>

            <div className="step">
              <b>01</b>

              <div>
                <strong>
                  Төлбөр хийх
                </strong>

                <p>
                  Сургалтын төлбөрөө
                  шилжүүлнэ.
                </p>
              </div>
            </div>

            <div className="step">
              <b>02</b>

              <div>
                <strong>
                  Хүсэлт илгээх
                </strong>

                <p>
                  Баримт болон
                  мэдээллээ оруулна.
                </p>
              </div>
            </div>

            <div className="step">
              <b>03</b>

              <div>
                <strong>
                  Баталгаажуулах
                </strong>

                <p>
                  Админ төлбөрийг
                  шалгана.
                </p>
              </div>
            </div>

            <div className="step">
              <b>04</b>

              <div>
                <strong>
                  Сургалт нээгдэнэ
                </strong>

                <p>
                  Баталгаажмагц
                  Dashboard дээр
                  сургалтын эрх
                  нээгдэнэ.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="history-section">
          <div className="history-heading">
            <div>
              <span>
                MY PAYMENTS
              </span>

              <h2>
                Миний хүсэлтүүд
              </h2>
            </div>

            <strong>
              {requests.length}
            </strong>
          </div>

          {requests.length === 0 ? (
            <div className="history-empty">
              Төлбөрийн хүсэлт
              одоогоор байхгүй.
            </div>
          ) : (
            <div className="request-list">
              {requests.map(
                (request) => {
                  const status =
                    statusInfo(
                      request.status
                    )

                  return (
                    <article
                      key={
                        request.id
                      }
                      className="request-card"
                    >
                      <div className="request-top">
                        <div>
                          <span>
                            COURSE
                          </span>

                          <h3>
                            {request
                              .courses
                              ?.title ||
                              'Сургалт'}
                          </h3>
                        </div>

                        <div
                          className={`badge ${request.status}`}
                        >
                          {
                            status.text
                          }
                        </div>
                      </div>

                      <div className="request-details">
                        <div>
                          <span>
                            AMOUNT
                          </span>

                          <strong>
                            ₮
                            {money(
                              request.amount
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              request.created_at
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            STATUS
                          </span>

                          <strong>
                            {
                              status.title
                            }
                          </strong>
                        </div>
                      </div>

                      <div
                        className={`status-message ${request.status}`}
                      >
                        <strong>
                          {
                            status.title
                          }
                        </strong>

                        <p>
                          {
                            status.description
                          }
                        </p>
                      </div>

                      {request.status ===
                        'approved' && (
                        <button
                          className="course-button"
                          onClick={() =>
                            router.push(
                              `/dashboard/courses/${request.course_id}`
                            )
                          }
                        >
                          Сургалт руу
                          орох →
                        </button>
                      )}
                    </article>
                  )
                }
              )}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          width: 100%;
          max-width: 1180px;

          margin: 0 auto;

          padding: 42px 34px 70px;

          color: #292732;
        }

        .page-header {
          margin-bottom: 28px;
        }

        .eyebrow,
        .section-heading span,
        .info-card > span,
        .history-heading span,
        .request-top span,
        .request-details span {
          color: #6c5ce7;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.3px;
        }

        .page-header h1 {
          margin: 7px 0 7px;

          font-size: 38px;

          letter-spacing: -1.4px;
        }

        .page-header > p:last-child {
          margin: 0;

          color: #918d99;

          font-size: 13px;
        }

        .main-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(270px, 0.7fr);

          gap: 18px;
        }

        .payment-form-card,
        .info-card,
        .history-section {
          border: 1px solid #e8e4f0;

          border-radius: 20px;

          background: #fff;
        }

        .payment-form-card {
          padding: 25px;
        }

        .section-heading h2,
        .info-card h2,
        .history-heading h2 {
          margin: 6px 0 0;

          font-size: 21px;

          letter-spacing: -0.5px;
        }

        form {
          margin-top: 23px;
        }

        label {
          display: block;

          margin: 16px 0 7px;

          color: #67636d;

          font-size: 10px;
          font-weight: 800;
        }

        input,
        select,
        textarea {
          width: 100%;

          border: 1px solid #e2deea;

          border-radius: 11px;

          outline: none;

          background: #fff;

          color: #38353e;

          font-family: inherit;

          font-size: 12px;
        }

        input,
        select {
          height: 45px;

          padding: 0 13px;
        }

        textarea {
          min-height: 100px;

          padding: 13px;

          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #6c5ce7;
        }

        .price-box {
          margin-top: 10px;

          padding: 16px;

          border-radius: 13px;

          background: #f8f7ff;
        }

        .price-box span {
          color: #9893a1;

          font-size: 8px;
          font-weight: 900;
        }

        .price-box strong {
          display: block;

          margin-top: 4px;

          color: #6c5ce7;

          font-size: 23px;
        }

        .price-box p {
          margin: 5px 0 0;

          color: #9995a1;

          font-size: 9px;

          line-height: 1.5;
        }

        .two-columns {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;
        }

        .upload-box {
          padding: 12px;

          border: 1px dashed #d8d2e7;

          border-radius: 11px;

          background: #fcfbff;
        }

        .upload-box input {
          height: auto;

          padding: 0;

          border: 0;

          background: transparent;
        }

        .upload-box p {
          margin: 9px 0 0;

          color: #338356;

          font-size: 10px;
          font-weight: 700;
        }

        .submit-button {
          width: 100%;
          min-height: 47px;

          margin-top: 20px;

          border: 0;

          border-radius: 11px;

          background: #6c5ce7;

          color: #fff;

          font-size: 11px;
          font-weight: 900;

          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .info-card {
          padding: 25px;

          background: #faf9ff;
        }

        .step {
          display: flex;

          gap: 12px;

          margin-top: 22px;
        }

        .step b {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #ece8ff;

          color: #6c5ce7;

          font-size: 9px;
        }

        .step strong {
          color: #4b4751;

          font-size: 11px;
        }

        .step p {
          margin: 4px 0 0;

          color: #9a96a0;

          font-size: 9px;

          line-height: 1.55;
        }

        .empty-box {
          margin-top: 22px;

          padding: 30px;

          border-radius: 15px;

          background: #f8f7ff;

          text-align: center;
        }

        .empty-box strong {
          font-size: 13px;
        }

        .empty-box p {
          color: #96919e;

          font-size: 10px;
        }

        .empty-box button {
          margin-top: 8px;

          border: 0;

          background: transparent;

          color: #6c5ce7;

          font-size: 10px;
          font-weight: 900;

          cursor: pointer;
        }

        .history-section {
          margin-top: 18px;

          padding: 25px;
        }

        .history-heading {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 18px;
        }

        .history-heading > strong {
          width: 37px;
          height: 37px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #eeeaff;

          color: #6c5ce7;

          font-size: 12px;
        }

        .history-empty {
          padding: 35px;

          border-radius: 14px;

          background: #faf9fc;

          color: #9995a0;

          text-align: center;

          font-size: 11px;
        }

        .request-list {
          display: grid;

          gap: 12px;
        }

        .request-card {
          padding: 18px;

          border: 1px solid #ece8f2;

          border-radius: 15px;
        }

        .request-top {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;
        }

        .request-top h3 {
          margin: 5px 0 0;

          font-size: 14px;
        }

        .badge {
          padding: 6px 9px;

          border-radius: 999px;

          font-size: 8px;
          font-weight: 900;
        }

        .badge.pending {
          background: #fff4db;

          color: #b77810;
        }

        .badge.approved {
          background: #e5f6eb;

          color: #27804c;
        }

        .badge.rejected {
          background: #fdebed;

          color: #bd4d56;
        }

        .request-details {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 8px;

          margin-top: 15px;
        }

        .request-details > div {
          padding: 12px;

          border-radius: 10px;

          background: #faf9fc;
        }

        .request-details span {
          display: block;

          margin-bottom: 5px;

          color: #aaa5af;
        }

        .request-details strong {
          color: #514d57;

          font-size: 10px;
        }

        .status-message {
          margin-top: 12px;

          padding: 13px;

          border-radius: 10px;
        }

        .status-message strong {
          font-size: 10px;
        }

        .status-message p {
          margin: 4px 0 0;

          font-size: 9px;

          line-height: 1.5;
        }

        .status-message.pending {
          background: #fff9eb;

          color: #97701e;
        }

        .status-message.approved {
          background: #edf9f1;

          color: #33794e;
        }

        .status-message.rejected {
          background: #fff0f1;

          color: #a24f56;
        }

        .course-button {
          width: 100%;
          min-height: 42px;

          margin-top: 12px;

          border: 0;

          border-radius: 10px;

          background: #6c5ce7;

          color: white;

          font-size: 10px;
          font-weight: 900;

          cursor: pointer;
        }

        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 25px 15px 55px;
          }

          .page-header h1 {
            font-size: 31px;
          }

          .payment-form-card,
          .info-card,
          .history-section {
            padding: 17px;
          }

          .two-columns {
            grid-template-columns: 1fr;
          }

          .request-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}