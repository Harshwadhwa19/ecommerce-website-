import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, totalAmount, totalItems, isMoqMet, underMoqItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isMoqMet) {
      alert('Please satisfy all Minimum Order Quantity (MOQ) requirements before proceeding!');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={styles.emptyContainer}>
        <ShoppingCart size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', margin: '15px 0' }}>Add wholesale items from our catalog to build your order.</p>
        <Link to="/catalogue" className="btn btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>Wholesale Shopping Cart</h2>
        <p>Review selected designs, verify bundle MOQ limits, and proceed to shipping details</p>
      </div>

      <div style={styles.cartLayout}>
        {/* Left Side: Cart Items List */}
        <div style={styles.cartItemsCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Selected Designs ({cartItems.length} styles)</h3>
            <div style={styles.divider}></div>
            
            {cartItems.map((item) => {
              const colorObj = item.product.colors?.find(c => (typeof c === 'object' ? c.name : c) === item.color);
              const itemImage = (colorObj && colorObj.images && colorObj.images.length > 0)
                ? colorObj.images[0]
                : (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&auto=format&fit=crop';

              return (
                <div key={`${item.product._id}-${item.color}`} style={styles.cartItemRow}>
                  <img 
                    src={itemImage} 
                    alt={item.product.name} 
                    style={styles.itemThumbnail}
                  />
                
                <div style={styles.itemInfo}>
                  <span className="badge badge-brand" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{item.product.brand}</span>
                  <h4 style={styles.itemTitle}>{item.product.name}</h4>
                  <div style={styles.itemMetaInfo}>
                    <span>Color: <strong>{item.color}</strong></span>
                    <span style={styles.metaDot}>•</span>
                    <span>Sizes: <strong>28, 30, 32, 34, 36 (Assorted)</strong></span>
                  </div>
                </div>

                <div style={styles.qtyControls}>
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.color, item.bundleQty - 1)}
                    style={styles.qtyBtn}
                  >
                    -1
                  </button>
                  <div style={styles.qtyDisplay}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.bundleQty} {item.bundleQty === 1 ? 'bundle' : 'bundles'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({item.bundleQty * item.piecesPerBundle} pcs)</div>
                  </div>
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.color, item.bundleQty + 1)}
                    style={styles.qtyBtn}
                  >
                    +1
                  </button>
                </div>

                <div style={styles.priceColumn}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{item.pricePerPiece}/pc</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>₹{item.pricePerPiece * item.piecesPerBundle}/bundle</span>
                  <div style={styles.subtotalValue}>₹{item.totalPrice.toLocaleString('en-IN')}</div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product._id, item.color)}
                  style={styles.deleteBtn}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            })}

            {/* Cart MOQ Indicators */}
            {!isMoqMet && (
              <div style={styles.moqWarningBox}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', margin: '0 0 8px 0' }}>
                  <AlertTriangle size={18} /> Minimum Order Quantity (MOQ) Not Met
                </h4>
                <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                  Wholesale orders are packed by styles. The following items do not meet the minimum factory production size:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: '#78350f' }}>
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

        {/* Right Side: Price Details Sidebar */}
        <div style={styles.priceSidebarCol}>
          <div style={styles.card}>
            <h3 style={styles.priceSidebarHeader}>PRICE DETAILS</h3>
            <div style={styles.divider}></div>
            
            <div style={styles.priceRow}>
              <span>Subtotal ({totalItems} pieces)</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={styles.priceRow}>
              <span>Delivery Charges</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>Ex-Factory</span>
            </div>

            <div style={styles.priceRow}>
              <span>Bales Packaging</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={styles.totalPayableRow}>
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              className={`btn ${isMoqMet ? 'btn-primary' : 'btn-disabled'}`}
              style={{ width: '100%', marginTop: '20px', padding: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={!isMoqMet}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
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
  emptyContainer: {
    padding: '120px 24px 80px 24px',
    textAlign: 'center'
  },
  cartLayout: {
    display: 'grid',
    gridTemplateColumns: '2.2fr 1fr',
    gap: '24px',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
      gap: '30px'
    }
  },
  cartItemsCol: {
    width: '100%'
  },
  priceSidebarCol: {
    width: '100%',
    position: 'sticky',
    top: '90px'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  cardTitle: {
    fontSize: '1rem',
    color: '#0d1160',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  priceSidebarHeader: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#878787',
    margin: 0
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '12px 0 20px 0'
  },
  cartItemRow: {
    display: 'flex',
    gap: '20px',
    padding: '20px 0',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  },
  itemThumbnail: {
    width: '70px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    flexShrink: 0
  },
  itemInfo: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  itemTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0d1160',
    margin: '4px 0 0 0'
  },
  itemMetaInfo: {
    fontSize: '0.82rem',
    color: '#64748b'
  },
  metaDot: {
    margin: '0 8px',
    color: '#cbd5e1'
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  qtyBtn: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: '#f1f5f9',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#0d1160'
  },
  qtyDisplay: {
    padding: '4px 8px',
    textAlign: 'center',
    minWidth: '90px',
    backgroundColor: '#ffffff'
  },
  priceColumn: {
    textAlign: 'right',
    minWidth: '130px'
  },
  subtotalValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#1a237e',
    marginTop: '4px'
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      color: '#ef4444',
      backgroundColor: '#fee2e2'
    }
  },
  moqWarningBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '4px',
    padding: '16px',
    marginTop: '20px',
    color: '#78350f'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.92rem',
    color: '#212121',
    marginBottom: '14px'
  },
  totalPayableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#212121',
    marginTop: '12px'
  }
};

export default Cart;
