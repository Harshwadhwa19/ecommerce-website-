import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Package, CheckCircle2, Truck, HelpCircle, XCircle } from 'lucide-react';

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setOrders(result.data);
        } else {
          setError(result.error || 'Failed to fetch orders.');
        }
      } catch (err) {
        setError('Connection error. Could not load orders.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const getTimelineStep = (status) => {
    switch (status) {
      case 'Pending Verification': return 1;
      case 'Payment Verified': return 2;
      case 'Dispatched': return 3;
      case 'Delivered': return 4;
      case 'Rejected': return -1;
      default: return 1;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Verification': return '#e2b04a';
      case 'Payment Verified': return '#10b981';
      case 'Dispatched': return '#3b82f6';
      case 'Delivered': return '#6366f1';
      case 'Rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="container" style={styles.centerContainer}>
        <p>Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={styles.centerContainer}>
        <h3 style={{ color: '#ef4444' }}>Error Loading Orders</h3>
        <p style={{ color: '#64748b', margin: '10px 0' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={styles.centerContainer}>
        <Package size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
        <h2>No Orders Found</h2>
        <p style={{ color: '#64748b', margin: '10px 0' }}>You haven't placed any wholesale orders yet.</p>
        <Link to="/catalogue" className="btn btn-primary">View Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>My Wholesale Orders</h2>
        <p>Track your payments, order verification progress, and shipment status</p>
      </div>

      <div style={styles.ordersList}>
        {orders.map((order) => {
          const currentStep = getTimelineStep(order.status);
          const formattedId = `JG-${order._id.substring(order._id.length - 6).toUpperCase()}`;
          const totalPieces = order.items.reduce((sum, item) => sum + (item.bundleQty * item.piecesPerBundle), 0);
          
          return (
            <div key={order._id} style={styles.orderCard}>
              {/* Top Row: Meta info */}
              <div style={styles.cardHeader}>
                <div style={styles.metaInfo}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>ORDER ID</span>
                    <strong style={styles.metaVal}>{formattedId}</strong>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>ORDER DATE</span>
                    <span style={styles.metaVal}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>TOTAL PRICE</span>
                    <strong style={{ ...styles.metaVal, color: '#1a237e' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>PAYMENT STATUS</span>
                    <span style={{ 
                      ...styles.statusText, 
                      color: order.status === 'Rejected' ? '#ef4444' : order.status === 'Pending Verification' ? '#e2b04a' : '#10b981'
                    }}>
                      {order.status === 'Rejected' ? 'Rejected' : order.status === 'Pending Verification' ? 'Verification Pending' : 'Payment Verified'}
                    </span>
                  </div>
                </div>

                <span style={{
                  ...styles.statusPill,
                  backgroundColor: getStatusColor(order.status) + '12',
                  color: getStatusColor(order.status),
                  borderColor: getStatusColor(order.status) + '30'
                }}>
                  {order.status}
                </span>
              </div>

              {/* Middle Row: Content & Timeline */}
              <div style={styles.cardContent}>
                
                {/* Left side: Items summary */}
                <div style={styles.itemsColumn}>
                  <h4 style={styles.subHeading}>Ordered Products ({totalPieces} pieces)</h4>
                  <div style={styles.itemsList}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <div style={{ flexGrow: 1 }}>
                          <span style={styles.itemName}>{item.productName}</span>
                          <span style={styles.itemMeta}> (Color: {item.color}, Size Assortment 28-36)</span>
                        </div>
                        <span style={styles.itemQty}>{item.bundleQty} bundles ({item.bundleQty * item.piecesPerBundle} pcs)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Flipkart-style Timeline */}
                <div style={styles.timelineColumn}>
                  {currentStep === -1 ? (
                    <div style={styles.rejectedBanner}>
                      <XCircle size={24} />
                      <div>
                        <strong>Order Rejected</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>
                          There was an issue verifying your payment. Please contact sales helpline: 8087351633.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.timeline}>
                      {/* Step 1: Pending */}
                      <div style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineBullet,
                          backgroundColor: currentStep >= 1 ? '#e2b04a' : '#e2e8f0',
                          color: '#ffffff'
                        }}>
                          {currentStep >= 1 ? '✓' : '1'}
                        </div>
                        <div style={styles.timelineInfo}>
                          <div style={styles.timelineTitle}>Pending Verification</div>
                          <div style={styles.timelineDesc}>Payment receipt submitted</div>
                        </div>
                      </div>

                      <div style={{
                        ...styles.timelineLine,
                        backgroundColor: currentStep >= 2 ? '#10b981' : '#cbd5e1'
                      }} />

                      {/* Step 2: Payment Verified */}
                      <div style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineBullet,
                          backgroundColor: currentStep >= 2 ? '#10b981' : '#e2e8f0',
                          color: '#ffffff'
                        }}>
                          {currentStep >= 2 ? '✓' : '2'}
                        </div>
                        <div style={styles.timelineInfo}>
                          <div style={styles.timelineTitle}>Payment Verified</div>
                          <div style={styles.timelineDesc}>Accounts team approved</div>
                        </div>
                      </div>

                      <div style={{
                        ...styles.timelineLine,
                        backgroundColor: currentStep >= 3 ? '#3b82f6' : '#cbd5e1'
                      }} />

                      {/* Step 3: Dispatched */}
                      <div style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineBullet,
                          backgroundColor: currentStep >= 3 ? '#3b82f6' : '#e2e8f0',
                          color: '#ffffff'
                        }}>
                          {currentStep >= 3 ? '✓' : '3'}
                        </div>
                        <div style={styles.timelineInfo}>
                          <div style={styles.timelineTitle}>Dispatched</div>
                          <div style={styles.timelineDesc}>Shipped via transport</div>
                        </div>
                      </div>

                      <div style={{
                        ...styles.timelineLine,
                        backgroundColor: currentStep >= 4 ? '#6366f1' : '#cbd5e1'
                      }} />

                      {/* Step 4: Delivered */}
                      <div style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineBullet,
                          backgroundColor: currentStep >= 4 ? '#6366f1' : '#e2e8f0',
                          color: '#ffffff'
                        }}>
                          {currentStep >= 4 ? '✓' : '4'}
                        </div>
                        <div style={styles.timelineInfo}>
                          <div style={styles.timelineTitle}>Delivered</div>
                          <div style={styles.timelineDesc}>Consignment reached shop</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '110px 24px 60px 24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  centerContainer: {
    padding: '120px 24px 80px 24px',
    textAlign: 'center'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  orderCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  metaInfo: {
    display: 'flex',
    gap: '28px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#878787',
    letterSpacing: '0.5px'
  },
  metaVal: {
    fontSize: '0.88rem',
    color: '#212121',
    fontWeight: '700'
  },
  statusText: {
    fontSize: '0.88rem',
    fontWeight: '700'
  },
  statusPill: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '700',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  cardContent: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
      gap: '24px'
    }
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  subHeading: {
    fontSize: '0.85rem',
    color: '#878787',
    fontWeight: '700',
    textTransform: 'uppercase',
    margin: '0 0 12px 0',
    letterSpacing: '0.5px'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    borderBottom: '1px solid #f8fafc',
    paddingBottom: '8px'
  },
  itemName: {
    fontWeight: '700',
    color: '#212121'
  },
  itemMeta: {
    color: '#64748b',
    fontSize: '0.8rem'
  },
  itemQty: {
    fontWeight: '600',
    color: '#1a237e'
  },
  timelineColumn: {
    borderLeft: '1px solid #f1f5f9',
    paddingLeft: '24px',
    '@media (max-width: 900px)': {
      borderLeft: 'none',
      paddingLeft: 0,
      borderTop: '1px solid #f1f5f9',
      paddingTop: '20px'
    }
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  timelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  timelineBullet: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.75rem',
    zIndex: 2,
    flexShrink: 0
  },
  timelineInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  timelineTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#212121'
  },
  timelineDesc: {
    fontSize: '0.75rem',
    color: '#878787',
    marginTop: '2px'
  },
  timelineLine: {
    width: '2px',
    height: '24px',
    marginLeft: '11px',
    zIndex: 1
  },
  rejectedBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: '1px solid #f87171',
    borderRadius: '4px',
    padding: '16px'
  }
};

export default MyOrders;
