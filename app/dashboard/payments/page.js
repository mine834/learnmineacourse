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
  const [requests, setRequests] = useState([])
  const [activeCourseIds, setActiveCourseIds] = useState([])

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [note, setNote] = useState('')
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    loadPage()

    const handleFocus = () => {
      loadPage(false)
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  async function loadPage(showLoading = true) {
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

      const currentUser = session.user

      setUser(currentUser)

      /*
        IMPORTANT:
        Enrollment-ийг яг одоо database-аас дахин уншина.
      */

      const [
        profileResult,
        coursesResult,
        enrollmentsResult,
        requestsResult,
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
          .select('id, user_id, course_id')
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

      if (coursesResult.error) {
        throw coursesResult.error
      }

      if (enrollmentsResult.error) {
        throw enrollmentsResult.error
      }

      if (requestsResult.error) {
        throw requestsResult.error
      }

      const liveEnrollments =
        enrollmentsResult.data || []

      /*
        Live access set.
        ЭНЭ нь payment status биш,
        бодит enrollment database row.
      */

      const liveCourseAccessSet =
        new Set(
          liveEnrollments.map(
            (item) => item.course_id
          )
        )

      const rawRequests =
        requestsResult.data || []

      /*
        Request бүр дээр тухайн мөчийн
        REAL COURSE ACCESS суулгана.
      */

      const requestsWithLiveAccess =
        rawRequests.map((request) => ({
          ...request,

          hasCourseAccess:
            liveCourseAccessSet.has(
              request.course_id
            ),
        }))

      setProfile(profileResult.data || null)
      setCourses(coursesResult.data || [])

      setActiveCourseIds(
        [...liveCourseAccessSet]
      )

      setRequests(
        requestsWithLiveAccess
      )

      if (
        profileResult.data?.full_name &&
        !senderName
      ) {
        setSenderName(
          profileResult.data.full_name
        )
      }
    } catch (error) {
      console.error(
        'Load payment page error:',
        error
      )

      alert(
        error?.message ||
          'Payment мэдээлэл ачааллахад алдаа гарлаа.'
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // ==========================================
  // LIVE ACCESS
  // ==========================================

  const activeCourseSet = useMemo(() => {
    return new Set(activeCourseIds)
  }, [activeCourseIds])

  const pendingCourseSet = useMemo(() => {
    return new Set(
      requests
        .filter(
          (request) =>
            request.status === 'pending'
        )
        .map(
          (request) =>
            request.course_id
        )
    )
  }, [requests])

  // ==========================================
  // AVAILABLE COURSES
  // ==========================================

  const availableCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        !activeCourseSet.has(
          course.id
        ) &&
        !pendingCourseSet.has(
          course.id
        )
    )
  }, [
    courses,
    activeCourseSet,
    pendingCourseSet,
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
  // EFFECTIVE STATUS
  // ==========================================

  function getEffectiveStatus(request) {
    /*
      Payment approved байсан ч
      enrollment row байхгүй бол
      ACCESS REVOKED.
    */

    if (
      request.status === 'approved' &&
      request.hasCourseAccess !== true
    ) {
      return 'revoked'
    }

    return request.status
  }

  function getStatusBadge(request) {
    const status =
      getEffectiveStatus(request)

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

  function getStatusText(request) {
    const status =
      getEffectiveStatus(request)

    if (status === 'approved') {
      return 'Төлбөр баталгаажсан'
    }

    if (status === 'rejected') {
      return 'Хүсэлт татгалзсан'
    }

    if (status === 'revoked') {
      return 'Сургалтын эрх цуцлагдсан'
    }

    return 'Шалгаж байна'
  }

  // ==========================================
  // HELPERS
  // ==========================================

  function getCourseTitle(courseId) {
    return (
      courses.find(
        (course) =>
          course.id === courseId
      )?.title ||
      'Сургалт'
    )
  }

  function formatPrice(value) {
    return (
      '₮' +
      new Intl.NumberFormat(
        'en-US'
      ).format(
        Number(value || 0)
      )
    )
  }

  function formatDate(value) {
    if (!value) {
      return '—'
    }

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

  // ==========================================
  // FORM
  // ==========================================

  function resetForm() {
    setSelectedCourseId('')
    setSenderPhone('')
    setNote('')
    setProofFile(null)

    setSenderName(
      profile?.full_name || ''
    )

    const input =
      document.getElementById(
        'payment-proof-input'
      )

    if (input) {
      input.value = ''
    }
  }

  async function uploadProof(courseId) {
    if (!proofFile) {
      return ''
    }

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

    const {
      error,
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

    if (error) {
      throw error
    }

    return filePath
  }

  async function submitPayment(event) {
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

      /*
        Илгээхийн өмнө access-ийг
        дахин live refresh хийнэ.
      */

      const {
        data: enrollmentCheck,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq(
          'course_id',
          selectedCourseId
        )

      if (enrollmentError) {
        throw enrollmentError
      }

      if (
        (enrollmentCheck || [])
          .length > 0
      ) {
        alert(
          'Энэ сургалтын эрх аль хэдийн нээгдсэн байна.'
        )

        await loadPage(false)
        return
      }

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
        'Payment request created:',
        data
      )

      alert(
        'Төлбөрийн хүсэлт амжилттай илгээгдлээ.'
      )

      resetForm()

      await loadPage(false)
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

  // ==========================================
  // RETRY REJECTED
  // ==========================================

  function retryRejected(request) {
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
      request.sender_phone || ''
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
        Төлбөрийн мэдээлэл ачааллаж байна...

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
      <div className="heading-row">
        <div className="heading">
          <div className="eyebrow">
            PAYMENT
          </div>

          <h1>
            Сургалтын төлбөр
          </h1>

          <p>
            Төлбөрөө шилжүүлсний дараа
            баримтаа илгээж, admin
            баталгаажуулсны дараа
            сургалтын эрх нээгдэнэ.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() =>
            loadPage(false)
          }
        >
          ↻ Шинэчлэх
        </button>
      </div>

      <div className="content-grid">
        {/* FORM */}

        <section className="form-card">
          <div className="section-label">
            NEW REQUEST
          </div>

          <h2>
            Төлбөрийн хүсэлт илгээх
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
                  event.target.value
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
                    {' — '}
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
                Одоогоор шинэ хүсэлт
                илгээх боломжтой сургалт
                байхгүй байна.
              </div>
            )}

            {selectedCourse && (
              <div className="selected-course">
                <div>
                  <span>
                    Сонгосон сургалт
                  </span>

                  <strong>
                    {
                      selectedCourse.title
                    }
                  </strong>
                </div>

                <b>
                  {formatPrice(
                    selectedCourse.price
                  )}
                </b>
              </div>
            )}

            <label>
              Шилжүүлсэн хүний нэр
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
                  event.target.value
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
                  event.target.value
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
                {
                  proofFile.name
                }
              </div>
            )}

            <label>
              Тэмдэглэл
            </label>

            <textarea
              rows={4}
              value={note}
              onChange={(
                event
              ) =>
                setNote(
                  event.target.value
                )
              }
              placeholder="Нэмэлт мэдээлэл байвал..."
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
              request байхгүй байна.
            </div>
          ) : (
            <div className="request-list">
              {requests.map(
                (request) => {
                  const status =
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
                          className={`status ${status}`}
                        >
                          {getStatusBadge(
                            request
                          )}
                        </span>
                      </div>

                      <div className="details-grid">
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

                      {status ===
                        'pending' && (
                        <div className="message-box pending-box">
                          <strong>
                            Төлбөр шалгаж байна
                          </strong>

                          <p>
                            Таны төлбөрийн хүсэлтийг
                            admin шалгаж байна.
                          </p>
                        </div>
                      )}

                      {/* APPROVED */}

                      {status ===
                        'approved' && (
                        <>
                          <div className="message-box approved-box">
                            <strong>
                              Төлбөр баталгаажсан
                            </strong>

                            <p>
                              Таны сургалтын эрх
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
                            Сургалт руу орох →
                          </button>
                        </>
                      )}

                      {/* REVOKED */}

                      {status ===
                        'revoked' && (
                        <div className="message-box revoked-box">
                          <strong>
                            Сургалтын эрх цуцлагдсан
                          </strong>

                          <p>
                            Төлбөр өмнө нь
                            баталгаажсан боловч энэ
                            сургалтын access одоогоор
                            идэвхгүй байна.
                          </p>
                        </div>
                      )}

                      {/* REJECTED */}

                      {status ===
                        'rejected' && (
                        <div className="message-box rejected-box">
                          <strong>
                            Хүсэлт татгалзсан
                          </strong>

                          <p>
                            Төлбөрийн мэдээллээ
                            шалгаад дахин хүсэлт
                            илгээнэ үү.
                          </p>

                          <button
                            type="button"
                            className="retry-button"
                            onClick={() =>
                              retryRejected(
                                request
                              )
                            }
                          >
                            Дахин хүсэлт илгээх
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

        .heading-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

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

          color: #9793a0;

          font-size: 14px;

          line-height: 1.7;
        }

        .refresh-button {
          border:
            1px solid
            #ddd7f6;

          border-radius: 11px;

          padding:
            10px
            14px;

          background: #ffffff;

          color: #6c5ce7;

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;
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
          padding: 24px;

          border:
            1px solid
            #e9e5f2;

          border-radius: 20px;

          background: #ffffff;
        }

        h2 {
          margin:
            8px
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

          color: #5e5a68;

          font-size: 12px;
          font-weight: 800;
        }

        input,
        select,
        textarea {
          width: 100%;

          padding:
            12px
            13px;

          border:
            1px solid
            #e2deeb;

          border-radius: 11px;

          outline: none;

          background: #fbfaff;

          color: #37343e;

          font: inherit;
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

          gap: 15px;

          margin-top: 12px;

          padding: 14px;

          border-radius: 12px;

          background: #f6f4ff;
        }

        .selected-course span {
          display: block;

          margin-bottom: 4px;

          color: #9994a4;

          font-size: 10px;
        }

        .selected-course strong {
          font-size: 13px;
        }

        .selected-course b {
          color: #6c5ce7;

          font-size: 14px;
        }

        .file-name {
          margin-top: 7px;

          color: #6c5ce7;

          font-size: 11px;
        }

        .info-box {
          margin-top: 12px;

          padding: 12px;

          border-radius: 10px;

          background: #f8f6fc;

          color: #8e8998;

          font-size: 12px;

          line-height: 1.6;
        }

        .submit-button {
          margin-top: 20px;

          padding:
            13px
            16px;

          border: 0;
          border-radius: 11px;

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
          padding: 24px;

          border:
            1px solid
            #e5e1ec;

          border-radius: 18px;

          background: #ffffff;
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

          white-space: nowrap;

          font-size: 10px;
          font-weight: 800;
        }

        .status.pending {
          background: #fff6df;
          color: #ad7618;
        }

        .status.approved {
          background: #e7f7ed;
          color: #287e4b;
        }

        .status.rejected {
          background: #fdebec;
          color: #cc535c;
        }

        .status.revoked {
          background: #f0edf4;
          color: #706a77;
        }

        .details-grid {
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

          border-radius: 15px;

          background: #faf9fd;
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
          color: #57535e;

          font-size: 13px;
        }

        .message-box {
          padding:
            18px
            20px;

          border-radius: 15px;
        }

        .message-box strong {
          display: block;

          margin-bottom: 8px;

          font-size: 13px;
        }

        .message-box p {
          margin: 0;

          font-size: 12px;

          line-height: 1.65;
        }

        .pending-box {
          background: #fff8e6;
          color: #916a1d;
        }

        .approved-box {
          background: #eaf8ef;
          color: #2e7d4c;
        }

        .rejected-box {
          background: #fdeced;
          color: #b74e56;
        }

        .revoked-box {
          background: #f2eff5;
          color: #6c6674;
        }

        .course-button {
          width: 100%;

          margin-top: 18px;

          padding: 14px;

          border: 0;
          border-radius: 12px;

          background: #6c5ce7;

          color: #ffffff;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;
        }

        .retry-button {
          margin-top: 12px;

          padding:
            9px
            12px;

          border:
            1px solid
            #ecc9cc;

          border-radius: 9px;

          background: #ffffff;

          color: #b84e57;

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

          .heading-row {
            flex-direction: column;
          }

          .heading h1 {
            font-size: 25px;
          }

          .form-card,
          .history-card,
          .request-card {
            padding: 18px;
          }

          .details-grid {
            grid-template-columns:
              1fr;
          }

          .request-top {
            gap: 12px;
          }

          .course-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}