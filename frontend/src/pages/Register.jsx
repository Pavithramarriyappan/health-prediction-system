import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const mobileRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!fullName.trim() || !username.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      toast.error('Please complete all fields.');
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (!mobileRegex.test(mobile)) {
      toast.error('Mobile number must contain exactly 10 digits.');
      return false;
    }

    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters and include uppercase, lowercase, number and special character.');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/request-account', {
        fullName,
        username,
        email,
        mobile,
        password,
        confirmPassword
      });

      if (response.data.success) {
        toast.success('✅ Account request submitted successfully!');
        setRequestSubmitted(true);
      } else {
        toast.error(response.data.message || 'Failed to submit account request');
      }
    } catch (error) {
      console.error('Account request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit account request');
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (requestSubmitted) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.successContent}>
              <h1 style={styles.successIcon}>✅</h1>
              <h2 style={styles.successTitle}>Account Request Submitted!</h2>
              <p style={styles.successMessage}>
                Your account creation request has been submitted successfully.
              </p>
              <div style={styles.successDetails}>
                <p style={styles.detailText}>📧 A request notification has been sent to the system administrator at <strong>healthpredicts@gmail.com</strong></p>
                <p style={styles.detailText}>⏳ Your request will be reviewed shortly. You will receive an email once your account is approved.</p>
                <p style={styles.detailText}>🔐 Username: <strong>{username}</strong></p>
              </div>
              <button style={styles.button} onClick={() => navigate('/login')}>
                🔓 Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.icon}>📋</h1>
            <h2 style={styles.title}>Request Admin Account</h2>
            <p style={styles.subtitle}>Submit a request to create a new administrator account.</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroupRow}>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10 digit mobile"
                  maxLength={10}
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  style={{ ...styles.input, paddingRight: '100px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={styles.toggleButton}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? '⏳ Submitting Request...' : '📧 Submit Account Request'}
            </button>
          </form>

          <div style={styles.loginRow}>
            <span style={styles.loginText}>Already an admin?</span>
            <Link to="/login" style={styles.loginLink}>
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eef6ff 0%, #dbe9ff 100%)',
    padding: '20px'
  },
  wrapper: {
    width: '100%',
    maxWidth: '620px'
  },
  card: {
    background: 'white',
    borderRadius: '18px',
    boxShadow: '0 18px 55px rgba(33, 46, 97, 0.12)',
    padding: '40px',
    marginBottom: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  icon: {
    fontSize: '50px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1c3b72',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '15px',
    color: '#556a9d',
    margin: 0
  },
  form: {
    marginBottom: '18px'
  },
  formGroup: {
    marginBottom: '18px'
  },
  formGroupRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '18px'
  },
  formGroupHalf: {
    marginBottom: '0'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#34416d',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: '1px solid #d8e2ff',
    borderRadius: '12px',
    background: '#fbfdff',
    color: '#141c3a',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  passwordWrapper: {
    position: 'relative'
  },
  toggleButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#1f6ed4',
    fontWeight: '700',
    cursor: 'pointer'
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #1f6ed4 0%, #4f67d8 100%)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  loginRow: {
    textAlign: 'center',
    marginTop: '18px'
  },
  loginText: {
    color: '#556a9d',
    marginRight: '8px'
  },
  loginLink: {
    color: '#1f6ed4',
    textDecoration: 'none',
    fontWeight: '700'
  },
  successContent: {
    textAlign: 'center',
    padding: '30px 0'
  },
  successIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  successTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#22c55e',
    margin: '0 0 12px 0'
  },
  successMessage: {
    fontSize: '16px',
    color: '#34416d',
    margin: '0 0 24px 0'
  },
  successDetails: {
    background: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '28px',
    textAlign: 'left'
  },
  detailText: {
    fontSize: '14px',
    color: '#1f2937',
    margin: '12px 0',
    lineHeight: '1.6'
  }
};

export default Register;
