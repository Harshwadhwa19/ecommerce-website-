import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from checkout (Cart.jsx)
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount;

  // Protect the page - if reached manually without order details, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="container" style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.iconWrapper}>
          <CheckCircle2 size={64} style={styles.successIcon} />
        </div>

        <h2 style={styles.title}>Order Placed Successfully!</h2>
        <p style={styles.subtitle}>Thank you for choosing J.G. Jeans. Your wholesale order is now being processed.</p>

        {/* Order Details box */}
        <div style={styles.detailsBox}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Order ID:</span>
            <span style={styles.detailValue}>#{orderId.toUpperCase()}</span>
          </div>
          {totalAmount && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Total Amount Paid:</span>
              <span style={{ ...styles.detailValue, color: '#10b981' }}>₹{Number(totalAmount).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment Verification:</span>
            <span style={{ ...styles.detailValue, color: '#e2b04a' }}>Pending Review</span>
          </div>
        </div>

        {/* Next Steps section */}
        <div style={styles.instructionsBox}>
          <h4 style={styles.instructionsTitle}>What happens next?</h4>
          <div style={styles.stepsList}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <p style={styles.stepText}>Our accounts team will verify the payment screenshot you uploaded.</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <p style={styles.stepText}>Once confirmed, your items will be packed and packed into styles bundles.</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <p style={styles.stepText}>Dispatch details and transport LR details will be sent directly to your registered phone number / WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Trust Note */}
        <div style={styles.trustBanner}>
          <ShieldCheck size={16} />
          <span>Need immediate dispatch help? Direct message factory line: <strong>8087351633</strong></span>
        </div>

        {/* Actions */}
        <div style={styles.actionButtons}>
          <Link to="/catalogue" className="btn btn-primary" style={styles.btnShop}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link to="/my-orders" className="btn btn-secondary" style={styles.btnOrders}>
            View Order History <ArrowRight size={16} />
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
    maxWidth: '550px',
    padding: '40px 30px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(13, 17, 96, 0.08)'
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
    fontSize: '1.8rem',
    color: '#0d1160',
    marginBottom: '10px',
    fontFamily: 'Georgia, serif',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '28px',
    maxWidth: '420px',
    margin: '0 auto 28px'
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '18px 24px',
    textAlign: 'left',
    marginBottom: '28px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.92rem',
    ':lastChild': {
      borderBottom: 'none'
    }
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    color: '#0d1160',
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: '0.95rem'
  },
  instructionsBox: {
    textAlign: 'left',
    marginBottom: '28px'
  },
  instructionsTitle: {
    fontSize: '0.95rem',
    color: '#0d1160',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  stepNumber: {
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    color: '#1a237e',
    fontWeight: '700',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '0.85rem'
  },
  stepText: {
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: '1.5',
    margin: 0
  },
  trustBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '12px 16px',
    fontSize: '0.8rem',
    color: '#78350f',
    marginBottom: '30px',
    textAlign: 'left'
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
  }
};

export default OrderSuccess;
