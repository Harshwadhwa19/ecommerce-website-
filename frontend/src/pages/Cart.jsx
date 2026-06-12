import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, AlertTriangle, CheckCircle, Upload, QrCode, FileText } from 'lucide-react';

const Cart = () => {
  const { cartItems, totalAmount, totalItems, isMoqMet, underMoqItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Delivery & Payment States
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to place a wholesale order!' });
      return;
    }

    if (!isMoqMet) {
      setMessage({ type: 'error', text: 'Please satisfy all Minimum Order Quantity (MOQ) requirements before proceeding!' });
      return;
    }

    if (!deliveryAddress.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid delivery/transport address!' });
      return;
    }

    if (!screenshot) {
      setMessage({ type: 'error', text: 'Please upload the payment transaction screenshot to complete the checkout!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const orderItems = cartItems.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        color: item.color,
        bundleQty: item.bundleQty,
        piecesPerBundle: item.piecesPerBundle,
        pricePerPiece: item.pricePerPiece,
        totalPrice: item.totalPrice
      }));

      const formData = new FormData();
      formData.append('items', JSON.stringify(orderItems));
      formData.append('totalAmount', totalAmount);
      formData.append('deliveryAddress', deliveryAddress);
      formData.append('screenshot', screenshot);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        setMessage({ type: 'success', text: 'Order placed successfully! Redirecting to your order history...' });
        setTimeout(() => {
          navigate('/my-orders');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to place order. Please try again.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Please try again later.' });
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic UPI billing payload
  const upiId = '8087351633@okbizaxis';
  const upiName = 'J G Jeans';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&tn=Order%20Payment&cu=INR`;
  const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '110px 24px 80px 24px', textAlign: 'center' }}>
        <ShoppingCart size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', margin: '15px 0' }}>Add wholesale items from our catalog to build your order.</p>
        <Link to="/catalogue" className="btn btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>Shopping Cart & Checkout</h2>
        <p>Review items, pay via UPI, and submit your transport details</p>
      </div>

      {message.text && (
        <div style={{
          ...styles.messageBanner,
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          borderColor: message.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Side: Cart Items List */}
        <div className="cart-list-section">
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={styles.cardTitle}>Selected Designs ({totalItems} pcs)</h3>
            <div style={styles.divider}></div>
            
            {cartItems.map((item, idx) => (
              <div key={`${item.product._id}-${item.color}`} className="cart-item-row">
                <img 
                  src={(item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&auto=format&fit=crop'} 
                  alt={item.product.name} 
                  className="item-thumbnail"
                />
                <div className="item-details">
                  <span className="badge badge-brand" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{item.product.brand}</span>
                  <h4 className="item-title">{item.product.name}</h4>
                  <div className="item-meta-info">
                    <span>Color: <strong>{item.color}</strong></span>
                    <span style={styles.metaDot}>•</span>
                    <span>Sizes: <strong>28, 30, 32, 34, 36</strong></span>
                  </div>
                </div>

                <div className="item-qty-actions">
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.color, item.bundleQty - 1)}
                    className="item-qty-btn"
                  >
                    -1
                  </button>
                  <span className="item-qty-val" style={{ textAlign: 'center', minWidth: '80px', display: 'inline-block' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.bundleQty} {item.bundleQty === 1 ? 'bundle' : 'bundles'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({item.bundleQty * item.piecesPerBundle} pcs)</div>
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.color, item.bundleQty + 1)}
                    className="item-qty-btn"
                  >
                    +1
                  </button>
                </div>

                <div className="item-price-details">
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{item.pricePerPiece}/pc</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>₹{item.pricePerPiece * item.piecesPerBundle}/bundle</span>
                  <div className="item-subtotal-val">₹{item.totalPrice}</div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product._id, item.color)}
                  className="item-delete-btn"
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {/* Cart MOQ Indicators */}
            {!isMoqMet && (
              <div style={styles.moqBlockWarning}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309' }}>
                  <AlertTriangle size={18} /> Minimum Order Quantity (MOQ) Not Met
                </h4>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Wholesale orders are packed by styles. The following items do not meet the minimum factory production size:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {underMoqItems.map(item => (
                    <li key={item.product._id}>
                      <strong>{item.product.name}</strong>: Current total is <strong>{item.currentQuantity}</strong> pieces. Needs at least <strong>{item.moq}</strong> pieces (Short by <strong>{item.needed}</strong> pieces, i.e., <strong>{Math.ceil(item.needed / (item.product.piecesPerBundle || 5))}</strong> bundles).
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payment QR and Checkout Form */}
        <div className="checkout-form-section">
          {/* Summary Box */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={styles.cardTitle}>Order Summary</h3>
            <div style={styles.divider}></div>
            <div style={styles.summaryRow}>
              <span>Total Pieces:</span>
              <strong>{totalItems} pieces</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <strong style={{ fontSize: '1.4rem', color: '#1a237e' }}>₹{totalAmount}</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              * Zero payment processing fees. Prices are ex-factory.
            </p>
          </div>

          {/* UPI Scan & Pay Section */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={styles.cardTitle}>
              <QrCode size={18} style={{ color: '#e2b04a', verticalAlign: 'middle', marginRight: '6px' }} />
              Step 1: Scan & Pay via UPI
            </h3>
            <div style={styles.divider}></div>
            
            <div className="upi-payment-wrapper">
              <div className="upi-qr-card">
                <img 
                  src={upiQrCodeUrl} 
                  alt="UPI Payment QR Code" 
                  style={{ width: '100%', display: 'block' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', display: 'block', fontWeight: '500' }}>
                  Scan to Pay ₹{totalAmount}
                </span>
              </div>

              <div className="upi-instructions">
                <p>Scan this QR code with any UPI app (GPay, PhonePe, Paytm, BHIM) to make an instant payment.</p>
                
                <div style={styles.infoBadge}>
                  <strong>UPI ID:</strong> <code>{upiId}</code>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', color: '#0d1160', marginBottom: '6px' }}>
                    Or Transfer via Bank Account:
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    A/C Name: <strong>J.G. Jeans</strong><br />
                    Bank: <strong>State Bank of India</strong><br />
                    A/C No: <strong>39845762012</strong><br />
                    IFSC: <strong>SBIN0000123</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Details & Screenshot upload */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={styles.cardTitle}>
              <FileText size={18} style={{ color: '#e2b04a', verticalAlign: 'middle', marginRight: '6px' }} />
              Step 2: Submit Details
            </h3>
            <div style={styles.divider}></div>

            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Delivery & Transport Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter shop name, local transport service preference, and full delivery address with Pincode..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Payment Receipt / Screenshot</label>
                <div style={styles.fileUploadContainer}>
                  <label htmlFor="screenshot-upload" style={styles.fileUploadLabel}>
                    <Upload size={20} />
                    <span>Choose Screenshot Image</span>
                  </label>
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    required
                  />
                  {screenshot && (
                    <div style={styles.fileName}>{screenshot.name}</div>
                  )}
                </div>

                {screenshotPreview && (
                  <div style={styles.receiptPreview}>
                    <img src={screenshotPreview} alt="Receipt Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              {!user ? (
                <div style={{ marginTop: '20px' }}>
                  <Link to="/login" className="btn btn-accent" style={{ width: '100%' }}>
                    Login / Register to Place Order
                  </Link>
                </div>
              ) : (
                <button
                  type="submit"
                  className={`btn ${isMoqMet ? 'btn-primary' : 'btn-disabled'}`}
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={loading || !isMoqMet}
                >
                  {loading ? 'Submitting Order...' : `Place Wholesale Order (₹${totalAmount})`}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  cardTitle: {
    fontSize: '1.1rem',
    color: '#0d1160',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '12px 0 20px 0'
  },
  metaDot: {
    margin: '0 8px',
    color: '#cbd5e1'
  },
  moqBlockWarning: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '20px',
    color: '#78350f'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  infoBadge: {
    display: 'inline-block',
    backgroundColor: '#f1f5f9',
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: '600',
    color: '#1e293b',
    marginTop: '8px',
    fontFamily: 'monospace'
  },
  fileUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px'
  },
  fileUploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    color: '#1a237e',
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  fileName: {
    fontSize: '0.85rem',
    color: '#475569',
    wordBreak: 'break-all'
  },
  receiptPreview: {
    marginTop: '16px',
    width: '100%',
    height: '180px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#f8fafc'
  },
  messageBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '24px',
    fontSize: '0.95rem'
  }
};

export default Cart;
