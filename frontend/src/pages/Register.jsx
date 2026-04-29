import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Toggle between user and manager
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Registration allows raw JSON because it is NOT an OAuth2 lock button!
            const res = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Registration failed');

            // Boot them to the login screen safely
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h2>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join the Veltrix platform today.</p>

            {error && <div className="alert">{error}</div>}

            <form onSubmit={handleRegister} className="grid" style={{ gap: '1rem' }}>
                <input
                    className="input"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <select
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="user">Customer Account (Shopper)</option>
                    <option value="manager">Manager Account (Admin)</option>
                </select>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
            </form>
        </div>
    );
};

export default Register;
