import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, MapPin, ClipboardList, CreditCard, 
  Upload, QrCode, ShieldAlert, ArrowLeft, Loader2 
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalAmount, totalItems, isMoqMet, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Active Step: 1 = Shipping, 2 = Summary, 3 = Payment
  const [activeStep, setActiveStep] = useState(1);

  // Form States
  const [storeName, setStoreName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Payment states
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  
  // Submit states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setStoreName(user.shopName || '');
      setBuyerName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Guard: If cart is empty or MOQ not met, redirect to Cart page
  useEffect(() => {
    if (cartItems.length === 0 || !isMoqMet) {
      navigate('/cart');
    }
  }, [cartItems, isMoqMet, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!storeName.trim() || !buyerName.trim() || !phone.trim() || !shippingAddress.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setError('Please fill in all required shipping details.');
      return;
    }
    setError('');
    setActiveStep(2); // Advance to Summary
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload the transaction screenshot first.');
      return;
    }

    setLoading(true);
    setError('');

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
      formData.append('storeName', storeName);
      formData.append('buyerName', buyerName);
      formData.append('phone', phone);
      formData.append('shippingAddress', shippingAddress);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('gstNumber', gstNumber);
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
        navigate('/order-success', {
          state: {
            orderId: result.data._id,
            totalAmount: result.data.totalAmount
          },
          replace: true
        });
      } else {
        setError(result.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setError('Connection failure. Check your internet connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate UPI qr details
  const upiId = '8087351633@okbizaxis';
  const upiName = 'J G Jeans';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&tn=JGWholesaleOrder&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="container" style={styles.container}>
      <Link to="/cart" style={styles.backLink}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div style={styles.checkoutLayout}>
        
        {/* Left Side: Flipkart Accordion Steps */}
        <div style={styles.accordionContainer}>
          
          {/* STEP 1: SHIPPING DETAILS */}
          <div style={{
            ...styles.stepCard,
            borderLeft: activeStep === 1 ? '4px solid #1a237e' : '1px solid #e2e8f0'
          }}>
            <div 
              style={{
                ...styles.stepHeader,
                backgroundColor: activeStep === 1 ? '#f8fafc' : '#ffffff'
              }}
              onClick={() => activeStep > 1 && setActiveStep(1)}
            >
              <div style={styles.stepTitleGroup}>
                <span style={{
                  ...styles.stepBadge,
                  backgroundColor: activeStep > 1 ? '#10b981' : '#1a237e',
                  color: '#ffffff'
                }}>
                  {activeStep > 1 ? <CheckCircle size={14} /> : '1'}
                </span>
                <span style={styles.stepTitle}>Delivery Shipping Address</span>
              </div>
              {activeStep > 1 && (
                <button style={styles.editBtn}>EDIT</button>
              )}
            </div>

            {activeStep === 1 ? (
              <form onSubmit={handleShippingSubmit} style={styles.stepBody}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Firm / Store Name *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={storeName} 
                      onChange={(e) => setStoreName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Buyer Name *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={buyerName} 
                      onChange={(e) => setBuyerName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mobile Number (WhatsApp) *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>GSTIN (Optional)</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      value={gstNumber} 
                      onChange={(e) => setGstNumber(e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ ...styles.formGroup, marginTop: '12px' }}>
                  <label style={styles.label}>Shipping Address / Transport Station *</label>
                  <textarea 
                    style={styles.textarea} 
                    rows="2"
                    placeholder="Enter transport service preference or detailed delivery address..."
                    value={shippingAddress} 
                    onChange={(e) => setShippingAddress(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ ...styles.formGrid, marginTop: '12px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>City *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>State *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={state} 
                      onChange={(e) => setState(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Pincode *</label>
                    <input 
                      type="text" 
                      style={styles.input} 
                      value={pincode} 
                      onChange={(e) => setPincode(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={styles.continueBtn}>
                  Deliver to This Address
                </button>
              </form>
            ) : (
              <div style={styles.summaryDisplay}>
                <div style={{ fontWeight: 'bold', color: '#0d1160' }}>{storeName} ({buyerName})</div>
                <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '4px' }}>
                  {shippingAddress}, {city}, {state} - {pincode} | Phone: {phone}
                </div>
                {gstNumber && (
                  <div style={{ color: '#1a237e', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>
                    GSTIN: {gstNumber}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: ORDER SUMMARY */}
          <div style={{
            ...styles.stepCard,
            borderLeft: activeStep === 2 ? '4px solid #1a237e' : '1px solid #e2e8f0'
          }}>
            <div 
              style={{
                ...styles.stepHeader,
                backgroundColor: activeStep === 2 ? '#f8fafc' : '#ffffff'
              }}
              onClick={() => activeStep > 2 && setActiveStep(2)}
            >
              <div style={styles.stepTitleGroup}>
                <span style={{
                  ...styles.stepBadge,
                  backgroundColor: activeStep > 2 ? '#10b981' : activeStep === 2 ? '#1a237e' : '#cbd5e1',
                  color: activeStep >= 2 ? '#ffffff' : '#475569'
                }}>
                  {activeStep > 2 ? <CheckCircle size={14} /> : '2'}
                </span>
                <span style={styles.stepTitle}>Order Summary & Items</span>
              </div>
              {activeStep > 2 && (
                <button style={styles.editBtn}>EDIT</button>
              )}
            </div>

            {activeStep === 2 && (
              <div style={styles.stepBody}>
                <div style={styles.summaryList}>
                  {cartItems.map((item) => {
                    const colorObj = item.product.colors?.find(c => (typeof c === 'object' ? c.name : c) === item.color);
                    const itemImage = (colorObj && colorObj.images && colorObj.images.length > 0)
                      ? colorObj.images[0]
                      : (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&auto=format&fit=crop';

                    return (
                      <div key={`${item.product._id}-${item.color}`} style={styles.summaryItemRow}>
                        <img 
                          src={itemImage} 
                          alt={item.product.name} 
                          style={styles.summaryItemImg}
                        />
                      <div style={{ flexGrow: 1 }}>
                        <div style={styles.summaryItemTitle}>{item.product.name}</div>
                        <div style={styles.summaryItemSubtitle}>
                          Brand: <strong>{item.product.brand}</strong> | Color: <strong>{item.color}</strong>
                        </div>
                        <div style={styles.summaryItemSubtitle}>
                          Pieces Per Bundle: <strong>{item.piecesPerBundle || 5} pcs</strong> | Total Pieces: <strong>{item.bundleQty * (item.piecesPerBundle || 5)} pcs</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <div style={styles.summaryItemPrice}>₹{item.totalPrice.toLocaleString('en-IN')}</div>
                        <div style={styles.summaryItemQty}>
                          {item.bundleQty} {item.bundleQty === 1 ? 'bundle' : 'bundles'} ({item.bundleQty * item.piecesPerBundle} pcs)
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                <div style={styles.totalSumBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total Style Items:</span>
                    <strong>{cartItems.length} styles</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total Pieces:</span>
                    <strong>{totalItems} garments</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: '#1a237e', fontWeight: 'bold' }}>
                    <span>Subtotal Amount:</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveStep(3)} 
                  className="btn btn-primary" 
                  style={styles.continueBtn}
                >
                  Confirm Items & Pay
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT & SCREENSHOT */}
          <div style={{
            ...styles.stepCard,
            borderLeft: activeStep === 3 ? '4px solid #1a237e' : '1px solid #e2e8f0'
          }}>
            <div style={{
              ...styles.stepHeader,
              backgroundColor: activeStep === 3 ? '#f8fafc' : '#ffffff'
            }}>
              <div style={styles.stepTitleGroup}>
                <span style={{
                  ...styles.stepBadge,
                  backgroundColor: activeStep === 3 ? '#1a237e' : '#cbd5e1',
                  color: activeStep === 3 ? '#ffffff' : '#475569'
                }}>
                  3
                </span>
                <span style={styles.stepTitle}>Professional UPI Scan & Pay</span>
              </div>
            </div>

            {activeStep === 3 && (
              <div style={styles.stepBody}>
                {error && (
                  <div style={styles.errorBanner}>
                    <ShieldAlert size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={styles.paymentFlex}>
                  <div style={styles.qrCard}>
                    <img src={qrCodeUrl} alt="UPI Payment QR" style={styles.qrImage} />
                    <div style={styles.qrFooterText}>
                      <QrCode size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Scan QR Code with GPay/PhonePe
                    </div>
                  </div>

                  <div style={styles.paymentInfo}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      Transfer the exact amount to complete your B2B wholesale order booking.
                    </p>

                    <div style={styles.detailBadge}>
                      <span style={styles.detailBadgeLabel}>Merchant Business:</span>
                      <strong style={styles.detailBadgeValue}>{upiName}</strong>
                    </div>

                    <div style={{ ...styles.detailBadge, marginTop: '8px' }}>
                      <span style={styles.detailBadgeLabel}>UPI ID:</span>
                      <strong style={styles.detailBadgeValue}>{upiId}</strong>
                    </div>

                    <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0d1160', display: 'block', marginBottom: '4px' }}>
                        Or Direct Bank Transfer:
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                        A/C: <strong>39845762012</strong> (SBI)<br />
                        IFSC: <strong>SBIN0000123</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.screenshotSection}>
                  <h4 style={styles.sectionHeaderTitle}>Upload Payment Screenshot *</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 12px 0' }}>
                    Screenshots are verified manually before packaging and dispatching.
                  </p>

                  <div style={styles.uploadRow}>
                    <label htmlFor="screenshot-input" style={styles.uploadLabelBtn}>
                      <Upload size={18} /> Choose Screenshot
                    </label>
                    <input 
                      id="screenshot-input"
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                      required
                    />
                    {screenshot && (
                      <span style={styles.uploadedFileName}>{screenshot.name}</span>
                    )}
                  </div>

                  {screenshotPreview && (
                    <div style={styles.screenshotPreviewBox}>
                      <img src={screenshotPreview} alt="Screenshot Preview" style={styles.previewImage} />
                    </div>
                  )}
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="btn btn-primary"
                  style={{
                    ...styles.placeOrderBtn,
                    backgroundColor: screenshot ? '#10b981' : '#cbd5e1',
                    borderColor: screenshot ? '#10b981' : '#cbd5e1',
                    cursor: screenshot ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!screenshot || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner" style={{ marginRight: '6px' }} />
                      Registering Wholesale Order...
                    </>
                  ) : (
                    `Place Wholesale Order (₹${totalAmount.toLocaleString('en-IN')})`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Flipkart Style Price Details Sticky Sidebar */}
        <div style={styles.sidebarContainer}>
          <div style={styles.priceDetailsCard}>
            <h3 style={styles.priceHeader}>PRICE DETAILS</h3>
            <div style={styles.divider}></div>
            
            <div style={styles.priceRow}>
              <span>Price ({totalItems} pieces)</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={styles.priceRow}>
              <span>Delivery Charges</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>Ex-Factory</span>
            </div>

            <div style={styles.priceRow}>
              <span>Packaging/Bales</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={styles.totalRow}>
              <span>Total Payable</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={styles.safeShieldBanner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Safe and Secure Payments. 100% Genuine factory products.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '110px 24px 60px 24px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '0.9rem',
    textDecoration: 'none',
    marginBottom: '20px',
    fontWeight: '500'
  },
  checkoutLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'start',
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr',
      gap: '30px'
    }
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  stepCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  stepHeader: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  stepTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  stepBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem'
  },
  stepTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0d1160',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  editBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    color: '#1a237e',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '6px 16px',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  stepBody: {
    padding: '24px',
    borderTop: '1px solid #f1f5f9'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#1a237e'
    }
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  continueBtn: {
    marginTop: '20px',
    padding: '12px 24px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryDisplay: {
    padding: '16px 24px 24px 60px',
    backgroundColor: '#ffffff'
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px'
  },
  summaryItemRow: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  },
  summaryItemImg: {
    width: '60px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    flexShrink: 0
  },
  summaryItemTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0d1160'
  },
  summaryItemSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '4px'
  },
  summaryItemPrice: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0d1160'
  },
  summaryItemQty: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '4px'
  },
  totalSumBlock: {
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    color: '#334155'
  },
  paymentFlex: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 2fr',
    gap: '24px',
    marginBottom: '24px',
    alignItems: 'center',
    '@media (max-width: 576px)': {
      gridTemplateColumns: '1fr',
      gap: '20px'
    }
  },
  qrCard: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  },
  qrImage: {
    width: '100%',
    maxWidth: '180px',
    aspectRatio: '1/1',
    display: 'block',
    margin: '0 auto'
  },
  qrFooterText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '10px',
    fontWeight: '500'
  },
  paymentInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '0.85rem'
  },
  detailBadgeLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  detailBadgeValue: {
    color: '#1e293b',
    fontFamily: 'monospace'
  },
  screenshotSection: {
    marginTop: '24px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px'
  },
  sectionHeaderTitle: {
    fontSize: '0.95rem',
    color: '#0d1160',
    fontWeight: '700',
    margin: 0
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px'
  },
  uploadLabelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    color: '#1a237e',
    padding: '10px 18px',
    borderRadius: '4px',
    border: '1px dashed #cbd5e1',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  uploadedFileName: {
    fontSize: '0.85rem',
    color: '#475569'
  },
  screenshotPreviewBox: {
    marginTop: '16px',
    width: '100%',
    height: '200px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#f8fafc'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  placeOrderBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #f87171',
    borderRadius: '4px',
    padding: '12px 16px',
    fontSize: '0.88rem',
    marginBottom: '20px'
  },
  sidebarContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'sticky',
    top: '90px'
  },
  priceDetailsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  priceHeader: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#878787',
    margin: 0
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '12px 0'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.92rem',
    color: '#212121',
    marginBottom: '14px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#212121',
    marginTop: '12px'
  },
  safeShieldBanner: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '16px',
    fontSize: '0.82rem',
    color: '#64748b',
    lineHeight: '1.4'
  }
};

export default Checkout;
