import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import LoginRegister from './pages/LoginRegister';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import AdminPanel from './pages/AdminPanel';
import OrderSuccess from './pages/OrderSuccess';

// Route guard to restrict guest and admin users from accessing buyer workflows
const BuyerOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)', color: '#0d1160', fontWeight: '600' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    // Guest redirect to Login/Register page
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    // Admin redirected to Admin Panel
    return <Navigate to="/admin" replace />;
  }

  // Allow buyers
  return children;
};

function AppContent() {
  return (
    <div style={styles.appWrapper}>
      <Navbar />
      <main style={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginRegister />} />
          
          {/* Buyer workflows guarded by BuyerOnlyRoute */}
          <Route path="/cart" element={<BuyerOnlyRoute><Cart /></BuyerOnlyRoute>} />
          <Route path="/checkout" element={<BuyerOnlyRoute><Checkout /></BuyerOnlyRoute>} />
          <Route path="/order-success" element={<BuyerOnlyRoute><OrderSuccess /></BuyerOnlyRoute>} />
          <Route path="/my-orders" element={<BuyerOnlyRoute><MyOrders /></BuyerOnlyRoute>} />
          
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/918087351633?text=Hi, I want to place a wholesale order"
        target="_blank"
        rel="noreferrer"
        style={styles.whatsappFloat}
        title="Chat on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      <style>{`
        @keyframes whatsapp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55); }
          70% { box-shadow: 0 0 0 14px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  mainContent: {
    flexGrow: 1,
    paddingTop: '70px'
  },
  whatsappFloat: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '56px',
    height: '56px',
    backgroundColor: '#25D366',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    boxShadow: '0 4px 16px rgba(37,211,102,0.45)',
    animation: 'whatsapp-pulse 2s infinite',
    transition: 'transform 0.2s',
  }
};

export default App;
