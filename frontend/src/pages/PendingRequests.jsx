import React, { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleString()
}

const RequestRow = ({ request, onApprove, onReject }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.4fr 1fr 1fr 1fr', gap: 12, padding: '16px 12px', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
    <div>
      <div style={{ fontWeight: 600 }}>{request.fullName || request.username}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{request.requestType}</div>
    </div>
    <div style={{ fontSize: 13, color: '#334155' }}>{request.email}<br />{request.mobile || '—'}</div>
    <div style={{ fontSize: 13, color: '#334155' }}>{request.role || '—'}</div>
    <div style={{ fontSize: 13, color: '#334155' }}>{formatDateTime(request.createdAt)}</div>
    <div>
      <button
        onClick={() => onApprove(request)}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600
        }}
      >
        Approve
      </button>
    </div>
    <div>
      <button
        onClick={() => onReject(request)}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #f87171',
          background: '#fee2e2',
          color: '#b91c1c',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600
        }}
      >
        Reject
      </button>
    </div>
  </div>
)

export default function PendingRequests() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/pending-requests')
      setRequests(response.data.requests || [])
    } catch (error) {
      console.error('Pending requests error:', error)
      toast.error('Unable to load pending requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (request) => {
    try {
      const endpoint = request.requestType === 'PasswordReset'
        ? `/pending-requests/${request._id}/approve-password-reset`
        : `/pending-requests/${request._id}/approve-account`

      const response = await api.post(endpoint)
      if (response.data.success) {
        toast.success(response.data.message || 'Request approved')
        fetchRequests()
      } else {
        toast.error(response.data.message || 'Approval failed')
      }
    } catch (error) {
      console.error('Approve request error:', error)
      const message = error.response?.data?.message || 'Approval failed'
      toast.error(message)
    }
  }

  const handleReject = async (request) => {
    try {
      const response = await api.post(`/pending-requests/${request._id}/reject`)
      if (response.data.success) {
        toast.success(response.data.message || 'Request rejected')
        fetchRequests()
      } else {
        toast.error(response.data.message || 'Reject failed')
      }
    } catch (error) {
      console.error('Reject request error:', error)
      const message = error.response?.data?.message || 'Reject failed'
      toast.error(message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Pending Requests</h2>
          <p style={{ margin: '8px 0 0', color: '#64748b' }}>
            Approve or reject account creation and password reset requests.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ marginBottom: 16, color: '#475569', fontSize: 14 }}>
        Only Super Admin users can approve or reject incoming requests. If you do not have permission, the server will deny the action.
      </div>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.4fr 1fr 1fr 1fr', gap: 12, padding: '18px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, color: '#475569' }}>
          <div>Request</div>
          <div>Contact</div>
          <div>Role</div>
          <div>Requested</div>
          <div></div>
          <div></div>
        </div>

        {loading ? (
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
            No pending requests at the moment.
          </div>
        ) : (
          requests.map((request) => (
            <RequestRow
              key={request._id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  )
}
