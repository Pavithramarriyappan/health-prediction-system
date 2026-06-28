import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ color: '#64748b', marginBottom: 16 }}>Page not found.</p>
      <Link to="/">Go to Dashboard</Link>
    </div>
  )
}
