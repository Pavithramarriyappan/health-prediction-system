import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const getRiskColor = (condition) => {
  if (!condition) return '#10b981'
  if (condition.includes('High')) return '#ef4444'
  if (condition.includes('Low') || condition.includes('Medium')) return '#f59e0b'
  return '#10b981'
}

const getRiskLabel = (condition) => {
  if (!condition) return 'Healthy'
  if (condition.includes('High')) return 'High Risk'
  if (condition.includes('Low') || condition.includes('Medium')) return 'Medium Risk'
  return 'Healthy'
}

export default function PatientList() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [sendingAll, setSendingAll] = useState(false)
  const [sendingPatientId, setSendingPatientId] = useState(null)
  const [downloadingPatientId, setDownloadingPatientId] = useState(null)
  const itemsPerPage = 10

  const filterParam = new URLSearchParams(location.search).get('filter') || 'all'
  const getTitle = (filter) => {
    if (filter === 'high') return 'High Risk Patients'
    if (filter === 'low') return 'Low Risk Patients'
    if (filter === 'today') return "Today's Patients"
    return 'All Patients'
  }

  const applyDateFilter = (items) => {
    if (filterParam !== 'today') return items
    const today = new Date().toISOString().split('T')[0]
    return items.filter((item) => new Date(item.createdAt).toISOString().split('T')[0] === today)
  }

  const fetchPatients = async () => {
    try {
      setLoading(true)
      let endpoint = '/patients?limit=200'
      if (filterParam === 'high') endpoint = '/patients?risk=high&limit=200'
      else if (filterParam === 'low') endpoint = '/patients?risk=low&limit=200'

      const res = await api.get(endpoint)
      let data = res.data.data || res.data || []
      data = applyDateFilter(data)
      setPatients(data)
      setFilteredPatients(data)
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [location.search])

  useEffect(() => {
    let filtered = patients.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'risk') {
      filtered.sort((a, b) => {
        const aRisk = getRiskLabel(a.remarks?.possibleCondition || '')
        const bRisk = getRiskLabel(b.remarks?.possibleCondition || '')
        const riskOrder = { 'High Risk': 0, 'Medium Risk': 1, 'Healthy': 2 }
        return (riskOrder[aRisk] || 3) - (riskOrder[bRisk] || 3)
      })
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFilteredPatients(filtered)
    setCurrentPage(1)
  }, [searchTerm, sortBy, patients])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      await api.delete(`/patients/${id}`)
      setPatients(patients.filter(p => p._id !== id && p.id !== id))
      toast.success('Patient deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete patient')
    }
  }

  const handleSendEmailToPatient = async (id, name) => {
    setSendingPatientId(id)
    try {
      const res = await api.post('/email/send', { patientId: id })
      toast.success(res.data?.message || `Email sent to ${name}`)
    } catch (err) {
      console.error(err)
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || `Failed to send email to ${name}`
      toast.error(errorMessage)
    } finally {
      setSendingPatientId(null)
    }
  }

  const handleDownloadPatientReport = async (id, name) => {
    setDownloadingPatientId(id)
    try {
      if (!id) {
        throw new Error('Missing patient ID')
      }
      const response = await api.get(`/patients/${id}/report`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' }
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Health_Report_${name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Report download failed:', err)
      const message = err?.response?.data?.message || err?.message || 'Unable to download report'
      toast.error(message)
    } finally {
      setDownloadingPatientId(null)
    }
  }

  const handleSendEmailToAllHighRisk = async () => {
    setSendingAll(true)
    try {
      const res = await api.post('/email/send-high-risk')
      const success = res.data?.success || 0
      const failed = res.data?.failed || 0
      if (failed === 0) {
        toast.success(`Emails sent to ${success} high risk patients`)
      } else {
        const message = res.data?.message || `Emails sent to ${success} patients, ${failed} failed`
        toast.error(`${message}. ${failed} failures.`)
      }
    } catch (err) {
      console.error(err)
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to send emails to high risk patients'
      toast.error(errorMessage)
    } finally {
      setSendingAll(false)
    }
  }

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const title = getTitle(filterParam)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ marginTop: 6, color: '#64748b', fontSize: 14 }}>Total patients: {filteredPatients.length}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {filterParam === 'high' && (
            <button
              onClick={handleSendEmailToAllHighRisk}
              disabled={sendingAll}
              style={{
                background: '#ef4444',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: sendingAll ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => !sendingAll && (e.currentTarget.style.background = '#dc2626')}
              onMouseLeave={(e) => !sendingAll && (e.currentTarget.style.background = '#ef4444')}
            >
              {sendingAll ? 'Sending emails...' : 'Send Email to All High Risk Patients'}
            </button>
          )}
          <Link
            to="/add"
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            + Add Patient
          </Link>
        </div>
      </div>

      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Search by Name or Email</label>
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 6,
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                fontSize: 13
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 6,
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                fontSize: 13
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="risk">Risk Level</option>
              <option value="date">Recent First</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 40 }}>
            <Spinner /> Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
            No patients found. <Link to="/add" style={{ color: '#2563eb', textDecoration: 'underline' }}>Add a patient</Link>.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 0.8fr 1fr 0.6fr',
              gap: 12,
              padding: 16,
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              fontWeight: 600,
              fontSize: 12,
              color: '#64748b',
              textTransform: 'uppercase'
            }}>
              <div>Name</div>
              <div>Email</div>
              <div>Age</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {paginatedPatients.map((p) => {
              const condition = p.remarks?.possibleCondition || 'Normal'
              const riskColor = getRiskColor(condition)
              const riskLabel = getRiskLabel(condition)
              const pid = p._id || p.id

              return (
                <div
                  key={pid}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.5fr 0.8fr 1fr 0.6fr',
                    gap: 12,
                    padding: 12,
                    borderBottom: '1px solid #e2e8f0',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                    ':hover': { background: '#f8fafc' }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{p.email}</div>
                  <div style={{ fontSize: 12 }}>{p.age ?? '-'} yrs</div>
                  <div style={{
                    display: 'inline-flex',
                    background: riskColor + '20',
                    color: riskColor,
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: 11,
                    fontWeight: 600,
                    width: 'fit-content'
                  }}>
                    {riskLabel}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link
                      to={`/patients/${pid}/edit`}
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(pid, p.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleDownloadPatientReport(pid, p.name)}
                      disabled={downloadingPatientId === pid}
                      style={{
                        background: downloadingPatientId === pid ? '#e2e8f0' : '#22c55e',
                        color: downloadingPatientId === pid ? '#475569' : '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 10px',
                        cursor: downloadingPatientId === pid ? 'not-allowed' : 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => downloadingPatientId !== pid && (e.currentTarget.style.background = '#16a34a')}
                      onMouseLeave={(e) => downloadingPatientId !== pid && (e.currentTarget.style.background = '#22c55e')}
                    >
                      {downloadingPatientId === pid ? 'Downloading...' : 'Download'}
                    </button>
                    {riskLabel === 'High Risk' && (
                      <button
                        onClick={() => handleSendEmailToPatient(pid, p.name)}
                        disabled={sendingPatientId === pid}
                        style={{
                          background: sendingPatientId === pid ? '#e2e8f0' : '#f97316',
                          color: sendingPatientId === pid ? '#475569' : '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 10px',
                          cursor: sendingPatientId === pid ? 'not-allowed' : 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => sendingPatientId !== pid && (e.currentTarget.style.background = '#ea580c')}
                        onMouseLeave={(e) => sendingPatientId !== pid && (e.currentTarget.style.background = '#f97316')}
                      >
                        {sendingPatientId === pid ? 'Sending...' : 'Send Email'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    fontSize: 12
                  }}
                >
                  Previous
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        padding: '6px 10px',
                        border: currentPage === p ? 'none' : '1px solid #e2e8f0',
                        background: currentPage === p ? '#2563eb' : 'transparent',
                        color: currentPage === p ? '#fff' : '#64748b',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: currentPage === p ? 600 : 400
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    fontSize: 12
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
