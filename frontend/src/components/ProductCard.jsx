import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);

  const displayImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop';

  const pricePer = product.pricePerPiece || product.price || 0;
  const piecesPerBundle = product.piecesPerBundle || 5;
  const pricePerBundle = pricePer * piecesPerBundle;

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHovered : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        <img
          src={displayImage}
          alt={product.name}
          style={{
            ...styles.img,
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop';
          }}
        />
        {/* Badge */}
        <div style={styles.typeBadge}>{product.type || 'Jeans'}</div>
        {/* Hover Overlay */}
        <div style={{ ...styles.overlay, opacity: hovered ? 1 : 0 }}>
          <Link to={`/products/${product._id}`} style={styles.overlayBtn}>
            <Eye size={15} /> Quick View
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Brand tag */}
        <span style={styles.brandTag}>{product.brand}</span>

        {/* Name */}
        <h3 style={styles.name} title={product.name}>{product.name}</h3>

        {/* Price row */}
        <div style={styles.priceRow}>
          <div>
            <div style={styles.priceMain}>₹{pricePer.toLocaleString('en-IN')} <span style={styles.priceUnit}>/ pc</span></div>
            <div style={styles.priceSub}>₹{pricePerBundle.toLocaleString('en-IN')} / bundle ({piecesPerBundle} pcs)</div>
          </div>
        </div>

        {/* MOQ */}
        <div style={styles.moqBadge}>
          Min. {product.moq} pcs · {Math.ceil(product.moq / piecesPerBundle)} bundles
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div style={styles.colorsRow}>
            {product.colors.slice(0, 4).map(c => (
              <div
                key={typeof c === 'object' ? c.name : c}
                title={typeof c === 'object' ? c.name : c}
                style={{
                  ...styles.colorDot,
                  backgroundColor: typeof c === 'object' ? c.hexCode : '#888',
                  border: '2px solid #fff',
                  outline: '1px solid #e2e8f0',
                }}
              />
            ))}
            {product.colors.length > 4 && (
              <span style={styles.moreColors}>+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link to={`/products/${product._id}`} style={styles.cta}>
          <ShoppingCart size={15} />
          See Product
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    height: '100%',
  },
  cardHovered: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(13,17,96,0.12)',
    borderColor: 'rgba(26,35,126,0.2)',
  },
  imgWrap: {
    position: 'relative',
    height: '220px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  typeBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: '#0d1160',
    color: '#e2b04a',
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    padding: '3px 9px',
    borderRadius: '4px',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(13,17,96,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.25s ease',
  },
  overlayBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    backgroundColor: '#ffffff',
    color: '#0d1160',
    padding: '9px 18px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transform: 'translateY(0)',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: '6px',
  },
  brandTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#1a237e',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    backgroundColor: 'rgba(26,35,126,0.06)',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  name: {
    fontSize: '0.97rem',
    fontWeight: '700',
    color: '#0d1160',
    lineHeight: '1.35',
    fontFamily: 'sans-serif',
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: '4px',
  },
  priceMain: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#10b981',
    lineHeight: 1,
  },
  priceUnit: {
    fontSize: '0.78rem',
    fontWeight: '500',
    color: '#64748b',
  },
  priceSub: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '3px',
  },
  moqBadge: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#78350f',
    backgroundColor: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.25)',
    padding: '3px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  colorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '2px',
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  moreColors: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: '600',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    marginTop: 'auto',
    padding: '10px 0',
    backgroundColor: '#0d1160',
    color: '#ffffff',
    borderRadius: '7px',
    fontWeight: '700',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  },
};

export default ProductCard;
