import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, ShieldAlert, Check, HelpCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [selectedColor, setSelectedColor] = useState('');
  const [bundleQty, setBundleQty] = useState(10);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        const result = await response.json();
        if (result.success) {
          setProduct(result.data);
          // Set initial defaults
          if (result.data.colors && result.data.colors.length > 0) {
            const firstColor = result.data.colors[0];
            setSelectedColor(typeof firstColor === 'object' ? firstColor.name : firstColor);
          }
          const defaultMoq = result.data.moq || 50;
          const piecesPerBundle = result.data.piecesPerBundle || 5;
          setBundleQty(Math.ceil(defaultMoq / piecesPerBundle));
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        setError('Error connecting to server.');
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, bundleQty, selectedColor);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h3>Error Loading Product</h3>
        <p style={{ color: '#ef4444', margin: '15px 0' }}>{error || 'The requested product could not be found.'}</p>
        <Link to="/catalogue" className="btn btn-primary">Back to Catalogue</Link>
      </div>
    );
  }

  const piecesPerBundle = product.piecesPerBundle || 5;
  const totalPieces = bundleQty * piecesPerBundle;
  const isQuantityBelowMOQ = totalPieces < product.moq;
  const displayImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop';

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      {/* Back Button */}
      <Link to="/catalogue" style={styles.backLink}>
        <ArrowLeft size={16} /> Back to Catalogue
      </Link>

      <div style={styles.detailGrid}>
        {/* Product Images */}
        <div style={styles.imageCol}>
          <div style={styles.imageCard}>
            <img 
              src={displayImage} 
              alt={product.name} 
              style={styles.mainImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Product Configuration */}
        <div style={styles.infoCol}>
          <div style={styles.header}>
            <span className="badge badge-brand" style={{ fontSize: '0.85rem' }}>{product.brand}</span>
            <h1 className="brand-font" style={styles.title}>{product.name}</h1>
            <span style={styles.typeText}>{product.type}</span>
          </div>

          <div style={styles.priceRow}>
            <div>
              <span style={styles.metaLabel}>Wholesale Rate</span>
              <div style={styles.priceVal}>
                ₹{product.pricePerPiece} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ piece</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                ₹{product.pricePerPiece * piecesPerBundle} / bundle ({piecesPerBundle} pieces)
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={styles.metaLabel}>Minimum Order</span>
              <div style={styles.moqVal}>{product.moq} pieces</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                ({Math.ceil(product.moq / piecesPerBundle)} bundles minimum)
              </div>
            </div>
          </div>

          {/* Bundle Breakdown Details */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Bundle Specifications</h4>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.9rem',
              color: '#334155',
              lineHeight: '1.5'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '8px', color: '#0d1160' }}>
                Each bundle is color-specific and contains exactly 5 pieces in assorted sizes:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center', marginTop: '10px' }}>
                {['28', '30', '32', '34', '36'].map(sz => (
                  <div key={sz} style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 4px',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Size</div>
                    <div style={{ fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>{sz}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>1 pc</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Select Color</h4>
            <div style={styles.optionsList}>
              {product.colors.map(color => {
                const colorName = typeof color === 'object' ? color.name : color;
                const isSelected = selectedColor === colorName;
                return (
                  <button
                    key={colorName}
                    onClick={() => setSelectedColor(colorName)}
                    style={{
                      ...styles.colorBtn,
                      backgroundColor: isSelected ? '#e2b04a' : '#f1f5f9',
                      color: '#0d1160',
                      borderColor: isSelected ? '#e2b04a' : '#cbd5e1',
                      fontWeight: isSelected ? '700' : '500'
                    }}
                  >
                    {isSelected && <Check size={14} style={{ marginRight: '4px' }} />}
                    {colorName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Order constraints */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Wholesale Order Quantity (Bundles)</h4>
            <div style={styles.qtyRow}>
              <div style={styles.qtySpinner}>
                <button 
                  onClick={() => setBundleQty(q => Math.max(1, q - 1))} 
                  style={styles.spinnerBtn}
                >
                  -1 Bundle
                </button>
                <input
                  type="number"
                  value={bundleQty}
                  onChange={(e) => setBundleQty(Math.max(1, Number(e.target.value)))}
                  style={styles.qtyInput}
                />
                <button 
                  onClick={() => setBundleQty(q => q + 1)} 
                  style={styles.spinnerBtn}
                >
                  +1 Bundle
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0d1160' }}>
                  Total Pieces: {totalPieces}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  * Calculated as {bundleQty} bundles × {piecesPerBundle} pieces = {totalPieces} pieces.
                </span>
              </div>
            </div>

            {isQuantityBelowMOQ && (
              <div style={styles.warningBanner}>
                <ShieldAlert size={18} />
                <span>
                  <strong>Warning:</strong> MOQ is <strong>{product.moq} pieces</strong>. You currently have <strong>{totalPieces} pieces</strong> selected. You can still add to cart, but checkout requires total items of this style to be ≥ {product.moq} pieces.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ marginBottom: '15px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Estimated Total Price</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                ₹{(totalPieces * product.pricePerPiece).toLocaleString('en-IN')}
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={styles.addToCartBtn}
              disabled={!product.inStock}
            >
              <ShoppingCart size={18} /> Add to Wholesale Cart
            </button>
            
            {addedMessage && (
              <div style={styles.successBanner}>
                <Check size={16} /> Added successfully! You can see it in your <Link to="/cart" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }}>Cart</Link>.
              </div>
            )}
          </div>

          {/* Description */}
          <div style={styles.descriptionSection}>
            <h4 style={styles.sectionTitle}>Product Details</h4>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {product.description || 'No detailed specifications are listed for this design. Reach out to factory sales support for fabrics, dyes, and finish inquiries.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '24px'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.5fr',
    gap: '50px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
      gap: '30px'
    }
  },
  imageCol: {
    width: '100%'
  },
  imageCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  mainImage: {
    width: '100%',
    borderRadius: '8px',
    aspectRatio: '3/4',
    objectFit: 'cover'
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '2rem',
    color: '#0d1160',
    marginTop: '10px',
    marginBottom: '6px'
  },
  typeText: {
    color: '#64748b',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px dashed #e2b04a',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '24px'
  },
  metaLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    display: 'block',
    marginBottom: '4px'
  },
  priceVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a237e'
  },
  moqVal: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#e2b04a'
  },
  section: {
    marginBottom: '24px'
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: '0.95rem',
    color: '#0d1160',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  },
  sizeChartBtn: {
    backgroundColor: 'transparent',
    color: '#1a237e',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  sizeChartTableContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  sizeChartTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'center',
    th: {
      backgroundColor: '#f8fafc',
      color: '#475569',
      padding: '8px',
      fontWeight: '600',
      borderBottom: '1px solid #cbd5e1'
    },
    td: {
      padding: '8px',
      borderBottom: '1px solid #f1f5f9'
    }
  },
  optionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  optionBtn: {
    minWidth: '45px',
    height: '45px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorBtn: {
    padding: '10px 18px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center'
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  qtySpinner: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  },
  spinnerBtn: {
    padding: '10px 14px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    fontWeight: '700',
    color: '#0d1160',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#cbd5e1'
    }
  },
  qtyInput: {
    width: '60px',
    textAlign: 'center',
    border: 'none',
    fontWeight: '700',
    color: '#1a237e',
    outline: 'none',
    MozAppearance: 'textfield' // removes spinner inside browser
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: '12px 16px',
    borderRadius: '4px',
    color: '#78350f',
    fontSize: '0.85rem',
    marginTop: '12px'
  },
  addToCartBtn: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '1.05rem'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '4px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    marginTop: '12px'
  },
  descriptionSection: {
    marginTop: '30px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px'
  }
};

export default ProductDetail;
