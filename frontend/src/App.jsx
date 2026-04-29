import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, LogIn, UserPlus, Package, Search, LayoutGrid, Info, CheckCircle } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '4rem' }}>

        {/* MASSIVELY UPGRADED NAVBAR TO MATCH THE 'VIBE COMMERCE' SCREENSHOT AESTHETIC */}
        <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>

            {/* Logo Left */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Package size={26} color="var(--orange-primary)" />
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Veltrix Commerce</span>
            </Link>

            {/* Central Search Bar */}
            <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '30px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            {/* Right Links & Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/" onClick={() => setSearchQuery('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>
                <LayoutGrid size={16} /> Products
              </Link>


              {/* Secure Login Conditional */}
              {token ? (
                <>
                  {role === 'user' && (
                    <>
                      <Link to="/orders" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>My Orders</Link>
                      <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', textDecoration: 'none', fontWeight: '700', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '30px', position: 'relative' }}>
                        <ShoppingCart size={18} />
                        Cart
                        {/* Floating Red Notification Badge for Cart */}
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '800', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                          !
                        </span>
                      </Link>
                    </>
                  )}

                  {/* Dashboard Lock Indicator */}
                  {role === 'manager' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--blue-accent)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', background: 'var(--blue-glow)', padding: '0.4rem 0.75rem', borderRadius: '20px' }}>
                      <CheckCircle size={14} /> Admin
                    </span>
                  )}
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Logout</button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to="/login" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>Login</Link>
                  <Link to="/register" style={{ background: '#0f172a', color: '#fff', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem', padding: '0.6rem 1.25rem', borderRadius: '30px' }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Global Page Router Container */}
        <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard role={role} token={token} searchQuery={searchQuery} />} />
            <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart token={token} />} />
            <Route path="/orders" element={<Orders token={token} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
