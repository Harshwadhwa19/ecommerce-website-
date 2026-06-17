import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={s.footer}>
      {/* Main Grid */}
      <div style={s.container}>
        <div style={s.grid}>

          {/* Col 1 — Brand */}
          <div style={s.col}>
            <div style={s.logoBadge}>JG</div>
            <div style={s.brandName}>J.G. JEANS</div>
            <p style={s.brandDesc}>
              Premium wholesale jeans & trousers manufacturer from Parushah Market,
              Ulhasnagar. Factory-direct pricing for retailers across India.
            </p>
            <a
              href="https://wa.me/918087351633?text=Hi, I want to place a wholesale order"
              target="_blank"
              rel="noreferrer"
              style={s.whatsappBtn}
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>

          {/* Col 2 — Quick Links */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Quick Links</h4>
            <div style={s.linkList}>
              <Link to="/" style={s.footerLink}>Home</Link>
              <Link to="/catalogue" style={s.footerLink}>Product Catalogue</Link>
              <Link to="/cart" style={s.footerLink}>My Cart</Link>
              <Link to="/my-orders" style={s.footerLink}>My Orders</Link>
              <Link to="/login" style={s.footerLink}>Login / Register</Link>
            </div>
          </div>

          {/* Col 3 — Brands */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Our Brands</h4>
            <div style={s.linkList}>
              {['Cax & King', '7 GRM®', 'CK2'].map(b => (
                <Link to="/catalogue" key={b} style={s.footerLink}>{b}</Link>
              ))}
            </div>
            <h4 style={{ ...s.colTitle, marginTop: '24px' }}>Business Hours</h4>
            <p style={s.hoursText}><strong style={{color:'#ffffff'}}>Tue – Sun:</strong> 10 AM – 9 PM</p>
            <p style={s.hoursText}><strong style={{color:'#ef4444'}}>Monday:</strong> Closed</p>
          </div>

          {/* Col 4 — Contact */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Contact Us</h4>
            <div style={s.contactItem}>
              <MapPin size={14} style={s.contactIcon} />
              <span style={s.contactText}>
                Shop No. 32, Parushah Market,<br />
                Basant Bahar Road,<br />
                Ulhasnagar – 421 005
              </span>
            </div>
            <div style={{ ...s.contactItem, flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Phone size={14} style={s.contactIcon} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#e2b04a', fontWeight: 'bold', textTransform: 'uppercase' }}>Primary Support</span>
                  <a href="tel:8087351633" style={s.phoneLink}>8087351633</a>
                  
                  <span style={{ fontSize: '0.65rem', color: '#e2b04a', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '6px' }}>Alt Contact 1</span>
                  <a href="tel:9623018183" style={s.phoneLink}>9623018183</a>
                  
                  <span style={{ fontSize: '0.65rem', color: '#e2b04a', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '6px' }}>Alt Contact 2</span>
                  <a href="tel:9324537061" style={s.phoneLink}>9324537061</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '6px' }}>
                <span style={{ color: '#e2b04a', fontSize: '12px', display: 'inline-flex', marginTop: '1px' }}>✉</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#e2b04a', fontWeight: 'bold', textTransform: 'uppercase' }}>Business Email</span>
                  <a href="mailto:j.g.jeans0@gmail.com" style={s.phoneLink}>j.g.jeans0@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div style={s.bottomBar}>
        <div style={s.bottomInner}>
          <span>© {year} J.G. Jeans, Ulhasnagar. All rights reserved.</span>
          <span>Made with <span style={{ color: '#ef4444' }}>❤</span> In India</span>
        </div>
      </div>
    </footer>
  );
};

const s = {
  footer: {
    backgroundColor: '#0b0f52',
    color: '#cbd5e1',
    borderTop: '3px solid #e2b04a',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '52px 28px 44px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr',
    gap: '40px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoBadge: {
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    fontFamily: 'Georgia, serif',
    fontWeight: '800',
    fontSize: '1.1rem',
    width: '38px',
    height: '38px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  brandName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#e2b04a',
    letterSpacing: '2px',
    marginBottom: '12px',
  },
  brandDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.65',
    margin: '0 0 18px',
  },
  whatsappBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    backgroundColor: '#25D366',
    color: '#ffffff',
    padding: '9px 16px',
    borderRadius: '7px',
    fontWeight: '700',
    fontSize: '0.85rem',
    textDecoration: 'none',
    width: 'fit-content',
  },
  colTitle: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#e2b04a',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '14px',
    fontFamily: 'sans-serif',
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  footerLink: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  hoursText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: '0 0 4px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '14px',
  },
  contactIcon: {
    color: '#e2b04a',
    marginTop: '3px',
    flexShrink: 0,
  },
  contactText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.65',
  },
  phoneLink: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.875rem',
    textDecoration: 'none',
    marginBottom: '4px',
    transition: 'color 0.2s',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bottomInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '14px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#64748b',
    flexWrap: 'wrap',
    gap: '8px',
  },
};

export default Footer;
