import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Login = ({ setToken, setRole, setUserEmail }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userEmail', email); // Save for Admin verification
            setToken(data.access_token);
            setRole(data.role);
            setUserEmail(email);

            navigate('/'); // Go back to dashboard!
        } catch (err) {
            setError(err.message);
        }
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>

            <div style={{ background: '#fff', borderRadius: '32px', padding: '4rem 3rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', textAlign: 'center' }}>

                {/* LOGO SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '20px', marginBottom: '1rem' }}>
                        <Package size={48} color="#10b981" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#064e3b', letterSpacing: '-1px' }}>Veltrix <span style={{ color: '#10b981' }}>Commerce</span></h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginTop: '0.5rem' }}>Secure Enterprise Gateway</p>
                </div>

                <h2 style={{ color: '#064e3b', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Login</h2>
                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Welcome back to your workspace</p>

                {error && <div className="alert" style={{ textAlign: 'left', background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1.25rem', border: '2px solid #d1fae5', borderRadius: '14px', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', background: '#f9fafb' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1.25rem', border: '2px solid #d1fae5', borderRadius: '14px', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', background: '#f9fafb' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            width: '100%',
                            padding: '1.1rem',
                            background: isHovered ? '#2563eb' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isHovered ? '0 10px 15px -3px rgba(37, 99, 235, 0.3)' : '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        Sign In
                    </button>
                </form>

                <p style={{ marginTop: '2.5rem', fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>
                    Need a professional account? <Link to="/register" style={{ color: '#10b981', fontWeight: '800', textDecoration: 'none', borderBottom: '2px solid #d1fae5' }}>Register</Link>
                </p>

            </div>
        </div>
    );
};

export default Login;
