import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, LogIn, UserPlus, Package, PlusCircle } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

import Dashboard from './pages/Dashboard';

// Cart Placeholder
const Cart = () => <div className="glass-panel" style={{ padding: '2rem' }}>Shopping Cart coming soon...</div>;

function App() {
  // We extract both the JWT Token AND the Role mapped correctly into React State
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <div className="container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            <Package size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Veltrix
          </Link>

          <div className="nav-links">
            <Link to="/cart" className="btn btn-ghost">
              <ShoppingCart size={20} /> Cart
            </Link>

            {token ? (
              <>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  [{role}]
                </span>
                <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  <LogIn size={20} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <UserPlus size={20} /> Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Global Page Router */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard role={role} />} />
            <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
