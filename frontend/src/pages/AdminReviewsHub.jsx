import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, User, Package } from 'lucide-react';

const AdminReviewsHub = ({ token }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllReviews = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/reviews/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAllReviews();
    }, [token]);

    const deleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to remove this feedback?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchAllReviews();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Feedback Hub...</div>;

    return (
        <div style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ background: '#fdf2f8', padding: '1rem', borderRadius: '15px' }}>
                    <MessageSquare size={32} color="#db2777" />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Global Feedback Hub</h1>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Moderate and monitor customer satisfaction across all products</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {reviews.map(rev => (
                    <div key={rev.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '50%' }}>
                                    <User size={16} color="#94a3b8" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800' }}>{rev.user_email}</p>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < rev.rating ? "#eab308" : "none"} color={i < rev.rating ? "#eab308" : "#cbd5e1"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deleteReview(rev.id)} style={{ background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', minHeight: '80px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>"{rev.comment}"</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <Package size={14} color="#94a3b8" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>{rev.product_name || "Veltrix Item #" + rev.product_id}</span>
                        </div>

                        {rev.sentiment_score !== undefined && (
                            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', background: rev.sentiment_score > 0 ? '#dcfce7' : '#fee2e2', color: rev.sentiment_score > 0 ? '#166534' : '#991b1b' }}>
                                {rev.sentiment_score > 0 ? 'Positive Vibe' : 'Critical Vibe'}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No feedback matches yet. Stay tuned!</p>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsHub;
