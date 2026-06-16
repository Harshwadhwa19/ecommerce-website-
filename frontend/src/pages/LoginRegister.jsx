import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';

const LoginRegister = () => {
  const { login, register, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode toggle
  const [isLogin, setIsLogin] = useState(true);

  // Form inputs
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);
    setLoading(true);

    if (isLogin) {
      // Login validation
      if (!phone && !email) {
        setValidationError('Please enter your phone number or email address');
        setLoading(false);
        return;
      }
      
      const identity = phone || email; // Using the single input field
      const res = await login(identity, password);
      
      if (res.success) {
        if (res.user && res.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } else {
      // Register validation
      if (!name || !shopName || !phone || !email || !password) {
        setValidationError('All fields are required');
        setLoading(false);
        return;
      }

      if (phone.length < 10) {
        setValidationError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      const res = await register(name, shopName, phone, email, password);
      if (res.success) {
        navigate('/');
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setValidationError('');
    setError(null);
  };

  return (
    <div className="container" style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 className="brand-font" style={styles.cardTitle}>
            {isLogin ? 'Wholesale Login' : 'Buyer Registration'}
          </h2>
          <p style={styles.cardSubtitle}>
            {isLogin 
              ? 'Access J.G. Jeans e-commerce and track your consignments' 
              : 'Register your retail store to access factory-direct pricing'}
          </p>
        </div>

        {/* Feedback Messages */}
        {(validationError || error) && (
          <div style={styles.errorBanner}>
            <AlertTriangle size={18} />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Contact Person Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Shop / Firm Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your registered retail shop name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>{isLogin ? 'Phone Number or Email' : 'Mobile Number (WhatsApp)'}</label>
            <input
              type={isLogin ? 'text' : 'tel'}
              className="form-control"
              placeholder={isLogin ? 'Enter phone or registered email' : '10-digit mobile number'}
              value={isLogin ? (phone || email) : phone}
              onChange={(e) => {
                if (isLogin) {
                  // In login, input can be phone or email
                  const val = e.target.value;
                  if (val.includes('@')) {
                    setEmail(val);
                    setPhone('');
                  } else {
                    setPhone(val);
                    setEmail('');
                  }
                } else {
                  setPhone(e.target.value);
                }
              }}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="shop@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder={isLogin ? 'Enter password' : 'Minimum 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Register Shop')}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            {isLogin ? "Don't have a wholesale account? " : "Already registered? "}
            <button onClick={toggleMode} style={styles.toggleBtn}>
              {isLogin ? 'Register Here' : 'Log In Here'}
            </button>
          </p>
        </div>

        {/* Security badge */}
        <div style={styles.securityBadge}>
          <ShieldCheck size={14} />
          <span>B2B Manufacturer verified registration. Ulhasnagar, MH.</span>
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
    padding: '110px 24px 60px 24px',
    minHeight: 'calc(100vh - 150px)'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px 30px',
    boxShadow: '0 10px 25px rgba(13, 17, 96, 0.08)'
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  cardTitle: {
    fontSize: '1.8rem',
    color: '#0d1160',
    marginBottom: '8px'
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b'
  },
  form: {
    width: '100%'
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  submitBtn: {
    width: '100%',
    marginTop: '10px',
    padding: '12px'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #f87171',
    borderRadius: '6px',
    padding: '12px 16px',
    fontSize: '0.85rem',
    marginBottom: '20px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '0.9rem',
    color: '#475569'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#1a237e',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '30px',
    color: '#94a3b8',
    fontSize: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px'
  }
};

export default LoginRegister;
