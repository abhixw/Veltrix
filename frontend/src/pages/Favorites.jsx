import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Eye, Star, Heart, Trash2 } from 'lucide-react';

const Favorites = ({ token }) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/favorites/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFavorites(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadFavorites();
    }, [token]);

    const handleRemoveFavorite = async (productId) => {
        try {
            await fetch(`http://127.0.0.1:8000/favorites/toggle/${productId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFavorites(favorites.filter(p => p.id !== productId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/cart/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            if (res.ok) alert("Added to cart successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    if (!token) return <div style={{ padding: '4rem', textAlign: 'center' }}>Please login to view your wishlist.</div>;

    return (
        <div style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ background: '#fdf2f8', padding: '1rem', borderRadius: '15px' }}>
                    <Heart size={32} color="#db2777" fill="#db2777" />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>My Wishlist</h1>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>{favorites.length} items saved for later</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your favorites...</div>
            ) : favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <Heart size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#475569' }}>Your wishlist is empty</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Start exploring and save items you love!</p>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {favorites.map(p => (
                        <div key={p.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s', position: 'relative' }}>

                            {/* Actions Overlay */}
                            <button
                                onClick={() => handleRemoveFavorite(p.id)}
                                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#ef4444' }}>
                                <Trash2 size={18} />
                            </button>

                            <div style={{ height: '260px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={`http://127.0.0.1:8000${p.image_url}`} style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="" />
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ color: 'var(--orange-primary)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{p.category}</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>{p.name}</h3>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>${p.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>In Stock</span>
                                </div>

                                <button onClick={() => handleAddToCart(p.id)} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
