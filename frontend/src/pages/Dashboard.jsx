import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const StatCard = ({ icon, title, value, color }) => (
  <div style={{
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: 200,
    border: `2px solid ${color}33`,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
  </div>
)

const PatientRow = ({ patient }) => {
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

  const condition = patient.remarks?.possibleCondition || 'Normal'
  const riskColor = getRiskColor(condition)
  const riskLabel = getRiskLabel(condition)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr 0.8fr 1fr',
      gap: 16,
      padding: 12,
      borderBottom: '1px solid #e2e8f0',
      alignItems: 'center',
      ':hover': { background: '#f8fafc' }
    }}>
      <div style={{ fontWeight: 500 }}>{patient.name}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{patient.email}</div>
      <div style={{ fontSize: 13 }}>{patient.age ?? '-'} yrs</div>
      <div style={{
        display: 'inline-block',
        background: riskColor + '20',
        color: riskColor,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        width: 'fit-content'
      }}>
        {riskLabel}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    lowRisk: 0,
    todayCount: 0,
    recentPatients: []
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/patients?limit=100')
      const patients = res.data.data || res.data || []

      const today = new Date().toISOString().split('T')[0]
      const todayPatients = patients.filter(p => {
        const createdDate = new Date(p.createdAt).toISOString().split('T')[0]
        return createdDate === today
      })

      const highRisk = patients.filter(p =>
        p.remarks?.possibleCondition?.includes('High') || 
        p.remarks?.possibleCondition?.includes('Diabetes')
      ).length

      const lowRisk = patients.filter(p =>
        p.remarks?.possibleCondition?.includes('Low') ||
        p.remarks?.possibleCondition?.includes('Medium') ||
        p.remarks?.possibleCondition?.includes('Cholesterol')
      ).length

      setStats({
        total: patients.length,
        highRisk,
        lowRisk,
        todayCount: todayPatients.length,
        recentPatients: patients.slice(0, 5)
      })
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && stats.total === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 40 }}>
          <Spinner /> Loading dashboard...
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <Link to="/patients?filter=all" style={{ textDecoration: 'none' }}>
              <StatCard icon="👤" title="Total Patients" value={stats.total} color="#2563eb" />
            </Link>
            <Link to="/patients?filter=high" style={{ textDecoration: 'none' }}>
              <StatCard icon="⚠️" title="High Risk" value={stats.highRisk} color="#ef4444" />
            </Link>
            <Link to="/patients?filter=low" style={{ textDecoration: 'none' }}>
              <StatCard icon="✅" title="Low Risk" value={stats.lowRisk} color="#f59e0b" />
            </Link>
            <Link to="/patients?filter=today" style={{ textDecoration: 'none' }}>
              <StatCard icon="📅" title="Today's Patients" value={stats.todayCount} color="#10b981" />
            </Link>
          </div>

          <section>
            <h3 style={{ marginBottom: 16, color: '#1e293b' }}>Recent Patients</h3>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              {stats.recentPatients.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                  No patients yet. Start by adding a patient.
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr 0.8fr 1fr',
                    gap: 16,
                    padding: 16,
                    background: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#64748b'
                  }}>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Age</div>
                    <div>Status</div>
                  </div>
                  {stats.recentPatients.map(p => (
                    <PatientRow key={p._id || p.id} patient={p} />
                  ))}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
