import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, Plus, Trash2, CheckCircle2, RefreshCw, Eye, Upload } from 'lucide-react';

const AdminPanel = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Route security block
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Tab State: 'orders' | 'products' | 'buyers'
  const [activeTab, setActiveTab] = useState('orders');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);

  // Product Creation form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Cax & King');
  const [newProdType, setNewProdType] = useState('Jeans');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdPiecesPerBundle, setNewProdPiecesPerBundle] = useState(5);
  const [newProdMoq, setNewProdMoq] = useState(50);
  const [newProdSizes, setNewProdSizes] = useState('28, 30, 32, 34, 36');
  const [newProdColors, setNewProdColors] = useState('Indigo Blue, Jet Black');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(null);

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
      const colorsArray = newProdColors.split(',').map(c => c.trim()).filter(Boolean);
      
      formData.append('sizes', JSON.stringify(sizesArray));
      formData.append('colors', JSON.stringify(colorsArray));

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
        setMessage({ type: 'success', text: 'New product added successfully!' });
        setNewProdName('');
        setNewProdPrice('');
        setNewProdPiecesPerBundle(5);
        setNewProdMoq(50);
        setNewProdDesc('');
        setNewProdImage(null);
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>Admin Management Panel</h2>
        <p>Control wholesale inventory, approve transactions, and manage retail accounts</p>
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
      <div className="admin-tab-bar">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <Package size={18} /> Wholesale Orders ({orders.length})
        </button>

        <button 
          onClick={() => setActiveTab('products')}
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={18} /> Manage Inventory ({products.length})
        </button>

        <button 
          onClick={() => setActiveTab('buyers')}
          className={`admin-tab-btn ${activeTab === 'buyers' ? 'active' : ''}`}
        >
          <Users size={18} /> Buyer Directory ({buyers.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p>Fetching admin data records...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: WHOLESALE ORDERS */}
          {activeTab === 'orders' && (
            <div className="admin-table-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.cardHeaderTitle}>Retail Buyer Orders</h3>
                <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} /> Refresh List
                </button>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No wholesale orders have been submitted yet.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Buyer / Shop</th>
                        <th>Address</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                        <th>Payment Receipt</th>
                        <th>Action Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            #{o._id.substring(o._id.length - 8).toUpperCase()}
                          </td>
                          <td>
                            <strong>{o.user ? o.user.shopName : 'Unknown Shop'}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {o.user ? o.user.name : 'Unknown'} ({o.user ? o.user.phone : ''})
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', maxWidth: '180px', wordBreak: 'break-word' }}>
                            {o.deliveryAddress}
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#1a237e' }}>
                            ₹{o.totalAmount}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            {o.paymentScreenshot ? (
                              <a href={`/${o.paymentScreenshot}`} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
                                <Eye size={14} /> View Proof
                              </a>
                            ) : 'None'}
                          </td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                              style={{
                                ...styles.statusDropdown,
                                backgroundColor: o.status === 'Confirmed' ? '#d1fae5' : o.status === 'Shipped' ? '#dbeafe' : o.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                                color: o.status === 'Confirmed' ? '#065f46' : o.status === 'Shipped' ? '#1e40af' : o.status === 'Cancelled' ? '#991b1b' : '#92400e'
                              }}
                              disabled={actionLoading}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCT CATALOGUE */}
          {activeTab === 'products' && (
            <div className="admin-products-layout">
              {/* Product Creator Form */}
              <div className="card" style={{ padding: '24px', flexShrink: 0 }}>
                <h3 style={styles.cardHeaderTitle}><Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Add New Wholesale Design</h3>
                <div style={styles.divider}></div>
                
                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label>Design/Product Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Cax & King Slim Fit Stretchable Jeans" 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '15px', marginBottom: '0' }}>
                    <div className="form-group">
                      <label>Brand *</label>
                      <select 
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        className="form-control"
                      >
                        <option value="Cax & King">Cax & King</option>
                        <option value="7 GRM">7 GRM</option>
                        <option value="CK2">CK2</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Product Type *</label>
                      <select 
                        value={newProdType}
                        onChange={(e) => setNewProdType(e.target.value)}
                        className="form-control"
                      >
                        <option value="Jeans">Jeans</option>
                        <option value="Trousers">Trousers</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Price Per Piece (₹) *</label>
                      <input 
                        type="number" 
                        className="form-control"
                        placeholder="e.g. 450" 
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Pieces Per Bundle *</label>
                      <input 
                        type="number" 
                        className="form-control"
                        placeholder="e.g. 5" 
                        value={newProdPiecesPerBundle}
                        onChange={(e) => setNewProdPiecesPerBundle(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>MOQ (Pieces) *</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={newProdMoq}
                        onChange={(e) => setNewProdMoq(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Available Sizes (Comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 28, 30, 32, 34, 36" 
                      value={newProdSizes}
                      onChange={(e) => setNewProdSizes(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Available Colors (Comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Ice Blue, Indigo Blue, Jet Black" 
                      value={newProdColors}
                      onChange={(e) => setNewProdColors(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Image Upload</label>
                    <div style={styles.fileUploadBox}>
                      <input 
                        id="prod-img"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setNewProdImage(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="prod-img" style={styles.fileUploadBtn}>
                        <Upload size={16} /> Choose Image
                      </label>
                      {newProdImage && (
                        <span style={styles.uploadFileName}>{newProdImage.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description / Styling Specifications</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Enter fabric composition, style details, pockets, rinse type, etc."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                    disabled={actionLoading}
                  >
                    Add Product Style
                  </button>
                </form>
              </div>

              {/* Product Catalog Listing */}
              <div className="admin-table-card">
                <h3 style={styles.cardHeaderTitle}>Product Catalogue Inventory</h3>
                <div style={styles.divider}></div>

                {products.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No products available in the system catalog.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Style Name</th>
                          <th>Brand</th>
                          <th>Price</th>
                          <th>MOQ</th>
                          <th>Sizes</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id}>
                            <td>
                              <img 
                                src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&auto=format&fit=crop'} 
                                alt={p.name} 
                                style={styles.prodThumbnail} 
                              />
                            </td>
                            <td>
                              <strong>{p.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Type: {p.type}</div>
                            </td>
                            <td><span className="badge badge-secondary">{p.brand}</span></td>
                            <td style={{ fontWeight: 'bold' }}>₹{p.pricePerPiece || p.price}/pc</td>
                            <td>{p.moq} pcs ({Math.ceil(p.moq / (p.piecesPerBundle || 5))} bundles)</td>
                            <td style={{ fontSize: '0.8rem', maxWidth: '120px' }}>{p.sizes ? p.sizes.join(', ') : 'None'}</td>
                            <td>
                              <button 
                                onClick={() => handleDeleteProduct(p._id)} 
                                style={styles.deleteBtn}
                                title="Delete Product"
                                disabled={actionLoading}
                              >
                                <Trash2 size={16} />
                              </button>
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
            <div className="admin-table-card">
              <h3 style={styles.cardHeaderTitle}>Registered Wholesale Buyer Directory</h3>
              <div style={styles.divider}></div>

              {buyers.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No retail buyers have registered on the platform yet.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Buyer Name</th>
                        <th>Retail Shop Name</th>
                        <th>WhatsApp/Phone</th>
                        <th>Email ID</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyers.map(b => (
                        <tr key={b._id}>
                          <td style={{ fontWeight: 'bold' }}>{b.name}</td>
                          <td style={{ color: '#1a237e', fontWeight: '600' }}>{b.shopName}</td>
                          <td>{b.phone}</td>
                          <td>{b.email}</td>
                          <td style={{ fontSize: '0.8rem' }}>
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
    </div>
  );
};

const styles = {
  cardHeaderTitle: {
    fontSize: '1.15rem',
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
    padding: '6px 12px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none'
  },
  fileUploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '6px'
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
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  uploadFileName: {
    fontSize: '0.8rem',
    color: '#475569'
  },
  prodThumbnail: {
    width: '40px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #e2e8f0'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    transition: 'color 0.2s',
  }
};

export default AdminPanel;
