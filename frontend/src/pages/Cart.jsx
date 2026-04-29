import React, { useState, useEffect } from 'react';
import { Package, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = ({ token }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/cart/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCartItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const handleCheckout = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/orders/checkout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Checkout 100% Successful! Your transaction processed securely.");
                setCartItems([]);
            } else {
                const err = await res.json();
                alert("Checkout Failed: " + (err.detail || "Server constraint failed"));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleClearCart = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/cart/clear', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/cart/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:8000/cart/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (res.ok || res.status === 204) fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    if (!token) return <div style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b' }}><h3>Please login securely to view your cart.</h3></div>;
    if (loading) return <div style={{ marginTop: '4rem', textAlign: 'center' }}>Loading your secure cart...</div>;

    const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div style={{ marginTop: '2rem', padding: '0 2rem' }}>

            {/* HEADER SECTION mimicking Vibe Commerce layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Shopping Cart</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{cartItems.length} items in your cart</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleClearCart} style={{ background: '#fff', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Clear Cart</button>
                    <Link to="/" style={{ background: '#fff', border: '1px solid #0f172a', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>Continue Shopping</Link>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div style={{ padding: '6rem', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <Package size={56} color="#cbd5e1" style={{ margin: '0 auto', opacity: 0.5 }} />
                    <h3 style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>Your cart is empty!</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>

                    {/* VIBE COMMERCE CART LIST LAYOUT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        {cartItems.map((item, index) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: index < cartItems.length - 1 ? '1px solid #e2e8f0' : 'none' }}>

                                {/* Product Image */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    {item.product.image_url ? (
                                        <img src={`http://127.0.0.1:8000${item.product.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.product.name} />
                                    ) : (<Package size={32} color="#cbd5e1" style={{ margin: '24px' }} />)}
                                </div>

                                {/* Product Name & Category */}
                                <div style={{ flex: 1, marginLeft: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.25rem' }}>{item.product.name}</h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>{item.product.category}</p>
                                </div>

                                {/* Individual Price */}
                                <div style={{ width: '120px', fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                                    ${(item.product.price).toFixed(2)}
                                </div>

                                {/* Quantity Mock Layout [- 1 +] */}
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', marginRight: '3rem' }}>
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} style={{ background: '#fff', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#64748b' }}>-</button>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', padding: '0 0.5rem', color: '#0f172a' }}>{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} style={{ background: '#fff', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#64748b' }}>+</button>
                                </div>

                                {/* Subtotal & Trash Native Row */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', width: '100px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Subtotal</span>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>

                                <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1.5rem', padding: '0.5rem' }}>
                                    <Trash2 size={18} color="#ef4444" />
                                </button>

                            </div>
                        ))}
                    </div>

                    {/* TOTAL & CHECKOUT FOOTER */}
                    <div style={{ padding: '2rem 1.5rem', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>{cartItems.length} Items • Free Shipping</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Total: ${total.toFixed(2)}</h3>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }} onClick={handleCheckout}>
                            Proceed Securely <ArrowRight size={18} />
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Cart;
