import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingBag, Users, Plus, Trash2, 
  RefreshCw, Eye, Upload, Edit, X, Lock, LogOut, FileText 
} from 'lucide-react';

const AdminPanel = () => {
  const { token, user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'orders' | 'products' | 'buyers'
  const [activeTab, setActiveTab] = useState('orders');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Admin Login States (Inline for unauthenticated /admin access)
  const [adminPhoneOrEmail, setAdminPhoneOrEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);

  // Expanded Orders state (orderId -> boolean)
  const [expandedOrders, setExpandedOrders] = useState({});

  // Product Creation form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Cax & King');
  const [newProdType, setNewProdType] = useState('Jeans');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdPiecesPerBundle, setNewProdPiecesPerBundle] = useState(5);
  const [newProdMoq, setNewProdMoq] = useState(50);
  const [newProdSizes, setNewProdSizes] = useState('28, 30, 32, 34, 36');
  const [newProdColors, setNewProdColors] = useState([
    { name: 'Indigo Blue', stock: 100 },
    { name: 'Jet Black', stock: 100 }
  ]);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(null);

  // Product Editing Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('Cax & King');
  const [editType, setEditType] = useState('Jeans');
  const [editPrice, setEditPrice] = useState('');
  const [editPiecesPerBundle, setEditPiecesPerBundle] = useState(5);
  const [editMoq, setEditMoq] = useState(50);
  const [editSizes, setEditSizes] = useState('');
  const [editColors, setEditColors] = useState([]);
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editInStock, setEditInStock] = useState(true);

  // Fetching methods
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setOrders(result.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) setProducts(result.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/buyers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setBuyers(result.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token && user && user.role === 'admin') {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'buyers') fetchBuyers();
    }
  }, [activeTab, token, user]);

  // Handle Admin Inline Login
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      // Identity needs to be trimmed and normalized
      const identity = adminPhoneOrEmail.trim();
      const password = adminPassword;

      if (!identity || !password) {
        setLoginError('Please enter both admin credentials and password.');
        setLoginLoading(false);
        return;
      }

      const res = await login(identity, password);
      if (res.success) {
        setAdminPhoneOrEmail('');
        setAdminPassword('');
        
        // Verify role === "admin"
        if (res.user && res.user.role === 'admin') {
          // Redirect to the admin dashboard
          navigate('/admin', { replace: true });
        } else {
          // If role !== "admin": Show Access Denied
          // Since they logged in successfully, they are logged in as a buyer.
          // The next render of AdminPanel will detect user.role !== 'admin' and render the Access Denied overlay.
          navigate('/admin', { replace: true });
        }
      } else {
        setLoginError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server connection failure.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Toggle Order Expand
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Quick toggle product stock availability
  const handleToggleInStock = async (product) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inStock: !product.inStock })
      });
      const result = await response.json();
      if (result.success) {
        setProducts(products.map(p => p._id === product._id ? { ...p, inStock: !p.inStock } : p));
        setMessage({ type: 'success', text: `"${product.name}" stock status updated successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update stock status.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Order status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        setMessage({ type: 'success', text: `Order status updated to ${newStatus} successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update status.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Product Creation color handlers
  const handleAddColorField = () => {
    setNewProdColors([...newProdColors, { name: '', stock: 100 }]);
  };

  const handleRemoveColorField = (index) => {
    setNewProdColors(newProdColors.filter((_, idx) => idx !== index));
  };

  const handleColorChange = (index, field, value) => {
    setNewProdColors(newProdColors.map((c, idx) => {
      if (idx === index) {
        return { ...c, [field]: field === 'stock' ? Number(value) : value };
      }
      return c;
    }));
  };

  // Product Creation submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    if (!newProdName || !newProdPrice || !newProdMoq) {
      setMessage({ type: 'error', text: 'Please fill out all required fields.' });
      setActionLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProdName);
      formData.append('brand', newProdBrand);
      formData.append('type', newProdType);
      formData.append('pricePerPiece', Number(newProdPrice));
      formData.append('piecesPerBundle', Number(newProdPiecesPerBundle) || 5);
      formData.append('moq', Number(newProdMoq));
      formData.append('description', newProdDesc);
      
      const sizesArray = newProdSizes.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s));
      formData.append('sizes', JSON.stringify(sizesArray));

      // Filter empty colors and attach
      const colorsToSubmit = newProdColors.filter(c => c.name.trim() !== '');
      formData.append('colors', JSON.stringify(colorsToSubmit));

      if (newProdImage) {
        formData.append('images', newProdImage);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'New wholesale design added successfully!' });
        setNewProdName('');
        setNewProdPrice('');
        setNewProdPiecesPerBundle(5);
        setNewProdMoq(50);
        setNewProdDesc('');
        setNewProdImage(null);
        setNewProdColors([
          { name: 'Indigo Blue', stock: 100 },
          { name: 'Jet Black', stock: 100 }
        ]);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save product.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection failure.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Product Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBrand(product.brand);
    setEditType(product.type);
    setEditPrice(product.pricePerPiece || product.price);
    setEditPiecesPerBundle(product.piecesPerBundle || 5);
    setEditMoq(product.moq || 50);
    setEditSizes(product.sizes ? product.sizes.join(', ') : '28, 30, 32, 34, 36');
    setEditColors(product.colors ? product.colors.map(c => ({ name: c.name, stock: c.stock })) : []);
    setEditDesc(product.description || '');
    setEditInStock(product.inStock !== false);
    setEditImage(null);
  };

  // Edit Product color handlers
  const handleAddEditColorField = () => {
    setEditColors([...editColors, { name: '', stock: 100 }]);
  };

  const handleRemoveEditColorField = (index) => {
    setEditColors(editColors.filter((_, idx) => idx !== index));
  };

  const handleEditColorChange = (index, field, value) => {
    setEditColors(editColors.map((c, idx) => {
      if (idx === index) {
        return { ...c, [field]: field === 'stock' ? Number(value) : value };
      }
      return c;
    }));
  };

  // Submit Edit Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('brand', editBrand);
      formData.append('type', editType);
      formData.append('pricePerPiece', Number(editPrice));
      formData.append('piecesPerBundle', Number(editPiecesPerBundle) || 5);
      formData.append('moq', Number(editMoq));
      formData.append('description', editDesc);
      formData.append('inStock', editInStock);

      const sizesArray = editSizes.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s));
      formData.append('sizes', JSON.stringify(sizesArray));

      const colorsToSubmit = editColors.filter(c => c.name.trim() !== '');
      formData.append('colors', JSON.stringify(colorsToSubmit));

      if (editImage) {
        formData.append('images', editImage);
      }

      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Product "${editName}" updated successfully!` });
        setEditingProduct(null);
        setEditImage(null);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update product.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Product deletion
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product style from the catalogue?')) return;
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setProducts(products.filter(p => p._id !== prodId));
        setMessage({ type: 'success', text: 'Product deleted successfully.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete product.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server deletion error.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Render Login Card if not authenticated
  if (!token || !user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={styles.loginIconBox}>
              <Lock size={22} />
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#0d1160', margin: '12px 0 6px 0', fontSize: '1.6rem' }}>Admin Portal Login</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Access J.G. Jeans inventory and wholesale operations</p>
          </div>

          {loginError && (
            <div style={styles.loginErrorBanner}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={styles.inputLabel}>Mobile / Email</label>
              <input 
                type="text" 
                style={styles.textInput}
                placeholder="Enter admin credentials"
                value={adminPhoneOrEmail}
                onChange={(e) => setAdminPhoneOrEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.inputLabel}>Security Password</label>
              <input 
                type="password" 
                style={styles.textInput}
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              style={styles.loginSubmitBtn}
              disabled={loginLoading}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Access Denied for non-admin accounts
  if (user.role !== 'admin') {
    return (
      <div style={styles.loginContainer}>
        <div style={{ ...styles.loginCard, textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ ...styles.loginIconBox, backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#991b1b', margin: '12px 0 6px 0', fontSize: '1.45rem' }}>Access Denied</h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            You are currently logged in as a buyer (**{user.shopName}**). You do not have permission to view administrative panels.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/')} style={{ ...styles.btn, flex: 1, backgroundColor: '#1a237e', color: 'white' }}>
              Return to Catalog
            </button>
            <button onClick={logout} style={{ ...styles.btn, border: '1px solid #cbd5e1', color: '#475569' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div className="section-header" style={{ textAlign: 'left', margin: 0 }}>
          <h2 style={{ margin: '0 0 6px 0' }}>Admin Management Panel</h2>
          <p style={{ margin: 0 }}>Control wholesale inventory, approve transactions, and manage retail accounts</p>
        </div>
        <button onClick={logout} style={styles.adminLogoutBtn}>
          <LogOut size={14} /> Logout Session
        </button>
      </div>

      {/* Message feedback banner */}
      {message.text && (
        <div style={{
          padding: '12px 20px',
          borderRadius: '6px',
          border: '1px solid',
          marginBottom: '24px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          borderColor: message.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs Row */}
      <div className="admin-tab-bar" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #cbd5e1', marginBottom: '24px', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ ...styles.tabBtn, ...(activeTab === 'orders' ? styles.tabBtnActive : {}) }}
        >
          <Package size={16} /> Wholesale Orders ({orders.length})
        </button>

        <button 
          onClick={() => setActiveTab('products')}
          style={{ ...styles.tabBtn, ...(activeTab === 'products' ? styles.tabBtnActive : {}) }}
        >
          <ShoppingBag size={16} /> Manage Inventory ({products.length})
        </button>

        <button 
          onClick={() => setActiveTab('buyers')}
          style={{ ...styles.tabBtn, ...(activeTab === 'buyers' ? styles.tabBtnActive : {}) }}
        >
          <Users size={16} /> Buyer Directory ({buyers.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Fetching admin data records...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: WHOLESALE ORDERS */}
          {activeTab === 'orders' && (
            <div className="admin-table-card" style={styles.adminTableCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.cardHeaderTitle}>Retail Buyer Orders</h3>
                <button onClick={fetchOrders} style={{ ...styles.btn, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
                  <RefreshCw size={12} /> Refresh List
                </button>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No wholesale orders have been submitted yet.</p>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableTh}>Order ID</th>
                        <th style={styles.tableTh}>Buyer / Shop</th>
                        <th style={styles.tableTh}>Address</th>
                        <th style={styles.tableTh}>Total Amount</th>
                        <th style={styles.tableTh}>Date</th>
                        <th style={styles.tableTh}>Payment Receipt</th>
                        <th style={styles.tableTh}>Order Status</th>
                        <th style={styles.tableTh}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <React.Fragment key={o._id}>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: expandedOrders[o._id] ? '#f8fafc' : 'transparent' }}>
                            <td style={{ ...styles.tableTd, fontFamily: 'monospace', fontWeight: 'bold' }}>
                              #{o._id.substring(o._id.length - 8).toUpperCase()}
                            </td>
                            <td style={styles.tableTd}>
                              <strong style={{ color: '#0d1160' }}>{o.buyer ? o.buyer.shopName : 'Unknown Shop'}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {o.buyer ? o.buyer.name : 'Unknown'} ({o.buyer ? o.buyer.phone : ''})
                              </div>
                            </td>
                            <td style={{ ...styles.tableTd, fontSize: '0.8rem', maxWidth: '180px', wordBreak: 'break-word' }}>
                              {o.deliveryAddress}
                            </td>
                            <td style={{ ...styles.tableTd, fontWeight: 'bold', color: '#1a237e' }}>
                              ₹{o.totalAmount}
                            </td>
                            <td style={{ ...styles.tableTd, fontSize: '0.8rem' }}>
                              {new Date(o.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={styles.tableTd}>
                              {o.paymentScreenshot ? (
                                <a href={o.paymentScreenshot} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
                                  <Eye size={12} /> View Proof
                                </a>
                              ) : <span style={{ color: '#ef4444' }}>None</span>}
                            </td>
                            <td style={styles.tableTd}>
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                                style={{
                                  ...styles.statusDropdown,
                                  backgroundColor: o.status === 'Confirmed' ? '#d1fae5' : o.status === 'Shipped' ? '#dbeafe' : o.status === 'Delivered' ? '#eef2ff' : '#fef3c7',
                                  color: o.status === 'Confirmed' ? '#065f46' : o.status === 'Shipped' ? '#1e40af' : o.status === 'Delivered' ? '#1e1b4b' : '#92400e'
                                }}
                                disabled={actionLoading}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td style={styles.tableTd}>
                              <button 
                                onClick={() => toggleOrderExpand(o._id)}
                                style={{ ...styles.btn, padding: '5px 10px', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FileText size={12} /> {expandedOrders[o._id] ? 'Hide' : 'Items'}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded Order Items Row */}
                          {expandedOrders[o._id] && (
                            <tr>
                              <td colSpan="8" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: 'white' }}>
                                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0d1160', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Order Item Breakdown
                                  </h4>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                                        <th style={{ padding: '8px 12px' }}>Product Design</th>
                                        <th style={{ padding: '8px 12px' }}>Selected Color</th>
                                        <th style={{ padding: '8px 12px' }}>Qty (Bundles)</th>
                                        <th style={{ padding: '8px 12px' }}>Total Pieces</th>
                                        <th style={{ padding: '8px 12px' }}>Price/Piece</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {o.items && o.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                          <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1a237e' }}>
                                            {item.productName}
                                          </td>
                                          <td style={{ padding: '8px 12px' }}>
                                            {item.color}
                                          </td>
                                          <td style={{ padding: '8px 12px' }}>
                                            {item.bundleQty} bundles
                                          </td>
                                          <td style={{ padding: '8px 12px' }}>
                                            {item.bundleQty * (item.piecesPerBundle || 5)} pcs
                                          </td>
                                          <td style={{ padding: '8px 12px' }}>
                                            ₹{item.pricePerPiece}
                                          </td>
                                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                                            ₹{item.totalPrice}
                                          </td>
                                        </tr>
                                      ))}
                                      <tr style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        <td colSpan="5" style={{ padding: '12px 12px 0 12px', textAlign: 'right' }}>Total Bill:</td>
                                        <td style={{ padding: '12px 12px 0 12px', textAlign: 'right', color: '#1a237e' }}>₹{o.totalAmount}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCT CATALOGUE */}
          {activeTab === 'products' && (
            <div className="admin-products-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
              
              {/* Product Creator Form */}
              <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <h3 style={{ ...styles.cardHeaderTitle, display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} />Add New Wholesale Design</h3>
                <div style={styles.divider}></div>
                
                <form onSubmit={handleCreateProduct}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={styles.inputLabel}>Design/Product Name *</label>
                    <input 
                      type="text" 
                      style={styles.formInput}
                      placeholder="e.g. Cax & King Slim Fit Jeans" 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={styles.inputLabel}>Brand *</label>
                      <select 
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        style={styles.formInput}
                      >
                        <option value="Cax & King">Cax & King</option>
                        <option value="7 GRM">7 GRM</option>
                        <option value="CK2">CK2</option>
                      </select>
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Product Type *</label>
                      <select 
                        value={newProdType}
                        onChange={(e) => setNewProdType(e.target.value)}
                        style={styles.formInput}
                      >
                        <option value="Jeans">Jeans</option>
                        <option value="Trousers">Trousers</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <label style={styles.inputLabel}>Price/Piece (₹) *</label>
                      <input 
                        type="number" 
                        style={styles.formInput}
                        placeholder="e.g. 350" 
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Pcs / Bundle *</label>
                      <input 
                        type="number" 
                        style={styles.formInput}
                        value={newProdPiecesPerBundle}
                        onChange={(e) => setNewProdPiecesPerBundle(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>MOQ (Pieces) *</label>
                      <input 
                        type="number" 
                        style={styles.formInput}
                        value={newProdMoq}
                        onChange={(e) => setNewProdMoq(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={styles.inputLabel}>Available Sizes (Comma-separated)</label>
                    <input 
                      type="text" 
                      style={styles.formInput}
                      placeholder="e.g. 28, 30, 32, 34, 36" 
                      value={newProdSizes}
                      onChange={(e) => setNewProdSizes(e.target.value)}
                    />
                  </div>

                  {/* Colors List Manager */}
                  <div style={{ marginBottom: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ ...styles.inputLabel, margin: 0 }}>Color Colors & Stock *</label>
                      <button 
                        type="button" 
                        onClick={handleAddColorField}
                        style={{ ...styles.btn, padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#eef2ff', color: '#1a237e', border: '1px solid #c7d2fe' }}
                      >
                        + Add Color
                      </button>
                    </div>
                    
                    {newProdColors.map((color, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <input 
                          type="text"
                          style={{ ...styles.formInput, flex: 2, padding: '6px 10px', fontSize: '0.8rem' }}
                          placeholder="Color name (e.g. Ice Blue)"
                          value={color.name}
                          onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                          required
                        />
                        <input 
                          type="number"
                          style={{ ...styles.formInput, flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                          placeholder="Stock"
                          value={color.stock}
                          onChange={(e) => handleColorChange(idx, 'stock', e.target.value)}
                          required
                        />
                        {newProdColors.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveColorField(idx)}
                            style={{ padding: '6px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={styles.inputLabel}>Product Image Upload</label>
                    <div style={styles.fileUploadBox}>
                      <input 
                        id="prod-img"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setNewProdImage(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="prod-img" style={styles.fileUploadBtn}>
                        <Upload size={14} /> Choose Image file
                      </label>
                      {newProdImage && (
                        <span style={styles.uploadFileName}>{newProdImage.name}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={styles.inputLabel}>Specs / Styling Description</label>
                    <textarea 
                      style={{ ...styles.formInput, height: '70px', resize: 'vertical' }}
                      placeholder="Fabric mix, pockets, brand rinse details..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    style={styles.primarySubmitBtn}
                    disabled={actionLoading}
                  >
                    Add Product Style
                  </button>
                </form>
              </div>

              {/* Product Catalog Listing */}
              <div className="admin-table-card" style={styles.adminTableCard}>
                <h3 style={styles.cardHeaderTitle}>Product Catalogue Inventory</h3>
                <div style={styles.divider}></div>

                {products.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No products available in the system catalog.</p>
                ) : (
                  <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.tableTh}>Image</th>
                          <th style={styles.tableTh}>Product Style Name</th>
                          <th style={styles.tableTh}>Brand</th>
                          <th style={styles.tableTh}>Wholesale Price</th>
                          <th style={styles.tableTh}>MOQ</th>
                          <th style={styles.tableTh}>Inventory Status</th>
                          <th style={styles.tableTh}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={styles.tableTd}>
                              <img 
                                src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&auto=format&fit=crop'} 
                                alt={p.name} 
                                style={styles.prodThumbnail} 
                              />
                            </td>
                            <td style={styles.tableTd}>
                              <strong style={{ color: '#0d1160' }}>{p.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Type: {p.type}</div>
                              <div style={{ fontSize: '0.75rem', color: '#475569' }}>Sizes: {p.sizes ? p.sizes.join(', ') : 'None'}</div>
                            </td>
                            <td style={styles.tableTd}>
                              <span style={{ fontSize: '0.78rem', padding: '3px 8px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', fontWeight: 'bold' }}>{p.brand}</span>
                            </td>
                            <td style={{ ...styles.tableTd, fontWeight: 'bold' }}>
                              ₹{p.pricePerPiece || p.price}/pc
                            </td>
                            <td style={styles.tableTd}>
                              {p.moq} pcs ({Math.ceil(p.moq / (p.piecesPerBundle || 5))} bundles)
                            </td>
                            <td style={styles.tableTd}>
                              <button 
                                type="button"
                                onClick={() => handleToggleInStock(p)}
                                style={{
                                  ...styles.stockToggleBadge,
                                  backgroundColor: p.inStock ? '#d1fae5' : '#fee2e2',
                                  color: p.inStock ? '#065f46' : '#991b1b',
                                  borderColor: p.inStock ? '#34d399' : '#f87171'
                                }}
                                disabled={actionLoading}
                              >
                                {p.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td style={styles.tableTd}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => openEditModal(p)}
                                  style={{ ...styles.actionBtn, color: '#1d4ed8', backgroundColor: '#eff6ff' }}
                                  title="Edit Product"
                                  disabled={actionLoading}
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p._id)} 
                                  style={{ ...styles.actionBtn, color: '#b91c1c', backgroundColor: '#fef2f2' }}
                                  title="Delete Product"
                                  disabled={actionLoading}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED BUYERS */}
          {activeTab === 'buyers' && (
            <div className="admin-table-card" style={styles.adminTableCard}>
              <h3 style={styles.cardHeaderTitle}>Registered Wholesale Buyer Directory</h3>
              <div style={styles.divider}></div>

              {buyers.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No retail buyers have registered on the platform yet.</p>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableTh}>Buyer Name</th>
                        <th style={styles.tableTh}>Retail Shop Name</th>
                        <th style={styles.tableTh}>WhatsApp/Phone</th>
                        <th style={styles.tableTh}>Email ID</th>
                        <th style={styles.tableTh}>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyers.map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ ...styles.tableTd, fontWeight: 'bold' }}>{b.name}</td>
                          <td style={{ ...styles.tableTd, color: '#1a237e', fontWeight: '600' }}>{b.shopName}</td>
                          <td style={styles.tableTd}>{b.phone}</td>
                          <td style={styles.tableTd}>{b.email}</td>
                          <td style={{ ...styles.tableTd, fontSize: '0.8rem' }}>
                            {new Date(b.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== EDIT PRODUCT MODAL ==================== */}
      {editingProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ ...styles.cardHeaderTitle, margin: 0 }}>Edit Wholesale Design</h3>
              <button 
                onClick={() => setEditingProduct(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={styles.divider}></div>

            <form onSubmit={handleUpdateProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.inputLabel}>Design/Product Name *</label>
                <input 
                  type="text" 
                  style={styles.formInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={styles.inputLabel}>Brand *</label>
                  <select 
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="Cax & King">Cax & King</option>
                    <option value="7 GRM">7 GRM</option>
                    <option value="CK2">CK2</option>
                  </select>
                </div>

                <div>
                  <label style={styles.inputLabel}>Product Type *</label>
                  <select 
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="Jeans">Jeans</option>
                    <option value="Trousers">Trousers</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={styles.inputLabel}>Price/Piece (₹) *</label>
                  <input 
                    type="number" 
                    style={styles.formInput}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>Pcs / Bundle *</label>
                  <input 
                    type="number" 
                    style={styles.formInput}
                    value={editPiecesPerBundle}
                    onChange={(e) => setEditPiecesPerBundle(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>MOQ (Pieces) *</label>
                  <input 
                    type="number" 
                    style={styles.formInput}
                    value={editMoq}
                    onChange={(e) => setEditMoq(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.inputLabel}>Available Sizes (Comma-separated)</label>
                <input 
                  type="text" 
                  style={styles.formInput}
                  value={editSizes}
                  onChange={(e) => setEditSizes(e.target.value)}
                />
              </div>

              {/* Edit Modal Colors & Stock Manager */}
              <div style={{ marginBottom: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ ...styles.inputLabel, margin: 0 }}>Color Colors & Inventory Stock *</label>
                  <button 
                    type="button" 
                    onClick={handleAddEditColorField}
                    style={{ ...styles.btn, padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#eef2ff', color: '#1a237e', border: '1px solid #c7d2fe' }}
                  >
                    + Add Color
                  </button>
                </div>
                
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {editColors.map((color, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input 
                        type="text"
                        style={{ ...styles.formInput, flex: 2, padding: '6px 10px', fontSize: '0.8rem' }}
                        placeholder="Color name"
                        value={color.name}
                        onChange={(e) => handleEditColorChange(idx, 'name', e.target.value)}
                        required
                      />
                      <input 
                        type="number"
                        style={{ ...styles.formInput, flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                        placeholder="Stock"
                        value={color.stock}
                        onChange={(e) => handleEditColorChange(idx, 'stock', e.target.value)}
                        required
                      />
                      {editColors.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveEditColorField(idx)}
                          style={{ padding: '6px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={styles.inputLabel}>Change Image (Optional)</label>
                  <div style={styles.fileUploadBox}>
                    <input 
                      id="edit-prod-img"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setEditImage(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="edit-prod-img" style={styles.fileUploadBtn}>
                      <Upload size={12} /> Replace Image
                    </label>
                    {editImage && (
                      <span style={{ ...styles.uploadFileName, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editImage.name}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Catalogue Visibility</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
                    <input 
                      type="checkbox" 
                      id="edit-in-stock"
                      checked={editInStock}
                      onChange={(e) => setEditInStock(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="edit-in-stock" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      Show In Stock
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.inputLabel}>Specs / Styling Description</label>
                <textarea 
                  style={{ ...styles.formInput, height: '60px', resize: 'vertical' }}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  style={{ ...styles.primarySubmitBtn, flex: 2 }}
                  disabled={actionLoading}
                >
                  Save Design Updates
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  style={{ ...styles.btn, flex: 1, border: '1px solid #cbd5e1', color: '#475569' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  // Login Panel Layouts
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '40px 24px',
    backgroundColor: '#f8fafc'
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(13, 17, 96, 0.08)',
    border: '1px solid #cbd5e1',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '440px'
  },
  loginIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    color: '#1a237e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  loginErrorBanner: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '0.82rem',
    marginBottom: '20px',
    lineHeight: 1.4,
    textAlign: 'center'
  },
  loginSubmitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e2b04a',
    color: '#0d1160',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },

  // Dashboard Styles
  adminLogoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#b91c1c',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'inherit'
  },
  tabBtnActive: {
    color: '#0d1160',
    borderBottom: '2px solid #0d1160',
    fontWeight: '700'
  },
  adminTableCard: {
    backgroundColor: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  },
  cardHeaderTitle: {
    fontSize: '1.05rem',
    color: '#0d1160',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#cbd5e1',
    margin: '12px 0 20px 0'
  },
  tableHeaderRow: {
    backgroundColor: '#f1f5f9',
    textAlign: 'left',
    borderBottom: '2px solid #cbd5e1'
  },
  tableTh: {
    padding: '12px 16px',
    fontSize: '0.82rem',
    color: '#475569',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableTd: {
    padding: '14px 16px',
    fontSize: '0.88rem',
    color: '#334155',
    verticalAlign: 'middle'
  },
  viewLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#1a237e',
    fontSize: '0.8rem',
    fontWeight: '600',
    textDecoration: 'underline'
  },
  statusDropdown: {
    padding: '6px 10px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none'
  },
  
  // Forms & Inputs
  inputLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  textInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box'
  },
  formInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.88rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  fileUploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px'
  },
  fileUploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569'
  },
  uploadFileName: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  primarySubmitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0d1160',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  prodThumbnail: {
    width: '38px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #cbd5e1'
  },
  stockToggleBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: '1px solid',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s'
  },
  btn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.15s'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },

  // Modal Overlay
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '24px 30px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    border: '1px solid #cbd5e1'
  }
};

export default AdminPanel;
