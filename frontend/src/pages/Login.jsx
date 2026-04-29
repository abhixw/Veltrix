import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Remember: FastAPI requires standard OAuth2 Form-Data, not raw JSON here!
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

            navigate('/'); // Send to dashboard safely
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h2>Sign In</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Access your personalized dashboard.</p>

            {error && <div className="alert">{error}</div>}

            <form onSubmit={handleLogin} className="grid" style={{ gap: '1rem' }}>
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;
