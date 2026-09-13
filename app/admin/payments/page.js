'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function StudentPaymentsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [requests, setRequests] = useState([])

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [note, setNote] = useState('')
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    try {
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
        courseResult,
        enrollmentResult,
        requestResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', currentUser.id)
          .single(),

        supabase
          .from('courses')
          .select(
            'id, title, description, price, published'
          )
          .eq('published', true)
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('enrollments')
          .select('id, course_id, user_id')
          .eq('user_id', currentUser.id),

        supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', {
            ascending: false,
          }),
      ])

      if (profileResult.error) {
        throw profileResult.error
      }

      if (courseResult.error) {
        throw courseResult.error
      }

      if (enrollmentResult.error) {
        throw enrollmentResult.error
      }

      if (requestResult.error) {
        throw requestResult.error
      }

      setProfile(profileResult.data || null)
      setCourses(courseResult.data || [])
      setEnrollments(enrollmentResult.data || [])
      setRequests(requestResult.data || [])

      if (profileResult.data?.full_name) {
        setSenderName(
          profileResult.data.full_name
        )
      }
    } catch (error) {
      console.error(
        'Load student payments error:',
        error
      )

      alert(
        error?.message ||
          'Payment мэдээлэл ачааллахад алдаа гарлаа.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // REAL ACTIVE COURSE ACCESS
  // ==========================================

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      enrollments.map(
        (item) => item.course_id
      )
    )
  }, [enrollments])

  const pendingCourseIds = useMemo(() => {
    return new Set(
      requests
        .filter(
          (item) =>
            item.status === 'pending'
        )
        .map(
          (item) => item.course_id
        )
    )
  }, [requests])

  function hasCourseAccess(courseId) {
    return enrolledCourseIds.has(
      courseId
    )
  }

  // ==========================================
  // COURSES AVAILABLE FOR PAYMENT
  // ==========================================

  const availableCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        !enrolledCourseIds.has(
          course.id
        ) &&
        !pendingCourseIds.has(
          course.id
        )
    )
  }, [
    courses,
    enrolledCourseIds,
    pendingCourseIds,
  ])

  const selectedCourse = useMemo(() => {
    return (
      courses.find(
        (course) =>
          course.id ===
          selectedCourseId
      ) || null
    )
  }, [
    courses,
    selectedCourseId,
  ])

  // ==========================================
  // FORMAT
  // ==========================================

  function formatPrice(value) {
    return (
      new Intl.NumberFormat(
        'en-US'
      ).format(
        Number(value || 0)
      ) + '₮'
    )
  }

  function formatDate(value) {
    if (!value) return '—'

    return new Date(
      value
    ).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getCourseTitle(courseId) {
    return (
      courses.find(
        (course) =>
          course.id === courseId
      )?.title || 'Сургалт'
    )
  }

  // ==========================================
  // EFFECTIVE STATUS
  //
  // approved payment + no enrollment
  // => access revoked
  // ==========================================

  function getEffectiveStatus(
    request
  ) {
    if (
      request.status ===
        'approved' &&
      !hasCourseAccess(
        request.course_id
      )
    ) {
      return 'revoked'
    }

    return request.status
  }

  function getStatusLabel(
    request
  ) {
    const status =
      getEffectiveStatus(
        request
      )

    if (status === 'approved') {
      return 'APPROVED'
    }

    if (status === 'rejected') {
      return 'REJECTED'
    }

    if (status === 'revoked') {
      return 'ACCESS REVOKED'
    }

    return 'PENDING'
  }

  function getStatusText(
    request
  ) {
    const status =
      getEffectiveStatus(
        request
      )

    if (status === 'approved') {
      return 'Төлбөр баталгаажсан'
    }

    if (status === 'rejected') {
      return 'Төлбөр татгалзсан'
    }

    if (status === 'revoked') {
      return 'Сургалтын эрх цуцлагдсан'
    }

    return 'Шалгаж байна'
  }

  // ==========================================
  // FORM
  // ==========================================

  function resetForm() {
    setSelectedCourseId('')
    setSenderPhone('')
    setNote('')
    setProofFile(null)

    if (profile?.full_name) {
      setSenderName(
        profile.full_name
      )
    } else {
      setSenderName('')
    }

    const input =
      document.getElementById(
        'payment-proof-input'
      )

    if (input) {
      input.value = ''
    }
  }

  async function uploadProof(
    courseId
  ) {
    if (!proofFile) return ''

    if (!user?.id) {
      throw new Error(
        'User мэдээлэл олдсонгүй.'
      )
    }

    const extension =
      proofFile.name
        .split('.')
        .pop()
        ?.toLowerCase() ||
      'jpg'

    const filePath =
      `${user.id}/${courseId}/${Date.now()}.${extension}`

    const { error } =
      await supabase.storage
        .from('payment-proofs')
        .upload(
          filePath,
          proofFile,
          {
            cacheControl: '3600',
            upsert: false,
          }
        )

    if (error) {
      throw error
    }

    return filePath
  }

  async function submitPayment(
    event
  ) {
    event.preventDefault()

    if (!selectedCourseId) {
      alert(
        'Сургалтаа сонгоно уу.'
      )
      return
    }

    if (!senderName.trim()) {
      alert(
        'Шилжүүлсэн хүний нэрээ оруулна уу.'
      )
      return
    }

    if (!proofFile) {
      alert(
        'Төлбөрийн баримтаа хавсаргана уу.'
      )
      return
    }

    try {
      setSubmitting(true)

      const proofPath =
        await uploadProof(
          selectedCourseId
        )

      const {
        data,
        error,
      } = await supabase.rpc(
        'create_payment_request',
        {
          target_course_id:
            selectedCourseId,

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

      if (error) {
        throw error
      }

      console.log(
        'Created payment request:',
        data
      )

      alert(
        'Төлбөрийн хүсэлт амжилттай илгээгдлээ.'
      )

      resetForm()
      await loadPage()
    } catch (error) {
      console.error(
        'Submit payment error:',
        error
      )

      alert(
        error?.message ||
          'Төлбөрийн хүсэлт илгээхэд алдаа гарлаа.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function retryRejected(
    request
  ) {
    const course =
      courses.find(
        (item) =>
          item.id ===
          request.course_id
      )

    if (!course) {
      alert(
        'Сургалтын мэдээлэл олдсонгүй.'
      )
      return
    }

    setSelectedCourseId(
      course.id
    )

    setSenderName(
      request.sender_name ||
        profile?.full_name ||
        ''
    )

    setSenderPhone(
      request.sender_phone ||
        ''
    )

    setNote(
      request.note || ''
    )

    setProofFile(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <div className="loading-page">
        Төлбөрийн мэдээлэл
        ачааллаж байна...

        <style jsx>{`
          .loading-page {
            padding: 50px 24px;
            color: #8e8a99;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="payment-page">
      {/* HEADER */}

      <div className="heading">
        <div className="eyebrow">
          PAYMENT
        </div>

        <h1>
          Сургалтын төлбөр
        </h1>

        <p>
          Төлбөрөө шилжүүлсний
          дараа баримтаа илгээж,
          admin баталгаажуулсны
          дараа сургалтын эрх
          нээгдэнэ.
        </p>
      </div>

      <div className="content-grid">
        {/* PAYMENT FORM */}

        <section className="form-card">
          <div className="section-label">
            NEW REQUEST
          </div>

          <h2>
            Төлбөрийн хүсэлт
            илгээх
          </h2>

          <form
            onSubmit={
              submitPayment
            }
          >
            <label>
              Сургалт
            </label>

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
                    {
                      course.title
                    }{' '}
                    —{' '}
                    {formatPrice(
                      course.price
                    )}
                  </option>
                )
              )}
            </select>

            {availableCourses.length ===
              0 && (
              <div className="info-box">
                Одоогоор шинэ
                payment request
                илгээх сургалт
                байхгүй байна.
              </div>
            )}

            {selectedCourse && (
              <div className="selected-course">
                <div>
                  <span>
                    Сонгосон
                    сургалт
                  </span>

                  <strong>
                    {
                      selectedCourse.title
                    }
                  </strong>
                </div>

                <div className="course-price">
                  {formatPrice(
                    selectedCourse.price
                  )}
                </div>
              </div>
            )}

            <label>
              Шилжүүлсэн хүний
              нэр
            </label>

            <input
              type="text"
              value={
                senderName
              }
              onChange={(
                event
              ) =>
                setSenderName(
                  event.target
                    .value
                )
              }
              placeholder="Жишээ: Аминаа"
            />

            <label>
              Утасны дугаар
            </label>

            <input
              type="text"
              value={
                senderPhone
              }
              onChange={(
                event
              ) =>
                setSenderPhone(
                  event.target
                    .value
                )
              }
              placeholder="99112233"
            />

            <label>
              Төлбөрийн баримт
            </label>

            <input
              id="payment-proof-input"
              type="file"
              accept="image/*"
              onChange={(
                event
              ) =>
                setProofFile(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
            />

            {proofFile && (
              <div className="file-name">
                {proofFile.name}
              </div>
            )}

            <label>
              Тэмдэглэл
            </label>

            <textarea
              value={note}
              onChange={(
                event
              ) =>
                setNote(
                  event.target
                    .value
                )
              }
              placeholder="Нэмэлт мэдээлэл байвал..."
              rows={4}
            />

            <button
              type="submit"
              className="submit-button"
              disabled={
                submitting ||
                availableCourses.length ===
                  0
              }
            >
              {submitting
                ? 'Илгээж байна...'
                : 'Төлбөрийн хүсэлт илгээх'}
            </button>
          </form>
        </section>

        {/* HISTORY */}

        <section className="history-card">
          <div className="section-label">
            HISTORY
          </div>

          <h2>
            Миний хүсэлтүүд
          </h2>

          {requests.length ===
          0 ? (
            <div className="empty">
              Одоогоор payment
              request байхгүй
              байна.
            </div>
          ) : (
            <div className="request-list">
              {requests.map(
                (request) => {
                  const effectiveStatus =
                    getEffectiveStatus(
                      request
                    )

                  return (
                    <div
                      className="request-card"
                      key={
                        request.id
                      }
                    >
                      <div className="request-top">
                        <div>
                          <div className="course-label">
                            COURSE
                          </div>

                          <div className="course-title">
                            {getCourseTitle(
                              request.course_id
                            )}
                          </div>
                        </div>

                        <span
                          className={`status ${effectiveStatus}`}
                        >
                          {getStatusLabel(
                            request
                          )}
                        </span>
                      </div>

                      <div className="request-details">
                        <div className="detail-box">
                          <span>
                            AMOUNT
                          </span>

                          <strong>
                            {formatPrice(
                              request.amount
                            )}
                          </strong>
                        </div>

                        <div className="detail-box">
                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              request.created_at
                            )}
                          </strong>
                        </div>

                        <div className="detail-box">
                          <span>
                            STATUS
                          </span>

                          <strong>
                            {getStatusText(
                              request
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* PENDING */}

                      {effectiveStatus ===
                        'pending' && (
                        <div className="pending-box">
                          <strong>
                            Төлбөр шалгаж
                            байна
                          </strong>

                          <p>
                            Таны төлбөрийн
                            хүсэлтийг admin
                            шалгаж байна.
                          </p>
                        </div>
                      )}

                      {/* APPROVED + ENROLLMENT EXISTS */}

                      {effectiveStatus ===
                        'approved' && (
                        <>
                          <div className="approved-box">
                            <strong>
                              Төлбөр
                              баталгаажсан
                            </strong>

                            <p>
                              Таны
                              сургалтын эрх
                              нээгдсэн байна.
                            </p>
                          </div>

                          <button
                            type="button"
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
                        </>
                      )}

                      {/* REVOKED */}

                      {effectiveStatus ===
                        'revoked' && (
                        <div className="revoked-box">
                          <strong>
                            Сургалтын эрх
                            цуцлагдсан
                          </strong>

                          <p>
                            Энэ сургалтын
                            access одоогоор
                            идэвхгүй байна.
                          </p>
                        </div>
                      )}

                      {/* REJECTED */}

                      {effectiveStatus ===
                        'rejected' && (
                        <div className="rejected-box">
                          <strong>
                            Төлбөр
                            баталгаажаагүй
                          </strong>

                          <p>
                            Мэдээллээ
                            шалгаад дахин
                            хүсэлт
                            илгээнэ үү.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              retryRejected(
                                request
                              )
                            }
                          >
                            Дахин хүсэлт
                            илгээх
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .payment-page {
          width: 100%;
          max-width: 1180px;

          padding:
            46px
            34px
            100px;

          color: #302e38;
        }

        .heading {
          margin-bottom: 28px;
        }

        .eyebrow,
        .section-label,
        .course-label {
          color: #6c5ce7;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.14em;
        }

        .heading h1 {
          margin:
            8px
            0
            0;

          font-size: 30px;

          letter-spacing: -0.04em;
        }

        .heading p {
          max-width: 650px;

          margin:
            10px
            0
            0;

          color: #9692a0;

          font-size: 14px;

          line-height: 1.7;
        }

        .content-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);

          gap: 20px;

          align-items: start;
        }

        .form-card,
        .history-card {
          background: #ffffff;

          border:
            1px solid
            #e9e5f2;

          border-radius: 20px;

          padding: 24px;
        }

        h2 {
          margin:
            7px
            0
            22px;

          font-size: 21px;
        }

        form {
          display: flex;
          flex-direction: column;
        }

        label {
          margin:
            15px
            0
            7px;

          font-size: 12px;
          font-weight: 800;

          color: #5e5a68;
        }

        input,
        select,
        textarea {
          width: 100%;

          border:
            1px solid
            #e2deeb;

          border-radius: 11px;

          padding:
            12px
            13px;

          background: #fbfaff;

          color: #37343e;

          font: inherit;

          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
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

        textarea {
          resize: vertical;
        }

        .selected-course {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 12px;

          padding: 14px;

          border-radius: 12px;

          background: #f6f4ff;
        }

        .selected-course span {
          display: block;

          margin-bottom: 4px;

          color: #9893a4;

          font-size: 10px;
        }

        .selected-course strong {
          font-size: 13px;
        }

        .course-price {
          color: #6c5ce7;

          font-size: 15px;
          font-weight: 800;

          white-space: nowrap;
        }

        .file-name {
          margin-top: 7px;

          color: #6c5ce7;

          font-size: 11px;
        }

        .info-box {
          margin-top: 12px;

          padding: 12px;

          background: #faf8ff;

          border-radius: 10px;

          color: #898494;

          font-size: 12px;

          line-height: 1.5;
        }

        .submit-button {
          margin-top: 20px;

          border: 0;

          border-radius: 11px;

          padding:
            13px
            16px;

          background: #6c5ce7;

          color: #ffffff;

          font-weight: 800;

          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }

        .request-list {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .request-card {
          border:
            1px solid
            #e7e2ef;

          border-radius: 18px;

          padding: 24px;
        }

        .request-top {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
        }

        .course-title {
          margin-top: 12px;

          font-size: 21px;

          font-weight: 500;
        }

        .status {
          display: inline-flex;

          padding:
            9px
            13px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.04em;

          white-space: nowrap;
        }

        .status.pending {
          background: #fff7df;
          color: #b27a17;
        }

        .status.approved {
          background: #e6f7ec;
          color: #277d4a;
        }

        .status.rejected {
          background: #fff0f1;
          color: #c8545d;
        }

        .status.revoked {
          background: #f1eff4;
          color: #77717f;
        }

        .request-details {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 14px;

          margin-bottom: 22px;
        }

        .detail-box {
          padding:
            18px
            17px;

          background: #faf9fd;

          border-radius: 15px;
        }

        .detail-box span {
          display: block;

          margin-bottom: 16px;

          color: #aaa6b1;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        .detail-box strong {
          color: #58545f;

          font-size: 13px;
        }

        .approved-box,
        .pending-box,
        .rejected-box,
        .revoked-box {
          padding:
            18px
            20px;

          border-radius: 15px;
        }

        .approved-box {
          background: #ebf8f0;

          color: #2e7c4d;
        }

        .pending-box {
          background: #fff9e8;

          color: #956f22;
        }

        .rejected-box {
          background: #fff1f2;

          color: #b94d56;
        }

        .revoked-box {
          background: #f3f1f6;

          color: #706b78;
        }

        .approved-box strong,
        .pending-box strong,
        .rejected-box strong,
        .revoked-box strong {
          display: block;

          margin-bottom: 8px;

          font-size: 13px;
        }

        .approved-box p,
        .pending-box p,
        .rejected-box p,
        .revoked-box p {
          margin: 0;

          font-size: 12px;

          line-height: 1.6;
        }

        .course-button {
          width: 100%;

          margin-top: 18px;

          border: 0;

          border-radius: 12px;

          padding: 14px;

          background: #6c5ce7;

          color: white;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;
        }

        .rejected-box button {
          margin-top: 12px;

          border:
            1px solid
            #efcdd0;

          border-radius: 9px;

          padding:
            9px
            12px;

          background: white;

          color: #bd4e57;

          font-size: 11px;
          font-weight: 800;

          cursor: pointer;
        }

        .empty {
          padding:
            40px
            0;

          text-align: center;

          color: #9995a4;

          font-size: 13px;
        }

        @media (
          max-width: 900px
        ) {
          .content-grid {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 650px
        ) {
          .payment-page {
            padding:
              28px
              16px
              110px;
          }

          .heading h1 {
            font-size: 25px;
          }

          .form-card,
          .history-card {
            padding: 18px;
          }

          .request-card {
            padding: 18px;
          }

          .request-details {
            grid-template-columns:
              1fr;
          }

          .request-top {
            gap: 12px;
          }

          .course-title {
            font-size: 18px;
          }

          .status {
            font-size: 9px;

            padding:
              7px
              10px;
          }
        }
      `}</style>
    </div>
  )
}