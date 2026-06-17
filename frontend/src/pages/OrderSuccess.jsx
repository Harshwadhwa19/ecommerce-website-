import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from checkout (Checkout.jsx)
  const orderId = location.state?.orderId;

  // Protect the page - if reached manually without order details, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  // Format Order ID to professional JG-XXXX format (taking last 6 characters capitalized)
  const formattedOrderId = `JG-${orderId.substring(orderId.length - 6).toUpperCase()}`;

  return (
    <div className="container" style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.iconWrapper}>
          <CheckCircle2 size={64} style={styles.successIcon} />
        </div>

        <h2 style={styles.title}>Order Placed Successfully</h2>
        
        <div style={styles.detailsBox}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Order ID:</span>
            <span style={styles.detailValue}>{formattedOrderId}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment Status:</span>
            <span style={{ ...styles.detailValue, color: '#e2b04a' }}>Verification Pending</span>
          </div>
        </div>

        <p style={styles.thankyouText}>Thank you for choosing J.G. Jeans Wholesale.</p>
        <p style={styles.nextStepsText}>Our team will verify your payment and contact you shortly.</p>

        <div style={styles.supportBox}>
          <span style={styles.supportTitle}>Primary Sales & Order Support</span>
          <div style={styles.supportDetail}>
            📞 <a href="tel:8087351633" style={styles.supportLink}>8087351633</a>
          </div>
          <div style={styles.supportDetail}>
            📧 <a href="mailto:j.g.jeans0@gmail.com" style={styles.supportLink}>j.g.jeans0@gmail.com</a>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <Link to="/catalogue" className="btn btn-primary" style={styles.btnShop}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link to="/my-orders" className="btn btn-secondary" style={styles.btnOrders}>
            My Orders <ArrowRight size={16} />
          </Link>
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
    maxWidth: '500px',
    padding: '40px 30px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  successIcon: {
    color: '#10b981'
  },
  title: {
    fontSize: '1.6rem',
    color: '#10b981',
    marginBottom: '24px',
    fontFamily: 'sans-serif',
    fontWeight: '700'
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '16px 20px',
    textAlign: 'left',
    marginBottom: '24px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '0.92rem'
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    color: '#0d1160',
    fontWeight: '700',
    fontSize: '0.95rem'
  },
  thankyouText: {
    fontSize: '0.95rem',
    color: '#0d1160',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  nextStepsText: {
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: '1.5',
    margin: '0 0 32px 0'
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    '@media (max-width: 480px)': {
      flexDirection: 'column'
    }
  },
  btnShop: {
    flex: 1,
    padding: '12px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  btnOrders: {
    flex: 1,
    padding: '12px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1'
  },
  supportBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '4px',
    padding: '12px 16px',
    marginBottom: '24px',
    fontSize: '0.85rem',
    textAlign: 'left'
  },
  supportTitle: {
    fontWeight: '700',
    color: '#78350f',
    display: 'block',
    marginBottom: '6px'
  },
  supportDetail: {
    color: '#78350f',
    margin: '3px 0'
  },
  supportLink: {
    color: '#1a237e',
    fontWeight: '700',
    textDecoration: 'underline'
  }
};

export default OrderSuccess;
