import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, Menu, X, ShieldAlert, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleSmoothScroll = (elementId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${elementId}`);
      return;
    }
    const element = document.getElementById(elementId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
      <div style={styles.navInner}>
        {/* Logo */}
        <Link to="/" style={styles.logoLink} onClick={() => setIsOpen(false)}>
          <div style={styles.logoBadge}>JG</div>
          <div style={styles.logoTextGroup}>
            <span style={styles.logoMain}>JEANS</span>
            <span style={styles.logoSub}>Wholesale</span>
          </div>
        </Link>

        {/* Center Nav */}
        <div style={styles.centerNav}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
          <button onClick={() => handleSmoothScroll('brands-section')} style={styles.navLinkBtn}>Brands</button>
          <button onClick={() => handleSmoothScroll('contact-section')} style={styles.navLinkBtn}>Contact</button>
          {user?.role === 'buyer' && (
            <Link to="/my-orders" style={styles.navLink}>My Orders</Link>
          )}
        </div>

        {/* Right Actions */}
        <div style={styles.rightNav}>
          {/* Cart */}
          <Link to="/cart" style={styles.cartBtn}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span style={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Login/User */}
          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userLabel}>Logged in as</span>
                <span style={styles.shopName}>
                  {user.shopName.length > 16 ? user.shopName.substring(0, 16) + '…' : user.shopName}
                </span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              Login / Register
            </Link>
          )}
        </div>

        {/* Mobile Trigger */}
        <button style={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/catalogue" style={styles.mobileLink} onClick={() => setIsOpen(false)}>Catalogue</Link>
          <button onClick={() => handleSmoothScroll('brands-section')} style={styles.mobileLinkBtn}>Brands</button>
          <button onClick={() => handleSmoothScroll('contact-section')} style={styles.mobileLinkBtn}>Contact</button>
          {user?.role === 'buyer' && (
            <Link to="/my-orders" style={styles.mobileLink} onClick={() => setIsOpen(false)}>My Orders</Link>
          )}
          <Link to="/cart" style={styles.mobileLink} onClick={() => setIsOpen(false)}>
            Cart ({totalItems} items)
          </Link>
          <div style={styles.mobileDivider} />
          {user ? (
            <div style={styles.mobileUserSection}>
              <span style={styles.mobileShopName}>{user.shopName}</span>
              <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={styles.mobileLoginBtn} onClick={() => setIsOpen(false)}>
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#0d1160',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    borderBottom: '2px solid #e2b04a',
    transition: 'box-shadow 0.3s ease',
  },
  navbarScrolled: {
    boxShadow: '0 4px 24px rgba(13,17,96,0.35)',
  },
  navInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 28px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoBadge: {
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    fontFamily: 'Georgia, serif',
    fontWeight: '800',
    fontSize: '1.1rem',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
  },
  logoMain: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '2px',
  },
  logoSub: {
    fontSize: '0.6rem',
    color: '#e2b04a',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  centerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s',
    cursor: 'pointer',
  },
  navLinkBtn: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 0.2s',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.12)',
    padding: '5px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  rightNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  cartBtn: {
    position: 'relative',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-6px',
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    fontSize: '0.6rem',
    fontWeight: '800',
    borderRadius: '50%',
    width: '17px',
    height: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: '1px',
    height: '28px',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  shopName: {
    fontSize: '0.85rem',
    color: '#e2b04a',
    fontWeight: '700',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 20px',
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    letterSpacing: '0.3px',
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '6px',
  },
  mobileMenu: {
    backgroundColor: '#0b0f52',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '16px 28px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mobileLink: {
    display: 'block',
    padding: '10px 0',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    fontWeight: '500',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  mobileLinkBtn: {
    display: 'block',
    padding: '10px 0',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
  },
  mobileAdminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 0',
    color: '#ef4444',
    fontSize: '0.95rem',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  mobileDivider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: '8px 0',
  },
  mobileUserSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
  },
  mobileShopName: {
    color: '#e2b04a',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '6px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
  },
  mobileLoginBtn: {
    display: 'block',
    textAlign: 'center',
    marginTop: '8px',
    padding: '11px 0',
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
};

// Inject responsive CSS
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @media (max-width: 768px) {
    nav > div:first-child > div:nth-child(2) { display: none !important; }
    nav > div:first-child > div:nth-child(3) { display: none !important; }
    nav > div:first-child > button { display: flex !important; }
  }
  .nav-link-hover:hover { color: #e2b04a !important; }
`;
if (!document.head.querySelector('[data-navbar-styles]')) {
  styleTag.setAttribute('data-navbar-styles', '');
  document.head.appendChild(styleTag);
}

export default Navbar;
