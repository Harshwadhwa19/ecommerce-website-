import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import {
  ArrowRight, ShoppingBag, ShieldCheck, Truck,
  CheckCircle2, Award, Star, Package, BadgeCheck,
  PhoneCall, MapPin, Clock, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Rajesh Khatri', city: 'Mumbai', rating: 5, text: 'Best wholesale rates in Ulhasnagar. Quality is consistent batch after batch. Have been ordering for 2 years.' },
  { name: 'Sunita Textiles', city: 'Surat', rating: 5, text: 'The bundle system is very convenient. Assorted sizes sell fast. Fast PAN India delivery too.' },
  { name: 'Amit Garments', city: 'New Delhi', rating: 5, text: 'CK2 brand jeans are a bestseller. Factory direct pricing means better margins. Highly recommended.' },
  { name: 'Priya Fashion', city: 'Pune', rating: 4, text: 'Reliable supplier for 3 seasons. Cax & King collection always has great demand. Excellent support.' },
];

const FAQS = [
  { q: 'Do you deliver across India?', a: 'Yes, we provide PAN India delivery. Orders are dispatched within 24 hours of payment confirmation and tracked end-to-end.' },
  { q: 'What is the minimum order quantity (MOQ)?', a: 'MOQ varies by product, typically 50 pieces (10 bundles of 5 pcs each). Each bundle contains 1 piece per size (28–36).' },
  { q: 'Do you offer factory / wholesale pricing?', a: 'Yes. We are a direct manufacturer — no middlemen. You get factory-direct rates which means better margins for your retail business.' },
  { q: 'Which brands are available?', a: 'We manufacture under three premium brands: Cax & King, 7 GRM®, and CK2 — available across jeans and trouser categories.' },
  { q: 'How do I pay for my order?', a: 'We accept UPI payments. After placing your order online, scan our QR code or use our UPI ID and upload the payment screenshot.' },
  { q: 'What are your business hours?', a: 'We are open Tuesday to Sunday, 10:00 AM to 9:00 PM. We are closed on Mondays.' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const result = await res.json();
        if (result.success) setFeaturedProducts(result.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          {/* Left */}
          <div style={s.heroLeft}>
            <div style={s.heroPill}>📍 Parushah Market, Ulhasnagar — Maharashtra</div>
            <h1 style={s.heroTitle}>
              Premium Wholesale<br />
              <span style={{ color: '#e2b04a' }}>Jeans & Trousers</span>
            </h1>
            <p style={s.heroTagline}>"Sai Jeevan Ghot Ki Jai" — Direct from Factory</p>
            <p style={s.heroDesc}>
              Bulk wholesale orders at manufacturer rates. PAN India delivery.
              Trusted by 500+ retailers across India.
            </p>
            <div style={s.heroBtns}>
              <Link to="/catalogue" style={s.btnPrimary}>Browse Catalogue <ArrowRight size={16} /></Link>
              <a href="tel:8087351633" style={s.btnSecondary}>📞 Call Now</a>
            </div>
          </div>

          {/* Right — Stats */}
          <div style={s.heroRight}>
            {[
              { num: '500+', label: 'Retailers Served' },
              { num: '3', label: 'Premium Brands' },
              { num: '10+', label: 'Years in Wholesale' },
              { num: 'PAN India', label: 'Delivery' },
            ].map(item => (
              <div key={item.label} style={s.statCard}>
                <div style={s.statNum}>{item.num}</div>
                <div style={s.statLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ BRANDS BAR ══════════════════════ */}
      <section id="brands-section" style={s.brandsBar}>
        <div style={s.brandsInner}>
          <span style={s.brandBarLabel}>OUR BRANDS</span>
          <div style={s.brandsDividerV} />
          <div style={s.brandsGroup}>
            <span style={s.brandName}>Cax & King</span>
            <span style={s.brandSep}>|</span>
            <span style={s.brandName}>7 GRM®</span>
            <span style={s.brandSep}>|</span>
            <span style={s.brandName}>CK2</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TRUST STRIP ══════════════════════ */}
      <section style={s.trustStrip}>
        <div style={s.trustInner}>
          {[
            { icon: <BadgeCheck size={18} />, text: 'GST Registered' },
            { icon: <Award size={18} />, text: 'Factory Direct Pricing' },
            { icon: <Package size={18} />, text: 'Wholesale Since 2010' },
            { icon: <Star size={18} />, text: 'Trusted by 500+ Retailers' },
            { icon: <Truck size={18} />, text: 'PAN India Delivery' },
            { icon: <ShieldCheck size={18} />, text: 'Quality Guaranteed' },
          ].map(item => (
            <div key={item.text} style={s.trustItem}>
              <span style={s.trustIcon}>{item.icon}</span>
              <span style={s.trustText}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ OUR COLLECTION ══════════════════════ */}
      <section style={s.collectionSection}>
        <div style={s.sectionContainer}>
          <div style={s.sectionHeader}>
            <div style={s.sectionHeaderLeft}>
              <span style={s.sectionTag}>Latest Stock</span>
              <h2 style={s.sectionTitle}>Our Collection</h2>
              <p style={s.sectionSubtitle}>Jeans & Trousers — bulk orders welcome · MOQ applies</p>
            </div>
            <Link to="/catalogue" style={s.seeAllLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.loadingSpinner} />
              <p style={{ color: '#64748b', marginTop: '12px' }}>Loading catalogue...</p>
            </div>
          ) : (
            <div style={s.productGrid}>
              {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════ WHY CHOOSE US ══════════════════════ */}
      <section style={s.whySection}>
        <div style={s.sectionContainer}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={s.sectionTag}>Why J.G. Jeans</span>
            <h2 style={s.sectionTitleCentered}>Built for Wholesale Retailers</h2>
            <p style={s.sectionSubtitleCentered}>
              Every feature designed to help your retail business grow
            </p>
          </div>
          <div style={s.featureGrid}>
            {[
              { icon: <Award size={26} />, title: 'Direct Manufacturer', desc: 'Factory to your shop — no middlemen, no markup. Best prices guaranteed.' },
              { icon: <Truck size={26} />, title: 'PAN India Shipping', desc: 'Fast and reliable delivery across all states. Track your order in real-time.' },
              { icon: <Package size={26} />, title: 'Bundle System', desc: 'Color-specific bundles of 5 pieces in assorted sizes 28–36. Easy to sell.' },
              { icon: <ShieldCheck size={26} />, title: 'Quality Assured', desc: 'Every piece inspected before dispatch. Consistent quality every time.' },
              { icon: <Star size={26} />, title: 'Premium Brands', desc: 'Cax & King, 7 GRM®, CK2 — brands retailers trust and customers demand.' },
              { icon: <CheckCircle2 size={26} />, title: 'Easy Ordering', desc: 'Simple online portal. Browse, add to cart, pay via UPI, done.' },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIconBox}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW TO ORDER ══════════════════════ */}
      <section style={s.howSection}>
        <div style={s.sectionContainer}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ ...s.sectionTag, color: '#e2b04a', borderColor: 'rgba(226,176,74,0.3)', backgroundColor: 'rgba(226,176,74,0.08)' }}>Simple Process</span>
            <h2 style={{ ...s.sectionTitleCentered, color: '#ffffff' }}>How to Place an Order</h2>
            <p style={{ ...s.sectionSubtitleCentered, color: '#94a3b8' }}>4 steps to get wholesale stock at your doorstep</p>
          </div>
          <div style={s.stepsGrid}>
            {[
              { n: '01', title: 'Browse Catalogue', desc: 'Explore jeans & trousers across all brands and styles.' },
              { n: '02', title: 'Add to Cart', desc: 'Select color, choose bundle quantity (min. MOQ applies).' },
              { n: '03', title: 'Pay via UPI', desc: 'Scan QR or use UPI ID. Instant confirmation.' },
              { n: '04', title: 'Receive Delivery', desc: 'Ships within 24 hrs. PAN India, tracked delivery.' },
            ].map((step, i) => (
              <div key={step.n} style={s.stepCard}>
                <div style={s.stepNumber}>{step.n}</div>
                {i < 3 && <div style={s.stepArrow}>→</div>}
                <h4 style={s.stepTitle}>{step.title}</h4>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <Link to="/catalogue" style={s.btnPrimary}>Start Ordering <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: '64px 0', borderTop: '1px solid #e2e8f0' }}>
        <div style={s.sectionContainer}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={s.sectionTag}>Social Proof</span>
            <h2 style={s.sectionTitleCentered}>What Retailers Say</h2>
            <p style={s.sectionSubtitleCentered}>Trusted by 500+ retailers across India</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} style={{ color: '#e2b04a', fill: '#e2b04a' }} />)}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.7', fontStyle: 'italic', flexGrow: 1, marginBottom: '16px' }}>"{t.text}"</p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontWeight: '700', color: '#0d1160', fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.775rem', color: '#94a3b8', marginTop: '2px' }}>📍 {t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FAQ ══════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: '64px 0', borderTop: '1px solid #e2e8f0' }}>
        <div style={s.sectionContainer}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={s.sectionTag}>FAQ</span>
            <h2 style={s.sectionTitleCentered}>Frequently Asked Questions</h2>
            <p style={s.sectionSubtitleCentered}>Everything you need to know before placing a wholesale order</p>
          </div>
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((item, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', backgroundColor: openFaq === i ? '#eef2ff' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <span style={{ fontWeight: '700', color: '#0d1160', fontSize: '0.95rem' }}>{item.q}</span>
                  <span style={{ color: '#1a237e', flexShrink: 0, marginLeft: '12px', display: 'flex' }}>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 18px', backgroundColor: '#eef2ff', fontSize: '0.9rem', color: '#475569', lineHeight: '1.7' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CONTACT ══════════════════════ */}

      <section id="contact-section" style={s.contactSection}>
        <div style={s.sectionContainer}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={s.sectionTag}>Get in Touch</span>
            <h2 style={s.sectionTitleCentered}>Visit or Contact Us</h2>
            <p style={s.sectionSubtitleCentered}>Open Tuesday – Sunday, 10:00 AM – 9:00 PM · Monday Closed</p>
          </div>

          <div style={s.contactGrid}>
            <div style={s.contactCard}>
              <div style={s.contactIconBox}><MapPin size={22} /></div>
              <h4 style={s.contactCardTitle}>Our Location</h4>
              <p style={s.contactCardText}>
                Shop No. 32, Parushah Market<br />
                Basant Bahar Road<br />
                Ulhasnagar – 421 005<br />
                Maharashtra, India
              </p>
            </div>

            <div style={s.contactCard}>
              <div style={s.contactIconBox}><PhoneCall size={22} /></div>
              <h4 style={s.contactCardTitle}>CONTACT INFORMATION</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', textAlign: 'left' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>📞 Primary Sales & Order Support</span>
                  <a href="tel:8087351633" style={s.contactLink}>8087351633</a>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>📞 Alternate Contact 1</span>
                  <a href="tel:9623018183" style={s.contactLink}>9623018183</a>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>📞 Alternate Contact 2</span>
                  <a href="tel:9324537061" style={s.contactLink}>9324537061</a>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>📧 Business Email</span>
                  <a href="mailto:j.g.jeans0@gmail.com" style={s.contactLink}>j.g.jeans0@gmail.com</a>
                </div>
              </div>
              <a
                href="https://wa.me/918087351633?text=Hi, I want to place a wholesale order"
                target="_blank"
                rel="noreferrer"
                style={s.whatsappBtn}
              >
                <MessageCircle size={16} /> WhatsApp Now
              </a>
            </div>

            <div style={s.contactCard}>
              <div style={s.contactIconBox}><Clock size={22} /></div>
              <h4 style={s.contactCardTitle}>Business Hours</h4>
              <p style={s.contactCardText}>
                <strong style={{ color: '#0d1160' }}>Tue – Sun</strong><br />
                10:00 AM – 9:00 PM<br /><br />
                <strong style={{ color: '#ef4444' }}>Monday</strong><br />
                <span style={{ color: '#ef4444' }}>Closed</span>
              </p>
            </div>

            <div style={s.contactCard}>
              <div style={s.contactIconBox}><ShoppingBag size={22} /></div>
              <h4 style={s.contactCardTitle}>Our Brands</h4>
              <p style={s.contactCardText}>
                <span style={s.brandPill}>Cax & King</span><br />
                <span style={s.brandPill}>7 GRM®</span><br />
                <span style={s.brandPill}>CK2</span>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

const s = {
  /* ─── HERO ─── */
  hero: {
    background: 'linear-gradient(135deg, #0d1160 0%, #1a237e 60%, #0d1b3e 100%)',
    color: '#fff',
    padding: '72px 0 64px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 28px',
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: '48px',
    alignItems: 'center',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
  },
  heroPill: {
    backgroundColor: 'rgba(226,176,74,0.1)',
    border: '1px solid rgba(226,176,74,0.3)',
    color: '#e2b04a',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '2.75rem',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#ffffff',
    margin: 0,
  },
  heroTagline: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
  },
  heroDesc: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.65',
    maxWidth: '480px',
    margin: 0,
  },
  heroBtns: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  heroRight: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '20px 16px',
    textAlign: 'center',
  },
  statNum: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.65rem',
    fontWeight: '700',
    color: '#e2b04a',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  /* ─── BUTTONS ─── */
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    padding: '13px 28px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '13px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },

  /* ─── BRANDS BAR ─── */
  brandsBar: {
    backgroundColor: '#e2b04a',
    padding: '0',
  },
  brandsInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  brandBarLabel: {
    color: '#0d1160',
    fontWeight: '800',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  brandsDividerV: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(13,17,96,0.25)',
    flexShrink: 0,
  },
  brandsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
    justifyContent: 'center',
  },
  brandName: {
    color: '#0d1160',
    fontWeight: '700',
    fontSize: '1.05rem',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.3px',
  },
  brandSep: {
    color: 'rgba(13,17,96,0.25)',
    fontSize: '1rem',
  },

  /* ─── TRUST STRIP ─── */
  trustStrip: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    borderTop: '1px solid #e2e8f0',
    padding: '14px 0',
  },
  trustInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '24px 40px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  trustIcon: {
    color: '#1a237e',
    display: 'flex',
    alignItems: 'center',
  },
  trustText: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#334155',
    whiteSpace: 'nowrap',
  },

  /* ─── SHARED ─── */
  sectionContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 28px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '36px',
  },
  sectionHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTag: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#1a237e',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    backgroundColor: 'rgba(26,35,126,0.07)',
    border: '1px solid rgba(26,35,126,0.15)',
    padding: '3px 10px',
    borderRadius: '20px',
    width: 'fit-content',
  },
  sectionTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.85rem',
    fontWeight: '700',
    color: '#0d1160',
    margin: 0,
  },
  sectionTitleCentered: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.85rem',
    fontWeight: '700',
    color: '#0d1160',
    margin: '8px 0 0',
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  sectionSubtitleCentered: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '8px',
  },
  seeAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1a237e',
    fontWeight: '600',
    fontSize: '0.88rem',
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: '1px solid #1a237e',
  },

  /* ─── COLLECTION ─── */
  collectionSection: {
    backgroundColor: '#ffffff',
    padding: '56px 0',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '22px',
  },
  loadingWrap: {
    textAlign: 'center',
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #1a237e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  /* ─── WHY ─── */
  whySection: {
    backgroundColor: '#f8fafc',
    padding: '64px 0',
    borderTop: '1px solid #e2e8f0',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '28px 24px',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    cursor: 'default',
  },
  featureIconBox: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(26,35,126,0.07)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a237e',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0d1160',
    marginBottom: '8px',
    fontFamily: 'sans-serif',
  },
  featureDesc: {
    fontSize: '0.865rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
  },

  /* ─── HOW TO ORDER ─── */
  howSection: {
    backgroundColor: '#0d1160',
    padding: '64px 0',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    position: 'relative',
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '28px 20px',
    textAlign: 'center',
    position: 'relative',
  },
  stepNumber: {
    fontFamily: 'Georgia, serif',
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#e2b04a',
    opacity: 0.85,
    lineHeight: 1,
    marginBottom: '14px',
  },
  stepArrow: {
    position: 'absolute',
    top: '28px',
    right: '-16px',
    color: 'rgba(226,176,74,0.4)',
    fontSize: '1.4rem',
    zIndex: 1,
  },
  stepTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.55',
    margin: 0,
  },

  /* ─── CONTACT ─── */
  contactSection: {
    backgroundColor: '#ffffff',
    padding: '64px 0',
    borderTop: '1px solid #e2e8f0',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  contactCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '26px 22px',
  },
  contactIconBox: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(26,35,126,0.08)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a237e',
    marginBottom: '14px',
  },
  contactCardTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#e2b04a',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    fontFamily: 'sans-serif',
  },
  contactCardText: {
    fontSize: '0.9rem',
    color: '#475569',
    lineHeight: '1.7',
    margin: 0,
  },
  contactLink: {
    color: '#1a237e',
    fontWeight: '600',
    textDecoration: 'none',
  },
  whatsappBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    backgroundColor: '#25D366',
    color: '#ffffff',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '700',
    textDecoration: 'none',
  },
  brandPill: {
    display: 'inline-block',
    backgroundColor: 'rgba(226,176,74,0.12)',
    border: '1px solid rgba(226,176,74,0.35)',
    color: '#0d1160',
    fontWeight: '700',
    fontSize: '0.85rem',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '6px',
    fontFamily: 'Georgia, serif',
  },
};

export default Home;
