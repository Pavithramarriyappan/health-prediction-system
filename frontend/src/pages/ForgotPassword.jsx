import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      toast.error('Please enter your username or email.');
      return;
    }

    setLoading(true);
    setOtpStatus(null);
    
    const result = await forgotPassword(username.trim());
    setLoading(false);

    if (result.success) {
      setOtpStatus('success');
      toast.success('✅ OTP sent successfully!');
      setOtpSent(true);
      setTimeout(() => {
        navigate('/reset-password');
      }, 3000);
    } else {
      setOtpStatus('error');
      setErrorMessage(result.message || 'Failed to send OTP. Please check your username/email and try again.');
      toast.error('❌ ' + (result.message || 'Failed to send OTP'));
    }
  };

  const handleRetry = () => {
    setOtpStatus(null);
    setErrorMessage('');
    setUsername('');
    setOtpSent(false);
  };

  // Success State - OTP Sent
  if (otpSent && otpStatus === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h1 style={styles.icon}>✅</h1>
              <h2 style={styles.title}>OTP Sent Successfully!</h2>
              <p style={styles.subtitle}>Your password reset OTP has been sent to your registered email address.</p>
            </div>
            
            <div style={styles.statusBox}>
              <p style={styles.statusNote}>📧 Check your email for the OTP and use it to reset your password.</p>
              <p style={styles.statusWarning}>⏱️ The OTP will expire in 30 minutes.</p>
            </div>

            <button style={styles.button} onClick={() => navigate('/reset-password')}>
              Continue to Reset Password →
            </button>
            
            <div style={styles.linkGroup}>
              <Link to="/login" style={styles.link}>
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State - OTP Failed
  if (otpStatus === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h1 style={styles.icon}>❌</h1>
              <h2 style={styles.title}>OTP Delivery Failed</h2>
              <p style={styles.subtitle}>Unable to send password reset OTP</p>
            </div>

            <div style={styles.errorBox}>
              <p style={styles.errorText}>{errorMessage}</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Try Again with Different Email/Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                style={styles.input}
              />
            </div>

            <button 
              style={styles.button}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Retry Sending OTP'}
            </button>

            <div style={styles.linkGroup}>
              <Link to="/login" style={styles.link}>
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default State - Form
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.icon}>🔒</h1>
            <h2 style={styles.title}>Forgot Password</h2>
            <p style={styles.subtitle}>Enter your username or email to receive password reset OTP.</p>
            <p style={styles.note}>📧 OTP will be sent to your registered email address</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
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
              {loading ? '⏳ Sending OTP...' : '📧 Send Reset OTP'}
            </button>
          </form>

          <div style={styles.linkGroup}>
            <Link to="/login" style={styles.link}>
              ← Back to Login
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  wrapper: {
    width: '100%',
    maxWidth: '450px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    padding: '40px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  icon: {
    fontSize: '50px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 5px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },
  note: {
    fontSize: '13px',
    color: '#1f2937',
    marginTop: '8px'
  },
  form: {
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  successBox: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  infoText: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  tokenBox: {
    background: '#f5f5f5',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },
  tokenCode: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    flex: 1
  },
  copyButton: {
    padding: '8px 12px',
    fontSize: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.3s ease'
  },
  warningText: {
    fontSize: '13px',
    color: '#666',
    margin: '0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  primaryButton: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    background: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    background: '#f0f4ff',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  linkGroup: {
    textAlign: 'center'
  },
  link: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  },
  statusBox: {
    background: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '8px',
    padding: '18px',
    marginBottom: '24px',
    textAlign: 'center'
  },
  statusText: {
    fontSize: '14px',
    color: '#1f2937',
    margin: '0 0 12px 0',
    fontWeight: '500'
  },
  statusNote: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 10px 0'
  },
  statusWarning: {
    fontSize: '13px',
    color: '#ea580c',
    margin: '0',
    fontWeight: '500'
  },
  errorBox: {
    background: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    padding: '18px',
    marginBottom: '24px',
    textAlign: 'center'
  },
  errorText: {
    fontSize: '14px',
    color: '#991b1b',
    margin: '0',
    fontWeight: '500'
  }
};

export default ForgotPassword;
