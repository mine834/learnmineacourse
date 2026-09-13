'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [processingId, setProcessingId] = useState(null)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [selectedRequest, setSelectedRequest] = useState(null)

  const [error, setError] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    setError('')

    const {
      data,
      error,
    } = await supabase
      .from('payment_requests')
      .select(`
        *,
        profiles (
          id,
          email,
          full_name
        ),
        courses (
          id,
          title
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setRequests(data || [])

    setSelectedRequest((current) => {
      if (!current) return null

      const updated = (data || []).find(
        (item) => item.id === current.id
      )

      if (!updated) return null

      return {
        ...updated,
        signedProofUrl:
          current.signedProofUrl || null,
      }
    })

    setLoading(false)
  }

  async function openProof(request) {
  if (!request.proof_url) {
    alert('Баримтын файл байхгүй байна.')
    return
  }

  let filePath = request.proof_url

  // Хуучин record дээр бүтэн public URL хадгалагдсан бол
  // storage доторх жинхэнэ path-ийг салгаж авна.
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://')
  ) {
    try {
      const url = new URL(filePath)

      const marker =
        '/storage/v1/object/public/payment-proofs/'

      const signedMarker =
        '/storage/v1/object/sign/payment-proofs/'

      if (url.pathname.includes(marker)) {
        filePath = decodeURIComponent(
          url.pathname.split(marker)[1]
        )
      } else if (
        url.pathname.includes(signedMarker)
      ) {
        filePath = decodeURIComponent(
          url.pathname.split(signedMarker)[1]
        )
      } else {
        throw new Error(
          'Payment proof path олдсонгүй.'
        )
      }
    } catch (error) {
      alert(
        'Хуучин payment proof URL буруу байна.'
      )
      return
    }
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(
      filePath,
      60 * 10
    )

  if (error) {
    console.error(
      'SIGNED URL ERROR:',
      error
    )

    alert(error.message)
    return
  }

  setSelectedRequest({
    ...request,
    proof_url: filePath,
    signedProofUrl: data.signedUrl,
  })
}

  async function approveRequest(request) {
    const confirmed = window.confirm(
      `${request.profiles?.email || 'Student'} хэрэглэгчид "${request.courses?.title || 'Course'}" сургалтын эрх нээх үү?`
    )

    if (!confirmed) return

    setProcessingId(request.id)

    try {
      const {
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .upsert(
          {
            user_id: request.user_id,
            course_id: request.course_id,
          },
          {
            onConflict: 'user_id,course_id',
          }
        )

      if (enrollmentError) {
        throw enrollmentError
      }

      const {
        error: requestError,
      } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      if (requestError) {
        throw requestError
      }

      await loadRequests()

      alert('Payment approved. Course access нээгдлээ.')
    } catch (error) {
      alert(
        error?.message ||
          'Payment approve хийхэд алдаа гарлаа.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function rejectRequest(request) {
    const confirmed = window.confirm(
      'Энэ төлбөрийн хүсэлтийг reject хийх үү?'
    )

    if (!confirmed) return

    setProcessingId(request.id)

    try {
      const {
        error,
      } = await supabase
        .from('payment_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      if (error) {
        throw error
      }

      await loadRequests()

      alert('Payment request rejected.')
    } catch (error) {
      alert(
        error?.message ||
          'Payment reject хийхэд алдаа гарлаа.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = requests.filter(
    (item) => item.status === 'pending'
  ).length

  const approvedCount = requests.filter(
    (item) => item.status === 'approved'
  ).length

  const rejectedCount = requests.filter(
    (item) => item.status === 'rejected'
  ).length

  const filteredRequests = useMemo(() => {
    const keyword =
      search.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesFilter =
        filter === 'all' ||
        request.status === filter

      const studentName =
        request.profiles?.full_name || ''

      const email =
        request.profiles?.email || ''

      const courseTitle =
        request.courses?.title || ''

      const senderName =
        request.sender_name || ''

      const senderPhone =
        request.sender_phone || ''

      const matchesSearch =
        !keyword ||
        studentName
          .toLowerCase()
          .includes(keyword) ||
        email
          .toLowerCase()
          .includes(keyword) ||
        courseTitle
          .toLowerCase()
          .includes(keyword) ||
        senderName
          .toLowerCase()
          .includes(keyword) ||
        senderPhone
          .toLowerCase()
          .includes(keyword)

      return (
        matchesFilter &&
        matchesSearch
      )
    })
  }, [requests, filter, search])

  function formatDate(value) {
    if (!value) return '—'

    return new Date(value).toLocaleString()
  }

  function getStatusClass(status) {
    if (status === 'approved') {
      return 'approved'
    }

    if (status === 'rejected') {
      return 'rejected'
    }

    return 'pending'
  }

  if (loading) {
    return (
      <div className="admin-payment-loading">
        Payment requests ачаалж байна...
      </div>
    )
  }

  return (
    <>
      <div className="admin-payment-page">
        <div className="admin-payment-container">

          <header className="page-header">
            <div>
              <p className="eyebrow">
                PAYMENTS
              </p>

              <h1>
                Payment Requests
              </h1>

              <p className="subtitle">
                Төлбөрийн баримт шалгаж,
                сургалтын эрх нээнэ.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              className="refresh-button"
            >
              ↻ Refresh
            </button>
          </header>

          <section className="stats-grid">
            <div className="stat-card">
              <span>
                Нийт хүсэлт
              </span>

              <strong>
                {requests.length}
              </strong>
            </div>

            <div className="stat-card pending-stat">
              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>

            <div className="stat-card approved-stat">
              <span>
                Approved
              </span>

              <strong>
                {approvedCount}
              </strong>
            </div>

            <div className="stat-card rejected-stat">
              <span>
                Rejected
              </span>

              <strong>
                {rejectedCount}
              </strong>
            </div>
          </section>

          <section className="toolbar">
            <div className="filters">
              {[
                {
                  label: 'All',
                  value: 'all',
                },
                {
                  label: 'Pending',
                  value: 'pending',
                },
                {
                  label: 'Approved',
                  value: 'approved',
                },
                {
                  label: 'Rejected',
                  value: 'rejected',
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setFilter(item.value)
                  }
                  className={
                    filter === item.value
                      ? 'filter-button active'
                      : 'filter-button'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Нэр, email, утас, course хайх..."
              className="search-input"
            />
          </section>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {filteredRequests.length === 0 ? (
            <div className="empty-card">
              Payment request олдсонгүй.
            </div>
          ) : (
            <div className="requests-list">
              {filteredRequests.map(
                (request) => (
                  <article
                    key={request.id}
                    className="request-card"
                  >
                    <div className="request-main">
                      <div className="request-header">
                        <div className="student-block">
                          <div className="student-avatar">
                            {(
                              request.profiles?.full_name ||
                              request.profiles?.email ||
                              'S'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="student-info">
                            <div className="student-topline">
                              <h2>
                                {request.profiles?.full_name ||
                                  request.sender_name ||
                                  'Student'}
                              </h2>

                              <span
                                className={`status ${getStatusClass(
                                  request.status
                                )}`}
                              >
                                {request.status.toUpperCase()}
                              </span>
                            </div>

                            <p>
                              {request.profiles?.email ||
                                'Email байхгүй'}
                            </p>
                          </div>
                        </div>

                        <div className="amount">
                          ₮
                          {Number(
                            request.amount || 0
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div className="course-box">
                        <span>
                          COURSE
                        </span>

                        <strong>
                          {request.courses?.title ||
                            'Course'}
                        </strong>
                      </div>

                      <div className="info-grid">
                        <div>
                          <span>
                            Төлбөр хийсэн нэр
                          </span>

                          <strong>
                            {request.sender_name ||
                              '—'}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Утас
                          </span>

                          <strong>
                            {request.sender_phone ||
                              '—'}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment method
                          </span>

                          <strong>
                            {request.payment_method ||
                              '—'}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Илгээсэн
                          </span>

                          <strong>
                            {formatDate(
                              request.created_at
                            )}
                          </strong>
                        </div>
                      </div>

                      {request.note && (
                        <div className="note-box">
                          <span>
                            NOTE
                          </span>

                          <p>
                            {request.note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="request-footer">
                      <div className="footer-left">
                        {request.proof_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              openProof(request)
                            }
                            className="proof-button"
                          >
                            Баримт харах
                          </button>
                        ) : (
                          <span className="no-proof">
                            Баримт байхгүй
                          </span>
                        )}

                        {request.reviewed_at && (
                          <span className="reviewed">
                            Reviewed:{' '}
                            {formatDate(
                              request.reviewed_at
                            )}
                          </span>
                        )}
                      </div>

                      {request.status ===
                        'pending' && (
                        <div className="actions">
                          <button
                            type="button"
                            disabled={
                              processingId ===
                              request.id
                            }
                            onClick={() =>
                              rejectRequest(
                                request
                              )
                            }
                            className="reject-button"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={
                              processingId ===
                              request.id
                            }
                            onClick={() =>
                              approveRequest(
                                request
                              )
                            }
                            className="approve-button"
                          >
                            {processingId ===
                            request.id
                              ? 'Processing...'
                              : 'Approve + Access'}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedRequest(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p>
                  PAYMENT PROOF
                </p>

                <h2>
                  {selectedRequest.courses
                    ?.title || 'Course'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="close-button"
              >
                ×
              </button>
            </div>

            {selectedRequest.signedProofUrl ? (
              <div className="proof-wrapper">
                <img
                  src={
                    selectedRequest.signedProofUrl
                  }
                  alt="Payment proof"
                />
              </div>
            ) : (
              <div className="proof-error">
                Баримтын зураг нээж чадсангүй.
              </div>
            )}

            <div className="modal-info">
              <div>
                <span>
                  Нэр
                </span>

                <strong>
                  {selectedRequest.sender_name ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>
                  Утас
                </span>

                <strong>
                  {selectedRequest.sender_phone ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>
                  Дүн
                </span>

                <strong>
                  ₮
                  {Number(
                    selectedRequest.amount ||
                      0
                  ).toLocaleString()}
                </strong>
              </div>
            </div>

            {selectedRequest.signedProofUrl && (
              <a
                href={
                  selectedRequest.signedProofUrl
                }
                target="_blank"
                rel="noreferrer"
                className="open-original"
              >
                Original зураг нээх →
              </a>
            )}

            {selectedRequest.status ===
              'pending' && (
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    rejectRequest(
                      selectedRequest
                    )
                  }
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  className="reject-button"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() =>
                    approveRequest(
                      selectedRequest
                    )
                  }
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  className="approve-button"
                >
                  {processingId ===
                  selectedRequest.id
                    ? 'Processing...'
                    : 'Approve + Access'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-payment-page {
          min-height: 100%;
          background: #f8f7ff;
          padding: 40px 46px 80px;
        }

        .admin-payment-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .admin-payment-loading {
          min-height: calc(100vh - 82px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f7ff;
          color: #8d8995;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .eyebrow {
          margin: 0;
          color: #6c5ce7;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .page-header h1 {
          margin: 8px 0 6px;
          color: #292931;
          font-size: 38px;
          line-height: 1.15;
        }

        .subtitle {
          margin: 0;
          color: #8b8993;
          font-size: 14px;
        }

        .refresh-button {
          border: 1px solid #ded9ed;
          border-radius: 11px;
          padding: 10px 14px;
          background: #fff;
          color: #6c5ce7;
          font-weight: 800;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #ece8f7;
          border-radius: 16px;
          padding: 17px;
        }

        .stat-card span {
          display: block;
          margin-bottom: 7px;
          color: #9a97a2;
          font-size: 11px;
          font-weight: 800;
        }

        .stat-card strong {
          color: #34323b;
          font-size: 25px;
        }

        .pending-stat strong {
          color: #a46b00;
        }

        .approved-stat strong {
          color: #218647;
        }

        .rejected-stat strong {
          color: #b94f4f;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
          padding: 14px;
          background: #fff;
          border: 1px solid #ece8f7;
          border-radius: 16px;
        }

        .filters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .filter-button {
          border: none;
          border-radius: 999px;
          padding: 8px 12px;
          background: #f5f3f8;
          color: #77747f;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .filter-button.active {
          background: #6c5ce7;
          color: #fff;
        }

        .search-input {
          width: 320px;
          max-width: 100%;
          box-sizing: border-box;
          border: 1px solid #e2deeb;
          border-radius: 10px;
          padding: 10px 12px;
          outline: none;
          font-size: 13px;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .request-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #ece8f7;
          border-radius: 20px;
        }

        .request-main {
          padding: 22px;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .student-block {
          display: flex;
          gap: 13px;
          min-width: 0;
        }

        .student-avatar {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #f0ecff;
          color: #6c5ce7;
          font-size: 17px;
          font-weight: 900;
        }

        .student-info {
          min-width: 0;
        }

        .student-topline {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .student-topline h2 {
          margin: 0;
          color: #303038;
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .student-info p {
          margin: 5px 0 0;
          color: #9996a0;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .status {
          display: inline-flex;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 9px;
          font-weight: 900;
        }

        .status.pending {
          background: #fff6de;
          color: #a46b00;
        }

        .status.approved {
          background: #eaf8ee;
          color: #218647;
        }

        .status.rejected {
          background: #fff0f0;
          color: #b94f4f;
        }

        .amount {
          flex-shrink: 0;
          color: #6c5ce7;
          font-size: 20px;
          font-weight: 900;
        }

        .course-box {
          margin-top: 19px;
          padding: 13px 15px;
          background: #f7f5ff;
          border-radius: 12px;
        }

        .course-box span {
          display: block;
          margin-bottom: 4px;
          color: #9c98a6;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .course-box strong {
          color: #4a4656;
          font-size: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 13px;
        }

        .info-grid > div {
          min-width: 0;
          padding: 12px;
          background: #faf9fd;
          border-radius: 11px;
        }

        .info-grid span {
          display: block;
          margin-bottom: 5px;
          color: #a09eaa;
          font-size: 9px;
          font-weight: 800;
        }

        .info-grid strong {
          display: block;
          color: #55525e;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .note-box {
          margin-top: 13px;
          padding: 13px;
          border-radius: 11px;
          background: #fffaf0;
        }

        .note-box span {
          color: #a59c8c;
          font-size: 9px;
          font-weight: 900;
        }

        .note-box p {
          margin: 5px 0 0;
          color: #6f675c;
          font-size: 13px;
          line-height: 1.5;
        }

        .request-footer {
          padding: 14px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          background: #fcfbfe;
          border-top: 1px solid #f0edf7;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .proof-button {
          border: none;
          background: transparent;
          color: #6c5ce7;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .no-proof,
        .reviewed {
          color: #aaa7b0;
          font-size: 10px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .reject-button,
        .approve-button {
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .reject-button {
          border: 1px solid #f0d5d5;
          background: #fff6f6;
          color: #ba5050;
        }

        .approve-button {
          border: none;
          background: #6c5ce7;
          color: #fff;
        }

        .reject-button:disabled,
        .approve-button:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .empty-card,
        .error-box {
          padding: 30px;
          border-radius: 18px;
          text-align: center;
        }

        .empty-card {
          background: #fff;
          border: 1px solid #ece8f7;
          color: #9997a0;
        }

        .error-box {
          margin-bottom: 18px;
          background: #fff1f1;
          color: #b44c4c;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(23, 20, 34, 0.56);
        }

        .modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 22px;
          background: #fff;
          border-radius: 22px;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .modal-header p {
          margin: 0;
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .modal-header h2 {
          margin: 5px 0 0;
          color: #2f2d36;
          font-size: 20px;
        }

        .close-button {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border: none;
          border-radius: 10px;
          background: #f4f2f7;
          color: #76727e;
          font-size: 22px;
          cursor: pointer;
        }

        .proof-wrapper {
          width: 100%;
          max-height: 480px;
          overflow: auto;
          display: flex;
          justify-content: center;
          background: #f5f3f8;
          border-radius: 15px;
        }

        .proof-wrapper img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .proof-error {
          padding: 30px;
          border-radius: 15px;
          background: #fff1f1;
          color: #b44c4c;
          text-align: center;
        }

        .modal-info {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin-top: 14px;
        }

        .modal-info > div {
          padding: 11px;
          border-radius: 10px;
          background: #faf9fd;
        }

        .modal-info span {
          display: block;
          margin-bottom: 4px;
          color: #9e9ba5;
          font-size: 9px;
        }

        .modal-info strong {
          color: #4f4c56;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .open-original {
          display: inline-block;
          margin-top: 14px;
          color: #6c5ce7;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .admin-payment-page {
            padding: 30px 24px 60px;
          }

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }

          .info-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .admin-payment-page {
            padding:
              22px 14px
              calc(
                40px +
                env(safe-area-inset-bottom)
              );
          }

          .page-header {
            flex-direction: column;
          }

          .page-header h1 {
            font-size: 29px;
          }

          .refresh-button {
            width: 100%;
          }

          .stats-grid {
            gap: 8px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-card strong {
            font-size: 21px;
          }

          .toolbar {
            padding: 11px;
          }

          .filters {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
          }

          .filter-button {
            width: 100%;
          }

          .search-input {
            min-height: 44px;
            font-size: 16px;
          }

          .request-main {
            padding: 17px;
          }

          .request-header {
            flex-direction: column;
          }

          .amount {
            font-size: 18px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .request-footer {
            padding: 14px 17px;
            flex-direction: column;
            align-items: stretch;
          }

          .actions {
            width: 100%;
          }

          .actions button {
            flex: 1;
            min-height: 44px;
          }

          .proof-button {
            padding: 8px 0;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal {
            max-height: 95vh;
            padding: 17px;
            border-radius: 17px;
          }

          .modal-info {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }

          .modal-actions button {
            min-height: 46px;
          }
        }

        @media (max-width: 380px) {
          .admin-payment-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .student-block {
            align-items: flex-start;
          }

          .student-avatar {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }
        }
      `}</style>
    </>
  )
}