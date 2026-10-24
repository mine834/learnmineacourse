
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const TABS = [
  { id: 'pending', label: 'Хүлээгдэж буй' },
  { id: 'approved', label: 'Баталгаажсан' },
  { id: 'rejected', label: 'Татгалзсан' },
]

function formatPrice(value) {
  return `${new Intl.NumberFormat('en-US').format(Number(value || 0))}₮`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('mn-MN')
}

export default function AdminPaymentsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')

  const [requests, setRequests] = useState([])
  const [courses, setCourses] = useState([])
  const [profiles, setProfiles] = useState([])

  const loadPage = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true)
      else setRefreshing(true)

      setError('')

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin')

      if (adminError) throw adminError

      if (isAdmin !== true) {
        router.replace('/dashboard')
        return
      }

      const [requestResult, courseResult, profileResult] =
        await Promise.all([
          supabase
            .from('payment_requests')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('courses')
            .select('id, title'),

          supabase
            .from('profiles')
            .select('id, email, full_name'),
        ])

      if (requestResult.error) throw requestResult.error
      if (courseResult.error) throw courseResult.error
      if (profileResult.error) throw profileResult.error

      setRequests(requestResult.data || [])
      setCourses(courseResult.data || [])
      setProfiles(profileResult.data || [])
    } catch (err) {
      console.error('Admin payments error:', err)
      setError(
        err?.message || 'Төлбөрийн мэдээлэл ачаалж чадсангүй.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    loadPage(true)
  }, [loadPage])

  const counts = useMemo(() => ({
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests])

  const visibleRequests = useMemo(
    () => requests.filter(r => r.status === tab),
    [requests, tab]
  )

  const courseMap = useMemo(
    () => new Map(courses.map(c => [c.id, c])),
    [courses]
  )

  const profileMap = useMemo(
    () => new Map(profiles.map(p => [p.id, p])),
    [profiles]
  )

  async function processRequest(request, action) {
    if (processingId) return

    const approving = action === 'approve'
    const actionLabel = approving ? 'батлах' : 'татгалзах'

    const confirmed = window.confirm(
      `Энэ төлбөрийн хүсэлтийг ${actionLabel} уу?`
    )

    if (!confirmed) return

    try {
      setProcessingId(request.id)
      setError('')

      // Үйлдэл хийхээс өмнө Admin эрхийг дахин шалгана.
      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin')

      if (adminError) throw adminError

      if (isAdmin !== true) {
        throw new Error('Admin эрх байхгүй байна.')
      }

      // Хүсэлт pending хэвээр эсэхийг шалгана.
      const { data: current, error: requestError } =
        await supabase
          .from('payment_requests')
          .select('id, status')
          .eq('id', request.id)
          .single()

      if (requestError) throw requestError

      if (current.status !== 'pending') {
        throw new Error(
          'Энэ хүсэлт аль хэдийн шийдвэрлэгдсэн байна.'
        )
      }

      const functionName = approving
        ? 'approve_payment_request'
        : 'reject_payment_request'

      const { data, error: rpcError } =
        await supabase.rpc(functionName, {
          target_request_id: request.id,
        })

      if (rpcError) throw rpcError

      // RPC jsonb үр дүнд алдаа буцаасан эсэхийг шалгана.
      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        (data.success === false || data.error)
      ) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Төлбөрийн хүсэлтийг шийдвэрлэж чадсангүй.'
        )
      }

      // Бодит төлөвийг дахин уншиж баталгаажуулна.
      const { data: updated, error: verifyError } =
        await supabase
          .from('payment_requests')
          .select('status')
          .eq('id', request.id)
          .single()

      if (verifyError) throw verifyError

      const expectedStatus = approving ? 'approved' : 'rejected'

      if (updated.status !== expectedStatus) {
        throw new Error(
          'RPC ажилласан боловч төлбөрийн төлөв баталгаажаагүй байна.'
        )
      }

      await loadPage(false)

      setTab(expectedStatus)

      alert(
        approving
          ? 'Төлбөр баталгаажлаа. Сургалтын эрх олгогдсон эсэхийг Enrollments хэсэгт шалгана уу.'
          : 'Төлбөрийн хүсэлтээс татгалзлаа.'
      )
    } catch (err) {
      console.error('Process payment error:', err)

      alert(
        err?.message ||
          'Төлбөрийн хүсэлтийг шийдвэрлэхэд алдаа гарлаа.'
      )

      await loadPage(false)
    } finally {
      setProcessingId(null)
    }
  }

  async function openProof(path) {
    try {
      const { data, error: proofError } =
        await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(path, 300)

      if (proofError) throw proofError

      if (!data?.signedUrl) {
        throw new Error('Баримтын холбоос үүссэнгүй.')
      }

      window.open(
        data.signedUrl,
        '_blank',
        'noopener,noreferrer'
      )
    } catch (err) {
      alert(err?.message || 'Баримтыг нээж чадсангүй.')
    }
  }

  if (loading) {
    return (
      <main className="admin-payments">
        <p>Төлбөрийн хүсэлтүүд ачаалж байна...</p>
      </main>
    )
  }

  return (
    <main className="admin-payments">
      <div className="page-header">
        <div>
          <div className="eyebrow">ADMIN / PAYMENTS</div>
          <h1>Төлбөрийн удирдлага</h1>
          <p>Сурагчдын төлбөрийн хүсэлтүүдийг хянах хэсэг.</p>
        </div>

        <button
          className="refresh"
          disabled={refreshing || Boolean(processingId)}
          onClick={() => loadPage(false)}
        >
          {refreshing ? 'Шинэчилж байна...' : '↻ Шинэчлэх'}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Алдаа гарлаа</strong>
          <p>{error}</p>
          <button onClick={() => loadPage(false)}>
            Дахин оролдох
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="summary">
            {TABS.map(item => (
              <button
                key={item.id}
                className={`summary-card ${tab === item.id ? 'selected' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <span>{item.label}</span>
                <strong>{counts[item.id]}</strong>
              </button>
            ))}
          </div>

          <div className="tabs">
            {TABS.map(item => (
              <button
                key={item.id}
                className={tab === item.id ? 'active' : ''}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                <span>{counts[item.id]}</span>
              </button>
            ))}
          </div>

          {visibleRequests.length === 0 ? (
            <div className="empty">
              Энэ ангилалд төлбөрийн хүсэлт алга.
            </div>
          ) : (
            <div className="request-list">
              {visibleRequests.map(request => {
                const course = courseMap.get(request.course_id)
                const student = profileMap.get(request.user_id)
                const isProcessing = processingId === request.id

                return (
                  <article className="request-card" key={request.id}>
                    <div className="request-top">
                      <div>
                        <div className="eyebrow">
                          PAYMENT REQUEST
                        </div>
                        <h2>{course?.title || 'Сургалт'}</h2>
                      </div>

                      <span className={`badge ${request.status}`}>
                        {request.status === 'pending'
                          ? 'Хүлээгдэж буй'
                          : request.status === 'approved'
                            ? 'Баталгаажсан'
                            : 'Татгалзсан'}
                      </span>
                    </div>

                    <div className="details">
                      <div>
                        <span>Сурагч</span>
                        <strong>
                          {student?.full_name ||
                            student?.email ||
                            request.user_id}
                        </strong>
                      </div>

                      <div>
                        <span>Имэйл</span>
                        <strong>{student?.email || '—'}</strong>
                      </div>

                      <div>
                        <span>Шилжүүлсэн нэр</span>
                        <strong>{request.sender_name || '—'}</strong>
                      </div>

                      <div>
                        <span>Утас</span>
                        <strong>{request.sender_phone || '—'}</strong>
                      </div>

                      <div>
                        <span>Дүн</span>
                        <strong>{formatPrice(request.amount)}</strong>
                      </div>

                      <div>
                        <span>Огноо</span>
                        <strong>{formatDate(request.created_at)}</strong>
                      </div>
                    </div>

                    {request.note && (
                      <div className="note">
                        <strong>Тэмдэглэл</strong>
                        <p>{request.note}</p>
                      </div>
                    )}

                    {request.proof_path && (
                      <button
                        className="proof-button"
                        onClick={() => openProof(request.proof_path)}
                      >
                        Баримт харах ↗
                      </button>
                    )}

                    {request.status === 'pending' && (
                      <div className="actions">
                        <button
                          className="approve-button"
                          disabled={Boolean(processingId)}
                          onClick={() => processRequest(request, 'approve')}
                        >
                          {isProcessing
                            ? 'Боловсруулж байна...'
                            : '✓ Батлах'}
                        </button>

                        <button
                          className="reject-button"
                          disabled={Boolean(processingId)}
                          onClick={() => processRequest(request, 'reject')}
                        >
                          {isProcessing
                            ? 'Боловсруулж байна...'
                            : '✕ Татгалзах'}
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .admin-payments {
          width: 100%;
          max-width: 1200px;
          padding: 38px 32px 100px;
          color: #302a42;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #0879D1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        h1 {
          margin: 10px 0;
          font-size: 32px;
          letter-spacing: -.04em;
        }

        .page-header p {
          color: #928b9f;
          font-size: 14px;
        }

        button {
          font: inherit;
          cursor: pointer;
        }

        .refresh {
          border: 1px solid #ded9ed;
          background: white;
          color: #0879D1;
          border-radius: 11px;
          padding: 12px 18px;
          font-size: 12px;
          font-weight: 800;
        }

        button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 28px;
        }

        .summary-card {
          border: 1px solid #e7e2f2;
          border-radius: 18px;
          background: white;
          padding: 23px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .summary-card.selected {
          border-color: #0879D1;
          background: #f8f6ff;
        }

        .summary-card span {
          color: #938ba2;
          font-size: 13px;
          font-weight: 700;
        }

        .summary-card strong {
          color: #302a42;
          font-size: 30px;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-bottom: 1px solid #e9e5f2;
          margin-bottom: 24px;
        }

        .tabs button {
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          border-bottom: 3px solid transparent;
          background: transparent;
          padding: 14px 17px;
          color: #918a9e;
          font-size: 13px;
          font-weight: 800;
        }

        .tabs button.active {
          border-bottom-color: #0879D1;
          color: #0879D1;
        }

        .tabs span {
          background: #f0edff;
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
        }

        .request-list {
          display: grid;
          gap: 18px;
        }

        .request-card {
          border: 1px solid #e8e3f2;
          border-radius: 20px;
          background: white;
          padding: 27px;
        }

        .request-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 25px;
        }

        h2 {
          font-size: 21px;
          margin: 9px 0 0;
        }

        .badge {
          border-radius: 99px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .badge.pending {
          background: #fff6de;
          color: #a87718;
        }

        .badge.approved {
          background: #e6f7ec;
          color: #287e4c;
        }

        .badge.rejected {
          background: #fff0f1;
          color: #bc4e58;
        }

        .details {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .details > div {
          min-width: 0;
          padding: 16px;
          background: #faf9fd;
          border-radius: 12px;
        }

        .details span {
          display: block;
          margin-bottom: 9px;
          color: #9c96a6;
          font-size: 11px;
        }

        .details strong {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .note {
          background: #f8f6ff;
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
        }

        .note strong {
          font-size: 12px;
        }

        .note p {
          margin-bottom: 0;
          color: #817991;
          font-size: 13px;
          line-height: 1.6;
        }

        .proof-button {
          margin-top: 18px;
          border: 1px solid #ded8f4;
          background: white;
          color: #0879D1;
          border-radius: 11px;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 800;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #eeeaf4;
        }

        .approve-button,
        .reject-button {
          border-radius: 11px;
          padding: 13px 20px;
          font-size: 12px;
          font-weight: 800;
        }

        .approve-button {
          border: none;
          background: #0879D1;
          color: white;
        }

        .reject-button {
          border: 1px solid #f0cdd2;
          background: #fff4f5;
          color: #b94d56;
        }

        .empty {
          padding: 55px 20px;
          background: white;
          border: 1px solid #e8e3f2;
          border-radius: 18px;
          text-align: center;
          color: #928b9f;
          font-size: 14px;
        }

        .error {
          padding: 20px;
          border-radius: 14px;
          background: #fff0f1;
          color: #b34b54;
        }

        .error button {
          padding: 9px 14px;
          border: 0;
          border-radius: 8px;
        }

        @media (max-width: 800px) {
          .summary,
          .details {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .admin-payments {
            padding: 25px 16px 80px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .summary,
          .details {
            grid-template-columns: 1fr;
          }

          .request-card {
            padding: 19px;
          }

          .actions {
            flex-direction: column;
          }

          h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  )
}
