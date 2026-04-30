import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react'; // We use the Package icon to mimic their owl logo aesthetic!

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user'); // Toggle between user and manager
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Registration failed');

            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>

            <div style={{ background: '#fff', borderRadius: '32px', padding: '3.5rem 3rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', textAlign: 'center' }}>

                {/* LOGO SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '20px', marginBottom: '1rem' }}>
                        <Package size={48} color="#10b981" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#064e3b', letterSpacing: '-1px' }}>Veltrix <span style={{ color: '#10b981' }}>Commerce</span></h1>
                </div>

                <h2 style={{ color: '#064e3b', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Create Account</h2>
                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Start your retail journey today</p>

                {error && <div className="alert" style={{ textAlign: 'left', background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>{error}</div>}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem 1.1rem', border: '2px solid #d1fae5', borderRadius: '14px', fontSize: '1rem', outline: 'none', background: '#f9fafb' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem 1.1rem', border: '2px solid #d1fae5', borderRadius: '14px', fontSize: '1rem', outline: 'none', background: '#f9fafb' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem 1.1rem', border: '2px solid #d1fae5', borderRadius: '14px', fontSize: '1rem', outline: 'none', background: '#f9fafb' }}
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
                            marginTop: '1rem'
                        }}
                    >
                        Create Account
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.95rem', color: '#64748b' }}>
                    Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: '800', textDecoration: 'none' }}>Sign In</Link>
                </p>

            </div>
        </div>
    );
};

export default Register;
