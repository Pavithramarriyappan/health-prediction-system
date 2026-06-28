import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.icon}>⚕️</h1>
            <h2 style={styles.title}>Health Prediction System</h2>
            <p style={styles.subtitle}>Admin Login</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : '🔓 Login'}
            </button>

            <div style={styles.forgotPasswordLink}>
              <Link to="/forgot-password" style={styles.link}>
                Forgot Password?
              </Link>
              <span style={styles.separator}>•</span>
              <Link to="/register" style={styles.link}>
                Create Account?
              </Link>
            </div>
          </form>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>This system is restricted to clinic admin accounts only.</p>
            <p style={styles.infoNote}>If you need access, contact the clinic administrator.</p>
          </div>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>© 2026 Health Prediction System. All rights reserved.</p>
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
    maxWidth: '500px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.18)',
    padding: '40px',
    marginBottom: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  icon: {
    fontSize: '52px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#112269',
    margin: '0 0 5px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#556cd6',
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
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '14px',
    border: '1px solid #d8deff',
    borderRadius: '10px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none'
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
    color: '#556cd6',
    fontWeight: '700',
    cursor: 'pointer'
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    
  forgotPasswordLink: {
    textAlign: 'center',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  },
  link: {
    fontSize: '14px',
    color: '#556cd6',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  separator: {
    color: '#ccc',
    fontSize: '12px'
  },color: 'white',
    background: 'linear-gradient(135deg, #1f6ed4 0%, #4f67d8 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  demoBox: {
    background: '#f0f4ff',
    border: '1px solid #dde4ff',
    borderRadius: '10px',
    padding: '16px',
    marginTop: '24px',
    fontSize: '13px',
    color: '#333'
  },
  demoTitle: {
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1f6ed4'
  },
  demoText: {
    margin: '5px 0',
    color: '#4b5563'
  },
  footer: {
    textAlign: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.86)',
    margin: '0'
  }
};

export default Login;
