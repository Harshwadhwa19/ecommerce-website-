import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Package, ExternalLink, Image } from 'lucide-react';

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': return 'badge-success';
      case 'Shipped': return 'badge-primary';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '110px 24px 80px 24px', textAlign: 'center' }}>
        <p>Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h3>Error Loading Orders</h3>
        <p style={{ color: '#ef4444', margin: '15px 0' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '110px 24px 80px 24px', textAlign: 'center' }}>
        <Package size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
        <h2>No Orders Found</h2>
        <p style={{ color: '#64748b', margin: '15px 0' }}>You haven't placed any wholesale orders yet.</p>
        <Link to="/catalogue" className="btn btn-primary">View Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>My Wholesale Orders</h2>
        <p>Track your payments, approvals, and shipment status</p>
      </div>

      <div className="orders-list-container">
        {orders.map((order) => (
          <div key={order._id} className="order-detail-card">
            
            {/* Header info */}
            <div style={styles.orderHeader}>
              <div>
                <span style={styles.orderIdLabel}>ORDER ID</span>
                <h3 style={styles.orderIdVal}>#{order._id.substring(order._id.length - 8).toUpperCase()}</h3>
              </div>
              
              <div style={styles.headerRight}>
                <span className={`badge ${getStatusBadgeClass(order.status)}`} style={styles.statusBadge}>
                  {order.status}
                </span>
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* Middle body info */}
            <div className="order-details-grid">
              <div style={styles.metaColumn}>
                <div style={styles.metaItem}>
                  <Calendar size={16} style={{ color: '#e2b04a' }} />
                  <div>
                    <span style={styles.metaItemLabel}>Date Placed</span>
                    <span style={styles.metaItemVal}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <DollarSign size={16} style={{ color: '#e2b04a' }} />
                  <div>
                    <span style={styles.metaItemLabel}>Total Amount (Ex-Factory)</span>
                    <span style={styles.metaItemVal} className="text-primary font-bold">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.metaColumn}>
                <div style={styles.metaItem}>
                  <MapPin size={16} style={{ color: '#e2b04a' }} />
                  <div>
                    <span style={styles.metaItemLabel}>Delivery & Transport Address</span>
                    <span style={styles.metaItemVal} style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                      {order.deliveryAddress}
                    </span>
                  </div>
                </div>

                {order.paymentScreenshot && (
                  <div style={styles.metaItem}>
                    <Image size={16} style={{ color: '#e2b04a' }} />
                    <div>
                      <span style={styles.metaItemLabel}>Payment Proof Submitted</span>
                      <a 
                        href={`/${order.paymentScreenshot}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.screenshotLink}
                      >
                        View Receipt Screenshot <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* Itemized list */}
            <div>
              <h4 style={styles.itemsTitle}>Consignment Details</h4>
              <div style={styles.itemsGrid}>
                {order.items.map((item, idx) => {
                  const name = item.productName || (item.product ? item.product.name : 'Unknown Product');
                  return (
                    <div key={idx} className="order-consignment-row">
                      <div style={styles.itemNameCol}>
                        <span style={styles.itemName}>
                          {name}
                        </span>
                        <div style={styles.itemVariant}>
                          <span>Color: <strong>{item.color}</strong></span>
                          <span style={styles.variantDot}>•</span>
                          <span>Sizes: <strong>28, 30, 32, 34, 36 (Assorted Pack)</strong></span>
                        </div>
                      </div>
                      
                      <div style={styles.itemQtyCol} style={{ minWidth: '150px' }}>
                        <strong>{item.bundleQty} {item.bundleQty === 1 ? 'bundle' : 'bundles'}</strong> ({item.bundleQty * item.piecesPerBundle} pcs)
                      </div>

                      <div style={styles.itemPriceCol}>
                        ₹{item.pricePerPiece}/pc
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>₹{item.pricePerPiece * item.piecesPerBundle}/bundle</span>
                      </div>

                      <div className="item-subtotal-col" style={styles.itemSubtotalCol}>
                        ₹{item.totalPrice}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderIdLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  orderIdVal: {
    fontSize: '1.25rem',
    color: '#0d1160',
    fontFamily: 'Georgia, serif',
    marginTop: '2px'
  },
  headerRight: {
    textAlign: 'right'
  },
  statusBadge: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    borderRadius: '20px',
    fontWeight: '700'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '16px 0'
  },
  metaColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  metaItemLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px',
    display: 'block'
  },
  metaItemVal: {
    fontSize: '0.95rem',
    color: '#1e293b',
    fontWeight: '500',
    marginTop: '2px',
    display: 'block'
  },
  screenshotLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#1a237e',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'underline',
    marginTop: '4px'
  },
  itemsTitle: {
    fontSize: '0.9rem',
    color: '#0d1160',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
    marginBottom: '12px'
  },
  itemsGrid: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    padding: '8px 16px'
  },
  itemNameCol: {
    flexGrow: 1,
    minWidth: '200px'
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0d1160'
  },
  itemVariant: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '2px'
  },
  variantDot: {
    margin: '0 6px',
    color: '#cbd5e1'
  },
  itemQtyCol: {
    minWidth: '80px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569'
  },
  itemPriceCol: {
    minWidth: '100px',
    fontSize: '0.9rem',
    color: '#64748b'
  },
  itemSubtotalCol: {
    minWidth: '100px',
    textAlign: 'right',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1a237e'
  }
};

export default MyOrders;
