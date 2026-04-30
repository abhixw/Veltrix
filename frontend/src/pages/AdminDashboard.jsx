import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, Package, DollarSign, Clock, Bell, Star, MessageSquare } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ token }) => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState({ low_stock_count: 0, latest_reviews: [] });
    const [showNotifications, setShowNotifications] = useState(false);

    const loadData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [anaRes, lowRes, preRes, notRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/inventory/analytics', { headers }),
                fetch('http://127.0.0.1:8000/inventory/low-stock', { headers }),
                fetch('http://127.0.0.1:8000/inventory/prediction', { headers }),
                fetch('http://127.0.0.1:8000/inventory/notifications', { headers })
            ]);

            setAnalytics(await anaRes.json());
            setLowStock(await lowRes.json());
            setPredictions(await preRes.json());
            setNotifications(await notRes.json());
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const scrollToAlerts = () => {
        document.getElementById('urgent-alerts')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Intelligence Data...</div>;

    return (
        <div style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '15px' }}>
                        <TrendingUp size={32} color="#0369a1" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Inventory Intelligence</h1>
                        <p style={{ color: '#64748b', fontWeight: '500' }}>Predictive analytics and deep stock insights</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    {/* Stock Alert Static Badge */}
                    <button
                        onClick={scrollToAlerts}
                        style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                        <AlertTriangle size={18} color="#dc2626" />
                        <span style={{ fontWeight: '800', color: '#991b1b', fontSize: '0.9rem' }}>{notifications.low_stock_count} Alerts</span>
                    </button>

                    {/* Notifications Button */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: 'relative', background: '#fff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                        <Bell size={20} color="#64748b" />
                        {notifications.latest_reviews.length > 0 && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', background: 'var(--orange-primary)', color: '#fff', fontSize: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', border: '2px solid #fff' }}>{notifications.latest_reviews.length}</div>}
                    </button>

                    {/* NEW: Direct Link to Reviews Hub */}
                    <button
                        onClick={() => navigate('/admin-reviews')}
                        style={{ background: '#fdf2f8', border: '1px solid #fce7f3', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer', color: '#db2777', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <MessageSquare size={18} />
                        Detailed Reviews Hub
                    </button>

                    {/* Notifications Panel Dropdown */}
                    {showNotifications && (
                        <div style={{ position: 'absolute', top: '120%', right: 0, width: '350px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>Admin Notification Center</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.latest_reviews.length === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No recent reviews or alerts.</p>
                                ) : (
                                    notifications.latest_reviews.map(rev => (
                                        <div key={rev.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid var(--orange-primary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: '800', fontSize: '0.8rem' }}>New Review: {rev.product}</span>
                                                <div style={{ display: 'flex' }}>
                                                    {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="var(--orange-primary)" color="var(--orange-primary)" />)}
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>"{rev.comment}"</p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8' }}>by {rev.user}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>

                {/* 1. SALES ANALYTICS */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <DollarSign size={20} color="#0f172a" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Performance Rankings</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.map(item => (
                            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.total_sold} units sold</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '900', color: '#10b981' }}>${item.total_revenue.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Revenue</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. DEMAND PREDICTIONS */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Clock size={20} color="#0f172a" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Demand Prediction</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {predictions.map(pred => (
                            <div key={pred.product_id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{pred.name}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: pred.predicted_stockout_days < 7 ? '#ef4444' : '#64748b' }}>
                                        {pred.predicted_stockout_days === 999 ? "Stable" : `${pred.predicted_stockout_days} days left`}
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: pred.predicted_stockout_days === 999 ? '100%' : `${Math.min(100, (pred.predicted_stockout_days / 30) * 100)}%`,
                                        background: pred.predicted_stockout_days < 7 ? '#ef4444' : 'var(--orange-primary)'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. LOW STOCK ALERTS (Full Width Below) */}
                <div id="urgent-alerts" style={{ gridColumn: '1 / -1', background: '#fef2f2', padding: '2rem', borderRadius: '24px', border: '1px solid #fee2e2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertTriangle size={20} color="#dc2626" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#991b1b' }}>Urgent Stock Alerts</h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <p style={{ color: '#991b1b', fontWeight: '600' }}>All clear! No items are currently in critical regions.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {lowStock.map(p => (
                                <div key={p.id} style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{p.name}</div>
                                    <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '1.1rem' }}>Only {p.stock} left</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. CUSTOMER SENTIMENT & REVIEWS */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <MessageSquare size={20} color="#db2777" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Customer Feedback</h2>
                    </div>
                    <div style={{ background: '#fdf2f8', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#db2777', marginBottom: '0.25rem' }}>
                            ⭐ {notifications.latest_reviews.length > 0 ? (notifications.latest_reviews.reduce((acc, r) => acc + r.rating, 0) / notifications.latest_reviews.length).toFixed(1) : "N/A"}
                        </div>
                        <p style={{ color: '#db2777', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Recent Batch Rating</p>
                        <button
                            onClick={() => navigate('/admin-reviews')}
                            style={{ width: '100%', background: '#db2777', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            Open Global Reviews Hub
                        </button>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                        Monitor sentiment and moderate customer feedback in real-time.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
