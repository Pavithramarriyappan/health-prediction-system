import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import logo from '../assets/red-cross-logo.svg'

const Sidebar = () => {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, icon, label }) => (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 8,
        textDecoration: 'none',
        color: isActive(to) ? '#2563eb' : '#cbd5e1',
        background: isActive(to) ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
        transition: 'all 0.2s',
        fontWeight: 500,
        fontSize: 14,
        marginBottom: 8
      }}
      onMouseEnter={(e) => {
        if (!isActive(to)) {
          e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)'
          e.currentTarget.style.color = '#94a3b8'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive(to) ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
        e.currentTarget.style.color = isActive(to) ? '#2563eb' : '#cbd5e1'
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </Link>
  )

  return (
    <aside style={{
      width: 260,
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      color: '#fff',
      minHeight: '100vh',
      padding: 24,
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={logo} alt="Health Predict Logo" style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', padding: 4 }} />
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Health Predict</h2>
          <p style={{ fontSize: 11, color: '#bfdbfe', margin: '8px 0 0 0' }}>AI-Powered Health System</p>
        </div>
      </div>

      <nav>
        <NavLink to="/" icon="📊" label="Dashboard" />
        <NavLink to="/patients" icon="👥" label="Patient List" />
        <NavLink to="/add" icon="➕" label="Add Patient" />
      </nav>

      <div style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: 12,
        color: '#93c5fd'
      }}>
        <p style={{ margin: 0, marginBottom: 8 }}>📌 Version 1.0</p>
        <p style={{ margin: 0 }}>© 2026 Health Prediction System</p>
      </div>
    </aside>
  )
}

const Topbar = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header style={{
      background: '#fff',
      padding: '16px 24px',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{
        margin: 0,
        fontSize: 24,
        fontWeight: 700,
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        ⚕️ Health Prediction System
      </h1>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13,
          color: '#64748b'
        }}>
          <span>👤 {admin?.username || 'Admin'}</span>
          <span>•</span>
          <span>🌍 Online</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#ef4444',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fecaca'
            e.currentTarget.style.color = '#dc2626'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fee2e2'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          🔓 Logout
        </button>
      </div>
    </header>
  )
}

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, Arial' }}>
      <Sidebar />
      <div style={{ flex: 1, background: '#f8fbff', display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: 24, overflow: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
