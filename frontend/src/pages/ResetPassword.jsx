import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  React.useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      setResetToken(urlToken);
      toast.success('✅ OTP auto-filled from your email link!');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetToken.trim()) {
      toast.error('❌ OTP is required');
      return;
    }

    if (!newPassword) {
      toast.error('❌ New password is required');
      return;
    }

    if (!confirmPassword) {
      toast.error('❌ Confirm password is required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('❌ Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('❌ Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(resetToken, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success('✅ Password reset successful!');
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setResetError(result.message || 'Failed to reset password');
      toast.error('❌ ' + (result.message || 'Failed to reset password'));
    }
  };

  if (resetSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.successContent}>
              <h1 style={styles.successIcon}>✅</h1>
              <h2 style={styles.successTitle}>Password Reset Successful!</h2>
              <p style={styles.successMessage}>
                Your password has been reset successfully. Redirecting to login...
              </p>
              <button
                onClick={() => navigate('/login')}
                style={styles.button}
              >
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
            <h1 style={styles.icon}>🔐</h1>
            <h2 style={styles.title}>Reset Your Password</h2>
            <p style={styles.subtitle}>Enter the OTP from your email and create a new password</p>
          </div>

          {resetError && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>❌ {resetError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Reset Token (OTP) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🔑 Reset OTP</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Enter OTP from your email"
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.helperText}>Check your email for the 6-digit OTP (valid for 30 minutes)</p>
            </div>

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🔒 New Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  style={{ ...styles.input, paddingRight: '100px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>✓ Confirm Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  style={{ ...styles.input, paddingRight: '100px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {newPassword && confirmPassword && (
              <div style={{
                ...styles.statusIndicator,
                backgroundColor: newPassword === confirmPassword ? '#f0fdf4' : '#fef2f2',
                borderColor: newPassword === confirmPassword ? '#22c55e' : '#ef4444'
              }}>
                <span style={{
                  color: newPassword === confirmPassword ? '#16a34a' : '#991b1b'
                }}>
                  {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </span>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? '⏳ Resetting Password...' : '🔄 Reset Password'}
            </button>
          </form>

          <div style={styles.linkGroup}>
            <Link to="/login" style={styles.link}>
              ← Back to Login
            </Link>
            <span style={styles.divider}>|</span>
            <Link to="/forgot-password" style={styles.link}>
              Request New OTP →
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
  successContent: {
    textAlign: 'center',
    padding: '40px 0'
  },
  successIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#22c55e',
    margin: '0 0 10px 0'
  },
  successMessage: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px 0'
  },
  linkGroup: {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  },
  link: {
    fontSize: '13px',
    color: '#667eea',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  },
  divider: {
    color: '#ccc',
    fontSize: '14px'
  },
  passwordWrapper: {
    position: 'relative'
  },
  toggleButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px'
  },
  helperText: {
    fontSize: '12px',
    color: '#8b5cf6',
    marginTop: '6px',
    margin: '6px 0 0 0'
  },
  errorBox: {
    background: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '20px'
  },
  errorText: {
    fontSize: '13px',
    color: '#991b1b',
    margin: '0'
  },
  statusIndicator: {
    borderRadius: '6px',
    padding: '10px 12px',
    marginBottom: '16px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '500',
    border: '2px solid'
  }
};

export default ResetPassword;
