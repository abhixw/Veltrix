import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck, ChevronRight } from 'lucide-react';

const Checkout = ({ token }) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [address, setAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        zipCode: ''
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/cart/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCartItems(data);
                    const t = data.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
                    setTotal(t);
                } else {
                    setCartItems([]);
                    setTotal(0);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (token) fetchCart();
    }, [token]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleApplyCoupon = async () => {
        setCouponError('');
        try {
            const res = await fetch('http://127.0.0.1:8000/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data);
                // Calculate discount
                let disc = 0;
                if (data.discount_type === 'percentage') {
                    disc = (total * data.discount_value) / 100;
                } else {
                    disc = data.discount_value;
                }
                setDiscountAmount(disc);
            } else {
                setCouponError(data.detail || 'Invalid coupon');
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (err) {
            setCouponError('Error validating coupon');
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            console.log("Initiating purchase...");
            const res = await fetch('http://127.0.0.1:8000/orders/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    coupon_code: appliedCoupon ? appliedCoupon.code : null
                })
            });

            if (res.ok) {
                alert("✨ Order Placed Successfully! Your items are reserved and payment is processed.");
                navigate('/orders');
            } else {
                const err = await res.json();
                alert(`⚠️ Checkout Error: ${err.detail || "We couldn't process your payment. Please check your stock availability."}`);
            }
        } catch (err) {
            console.error("Checkout crash:", err);
            alert("🚨 System error during purchase. Please try again later.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!token) return <div style={{ marginTop: '4rem', textAlign: 'center' }}>Please login to checkout.</div>;
    if (cartItems.length === 0) return <div style={{ marginTop: '4rem', textAlign: 'center' }}>Your cart is empty. Nothing to checkout!</div>;

    return (
        <div style={{ marginTop: '2rem', padding: '0 2rem', maxWidth: '1200px', margin: '2rem auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', color: '#0f172a' }}>Secure Checkout</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>

                {/* LEFT: ADDRESS FORM */}
                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <MapPin color="var(--orange-primary)" size={22} />
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Shipping Information</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                                <input required type="text" className="input" value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Street Address</label>
                                <input required type="text" className="input" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="123 Veltrix Lane" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>City</label>
                                    <input required type="text" className="input" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Metropolis" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>ZIP Code</label>
                                    <input required type="text" className="input" value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} placeholder="90210" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <CreditCard color="var(--orange-primary)" size={22} />
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Payment Method</h3>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '25px', background: '#0f172a', borderRadius: '4px' }}></div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Secure Payment Gateway</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>All transactions are encrypted and secure.</p>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.1rem', borderRadius: '12px', marginTop: '1rem', opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                        {isProcessing ? "Processing Transaction..." : "Complete Purchase"} <ChevronRight size={20} />
                    </button>
                </form>

                {/* RIGHT: ORDER SUMMARY */}
                <div>
                    <div style={{ position: 'sticky', top: '120px' }}>
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Order Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                                {cartItems.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                                                <img src={`http://127.0.0.1:8000${item.product.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{item.product.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                                    <span>Shipping</span>
                                    <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span>
                                </div>

                                {appliedCoupon && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#db2777', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div style={{ marginTop: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Promo Code</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            style={{ padding: '0.6rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: '600' }}>{couponError}</p>}
                                    {appliedCoupon && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: '600' }}>Applied: {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% OFF` : `$${appliedCoupon.discount_value} OFF`}</p>}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>Total</span>
                                    <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--orange-primary)' }}>${(total - discountAmount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
