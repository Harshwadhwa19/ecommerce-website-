import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RotateCcw } from 'lucide-react';

const Catalogue = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      const params = [];
      
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedBrand) params.push(`brand=${encodeURIComponent(selectedBrand)}`);
      if (selectedType) params.push(`type=${encodeURIComponent(selectedType)}`);
      if (selectedSize) params.push(`size=${encodeURIComponent(selectedSize)}`);
      if (selectedColor) params.push(`color=${encodeURIComponent(selectedColor)}`);
      
      url += params.join('&');
      
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Error fetching catalogue products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedBrand, selectedType, selectedSize, selectedColor]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedType('');
    setSelectedSize('');
    setSelectedColor('');
  };

  // Helper arrays for options
  const brands = ['Cax & King', '7 GRM', 'CK2'];
  const types = ['Jeans', 'Trousers'];
  const sizes = ['28', '30', '32', '34', '36', '38'];
  const colors = ['Indigo Blue', 'Ice Blue', 'Light Blue', 'Dark Indigo', 'Jet Black', 'Charcoal', 'Khaki', 'Beige', 'Olive Green', 'Dark Grey'];

  return (
    <div className="container" style={{ padding: '110px 24px 40px 24px' }}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
        <h2>Wholesale Catalogue</h2>
        <p>Browse our extensive collections and build your bulk order</p>
      </div>

      <div className="catalogue-layout">
        {/* Filter Sidebar */}
        <aside className="catalogue-sidebar">
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>
              <Filter size={18} /> Filters
            </span>
            <button onClick={handleResetFilters} style={styles.resetBtn}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Brand</label>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="form-control"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Product Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-control"
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Size</label>
            <select 
              value={selectedSize} 
              onChange={(e) => setSelectedSize(e.target.value)}
              className="form-control"
            >
              <option value="">All Sizes</option>
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Color</label>
            <select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
              className="form-control"
            >
              <option value="">All Colors</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="catalogue-main">
          {/* Search Bar */}
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by product name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field"
            />
          </div>

          <div style={styles.resultsCount}>
            {loading ? 'Searching products...' : `${products.length} products found matching criteria`}
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <p>Loading catalog items...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyContainer}>
              <h3>No Products Found</h3>
              <p style={{ color: '#64748b', marginTop: '10px' }}>
                We couldn't find any products matching your current filter selection. Try resetting filters or changing your search terms.
              </p>
              <button 
                onClick={handleResetFilters} 
                className="btn btn-secondary" 
                style={{ marginTop: '20px' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="catalogue-grid">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0'
  },
  sidebarTitle: {
    fontWeight: '700',
    color: '#0d1160',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  resetBtn: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.2s',
  },
  filterGroup: {
    marginBottom: '20px'
  },
  filterLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px'
  },
  resultsCount: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '24px',
    fontWeight: '500'
  },
  loadingContainer: {
    padding: '80px 0',
    textAlign: 'center',
    color: '#64748b'
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
  }
};

export default Catalogue;
