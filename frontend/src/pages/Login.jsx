import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Login = ({ setToken, setRole }) => {
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
            setToken(data.access_token);
            setRole(data.role);

            navigate('/'); // Go back to dashboard!
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>

            {/* Central Vaultflow Card UI perfectly mimicking the request screenshot */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '3.5rem 2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', textAlign: 'center' }}>

                {/* Mock Logo Header */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--blue-glow)', padding: '1rem', borderRadius: '50%' }}>
                        <Package size={42} color="var(--blue-accent)" style={{ display: 'block' }} />
                    </div>
                </div>

                {/* Blue Stylized Typography */}
                <h2 style={{ color: 'var(--blue-accent)', fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem', fontWeight: '500' }}>Log in to Veltrix today</p>

                {error && <div className="alert" style={{ textAlign: 'left' }}>{error}</div>}

                {/* The Form Fields matching the Vaultflow aesthetic */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid #93c5fd', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', background: '#fff', color: 'var(--text-primary)' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--blue-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#93c5fd'}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid #93c5fd', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', background: '#fff', color: 'var(--text-primary)' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--blue-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#93c5fd'}
                            required
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--blue-accent)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', marginTop: '1rem', boxShadow: '0 4px 14px var(--blue-glow)' }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Login
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--blue-accent)', fontWeight: '700', textDecoration: 'none' }}>Register here</Link>
                </p>

            </div>
        </div>
    );
};

export default Login;
