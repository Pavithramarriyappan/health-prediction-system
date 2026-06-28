import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

export default function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', dob: '', email: '', mobile: '', gender: '', glucose: '', haemoglobin: '', cholesterol: '' })

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/patients/${id}`)
        const patient = res.data
        setForm({
          name: patient.name || '',
          dob: patient.dob ? patient.dob.split('T')[0] : '',
          email: patient.email || '',
          mobile: patient.mobile || '',
          gender: patient.gender || '',
          glucose: patient.glucose || '',
          haemoglobin: patient.haemoglobin || '',
          cholesterol: patient.cholesterol || ''
        })
      } catch (err) {
        console.error(err)
        toast.error('Failed to load patient data')
        navigate('/patients')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPatient()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    // For mobile, allow only digits
    if (name === 'mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      setForm({ ...form, [name]: digits })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSave = async () => {
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      toast.error('Mobile number must be exactly 10 digits')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...form,
        glucose: Number(form.glucose) || undefined,
        haemoglobin: Number(form.haemoglobin) || undefined,
        cholesterol: Number(form.cholesterol) || undefined,
        gender: form.gender || undefined
      }
      await api.put(`/patients/${id}`, payload)
      toast.success('Patient updated successfully')
      navigate('/patients')
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Failed to update patient')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate('/patients')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 40 }}>
        <Spinner /> Loading patient data...
      </div>
    )
  }

  return (
    <div>
      <h2>Edit Patient</h2>
      <div style={{ marginTop: 12, background: '#fff', padding: 16, borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Date of Birth
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Gender
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
          <label>
            Mobile Number (10 digits)
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              disabled={saving}
              maxLength="10"
              placeholder="10-digit mobile number"
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Glucose
            <input
              name="glucose"
              value={form.glucose}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Haemoglobin
            <input
              name="haemoglobin"
              value={form.haemoglobin}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
          <label>
            Cholesterol
            <input
              name="cholesterol"
              value={form.cholesterol}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '100%', padding: 8, marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}
            />
          </label>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#059669',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {saving ? <><Spinner size={14} /> Saving...</> : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              background: '#e2e8f0',
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
