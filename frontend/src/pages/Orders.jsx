import React, { useState, useEffect } from 'react';
import { Package, Calendar, Tag, CheckCircle } from 'lucide-react';

const Orders = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://127.0.0.1:8000/orders/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    if (!token) return <div style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b' }}><h3>Please login securely to view your order history.</h3></div>;
    if (loading) return <div style={{ marginTop: '4rem', textAlign: 'center' }}>Loading your secure order history...</div>;

    return (
        <div style={{ marginTop: '2rem', padding: '0 2rem' }}>
            <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Order History</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Review your past transactions and delivery status</p>
            </div>

            {orders.length === 0 ? (
                <div style={{ padding: '6rem', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <Package size={56} color="#cbd5e1" style={{ margin: '0 auto', opacity: 0.5 }} />
                    <h3 style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>You haven't placed any orders yet!</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>

                            {/* ORDER HEADER */}
                            <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Order ID</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>#VX-{order.id.toString().padStart(6, '0')}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Amount</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--orange-primary)' }}>${order.total_amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                                    <CheckCircle size={14} /> {order.status}
                                </div>
                            </div>

                            {/* ORDER ITEMS */}
                            <div style={{ padding: '1.5rem' }}>
                                {order.items.map((item, idx) => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: idx < order.items.length - 1 ? '1.5rem' : '0' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            {item.product.image_url ? (
                                                <img src={`http://127.0.0.1:8000${item.product.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.product.name} />
                                            ) : <Package size={24} color="#cbd5e1" style={{ margin: '18px' }} />}
                                        </div>
                                        <div style={{ flex: 1, marginLeft: '1.25rem' }}>
                                            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{item.product.name}</h4>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Qty: {item.quantity} × ${item.price_at_purchase.toFixed(2)}</p>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                                            ${(item.quantity * item.price_at_purchase).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
