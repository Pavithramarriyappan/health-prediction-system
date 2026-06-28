import React, { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

export default function AddPatient() {
  const [form, setForm] = useState({ name: '', dob: '', email: '', mobile: '', gender: '', glucose: '', haemoglobin: '', cholesterol: '' })
  const [loading, setLoading] = useState(false)
  const [predictResult, setPredictResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleReset = () => {
    setForm({ name: '', dob: '', email: '', mobile: '', gender: '', glucose: '', haemoglobin: '', cholesterol: '' })
    setPredictResult(null)
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Please enter patient name')
      return false
    }
    if (!form.dob) {
      toast.error('Please enter date of birth')
      return false
    }
    if (!form.email.trim()) {
      toast.error('Please enter email')
      return false
    }
    if (!form.mobile.trim()) {
      toast.error('Please enter mobile number')
      return false
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      toast.error('Mobile number must be exactly 10 digits')
      return false
    }
    if (!form.glucose || !form.haemoglobin || !form.cholesterol) {
      toast.error('Please fill in all health metrics (Glucose, Haemoglobin, Cholesterol)')
      return false
    }
    return true
  }

  const handlePredict = async () => {
    if (!form.glucose || !form.haemoglobin || !form.cholesterol) {
      toast.error('Please fill in all health metrics (Glucose, Haemoglobin, Cholesterol)')
      return
    }

    if (!form.email.trim()) {
      toast.error('Please enter patient email to send prediction')
      return
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      const payload = {
        glucose: Number(form.glucose),
        haemoglobin: Number(form.haemoglobin),
        cholesterol: Number(form.cholesterol),
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        gender: form.gender || undefined
      }
      const res = await api.post('/predict', payload)
      setPredictResult(res.data.remarks || res.data)
      if (res.data?.message) {
        toast.success(res.data.message)
      } else {
        toast.success('Health prediction generated')
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadReportFile = async (patientId, patientName) => {
    try {
      if (!patientId) {
        throw new Error('Missing patient ID')
      }

      const response = await api.get(`/patients/${patientId}/report`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' }
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Health_Report_${patientName.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Report download failed:', err)
      const message = err?.response?.data?.message || err?.message || 'Unable to download report'
      toast.error(message)
      throw err
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload = {
        ...form,
        glucose: Number(form.glucose) || undefined,
        haemoglobin: Number(form.haemoglobin) || undefined,
        cholesterol: Number(form.cholesterol) || undefined,
        gender: form.gender || undefined,
        remarks: predictResult || undefined
      }
      const res = await api.post('/patients', payload)
      toast.success(res.data?.message || 'Patient saved successfully')
      handleReset()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndDownload = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload = {
        ...form,
        glucose: Number(form.glucose) || undefined,
        haemoglobin: Number(form.haemoglobin) || undefined,
        cholesterol: Number(form.cholesterol) || undefined,
        gender: form.gender || undefined,
        remarks: predictResult || undefined
      }
      const res = await api.post('/patients', payload)
      const savedPatient = res.data || {}
      const patientId = savedPatient._id || savedPatient.id || savedPatient.patientId
      await downloadReportFile(patientId, savedPatient.name || form.name)
      toast.success(res.data?.message || 'Patient saved, report downloaded, and email sent')
      handleReset()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Save and download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Add New Patient</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 24,
        marginTop: 12
      }}>
        {/* Form Section */}
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>Patient Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter patient name"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  transition: 'border 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Date of Birth *
              </label>
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Mobile Number * (10 digits)
              </label>
              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setForm({ ...form, mobile: val })
                }}
                placeholder="Enter 10-digit mobile number"
                disabled={loading}
                maxLength="10"
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {form.mobile.length}/10 digits
              </div>
            </div>
          </div>

          <h3 style={{ margin: '24px 0 16px 0', color: '#1e293b', fontSize: 16 }}>Health Metrics</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Glucose (mg/dL)
              </label>
              <input
                name="glucose"
                type="number"
                value={form.glucose}
                onChange={handleChange}
                placeholder="e.g., 110"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Haemoglobin (g/dL)
              </label>
              <input
                name="haemoglobin"
                type="number"
                value={form.haemoglobin}
                onChange={handleChange}
                placeholder="e.g., 14"
                disabled={loading}
                step="0.1"
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Cholesterol (mg/dL)
              </label>
              <input
                name="cholesterol"
                type="number"
                value={form.cholesterol}
                onChange={handleChange}
                placeholder="e.g., 200"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handlePredict}
              disabled={loading}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
            >
              {loading ? <Spinner size={14} /> : '🔮'} Predict Health
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                background: '#059669',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#047857')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#059669')}
            >
              💾 Save Patient
            </button>
            <button
              onClick={handleSaveAndDownload}
              disabled={loading}
              style={{
                background: '#0f766e',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#115e59')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#0f766e')}
            >
              ⬇️ Save & Download Report
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                background: '#e2e8f0',
                color: '#475569',
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#cbd5e1')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#e2e8f0')}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Prediction Result */}
        {predictResult && (
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            padding: 24,
            borderRadius: 12,
            color: '#fff',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔬 AI Prediction Result
            </h3>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Possible Condition</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {predictResult.possibleCondition || 'Normal'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Reason</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                {predictResult.reason || '-'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Recommendation</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                {predictResult.recommendation || '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
