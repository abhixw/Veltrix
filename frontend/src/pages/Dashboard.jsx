import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, PlusCircle, X, Eye, Star, Heart } from 'lucide-react';

const Dashboard = ({ role, token, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ["Electronics", "Lifestyle", "Jewellery", "Men's Clothing", "Women's Clothing", "Shoes", "Sports"];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);

    const loadProducts = async () => {
        try {
            const url = searchQuery
                ? `http://127.0.0.1:8000/products/?search=${encodeURIComponent(searchQuery)}`
                : 'http://127.0.0.1:8000/products/';
            const res = await fetch(url);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [searchQuery]);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!token) return;

        const formData = new FormData();
        formData.append('name', name);
        if (description) formData.append('description', description);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('stock', stock);
        if (image) formData.append('image', image);

        try {
            const res = await fetch('http://127.0.0.1:8000/products/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                const errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail, null, 2);
                alert("Server Error:\n" + errorMsg);
                return;
            }

            setIsModalOpen(false);
            setName(''); setDescription(''); setCategory(categories[0]); setPrice(''); setStock(''); setImage(null);
            loadProducts();

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
            else alert("Failed to add to cart");
        } catch (err) {
            console.error(err);
        }
    };

    const displayedProducts = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2.5rem 2rem', alignItems: 'flex-start' }}>

            {/* VERTICAL SIDEBAR CATEGORIES */}
            <div style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '100px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>Shop by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                        onClick={() => setSelectedCategory('All')}
                        style={{ textAlign: 'left', background: selectedCategory === 'All' ? '#fff7ed' : 'none', border: 'none', color: selectedCategory === 'All' ? 'var(--orange-primary)' : '#475569', fontWeight: selectedCategory === 'All' ? '800' : '600', cursor: 'pointer', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{ textAlign: 'left', background: selectedCategory === cat ? '#fff7ed' : 'none', border: 'none', color: selectedCategory === cat ? 'var(--orange-primary)' : '#475569', fontWeight: selectedCategory === cat ? '800' : '600', cursor: 'pointer', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                        >
                            {cat} <span style={{ color: '#94a3b8', fontWeight: '500', marginLeft: '6px' }}>({products.filter(p => p.category === cat).length})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN PRODUCT GRID AREA */}
            <div style={{ flex: 1, position: 'relative' }}>

                {role === 'manager' && (
                    <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            <PlusCircle size={18} /> Upload Inventory
                        </button>
                    </div>
                )}

                {/* VIBE COMMERCE PRODUCT GRID LAYOUT */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {displayedProducts.map(p => (
                        <div key={p.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>

                            {/* Minimalist Image Container with Floating Badges */}
                            <div style={{ height: '300px', background: '#f8fafc', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                {/* Category Floating Tag */}
                                <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#eab308', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {p.category}
                                </span>

                                {/* Heart Wishlist Mock */}
                                <button style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    <Heart size={18} color="#64748b" />
                                </button>

                                {p.image_url ? (
                                    <img src={`http://127.0.0.1:8000${p.image_url}`} style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt={p.name} />
                                ) : (
                                    <Package size={64} color="#cbd5e1" />
                                )}
                            </div>

                            {/* Bottom Content Area */}
                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', lineHeight: '1.3' }}>{p.name}</h3>
                                <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: '1.5', flex: 1 }}>{p.description || "Comfortable, premium-quality materials."}</p>

                                {/* Star Rating Layout (Visual) */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '1.25rem' }}>
                                    <Star size={14} fill="#eab308" color="#eab308" />
                                    <Star size={14} fill="#eab308" color="#eab308" />
                                    <Star size={14} fill="#eab308" color="#eab308" />
                                    <Star size={14} fill="#eab308" color="#eab308" />
                                    <Star size={14} fill="none" color="#cbd5e1" />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px', fontWeight: '600' }}>(4.0) • 234 reviews</span>
                                </div>

                                {/* Price Row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>${p.price.toFixed(2)}</span>
                                    {p.stock > 0 ? (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.stock} in stock</span>
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Out of stock</span>
                                    )}
                                </div>

                                {/* Flex Button Group */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={{ flex: 1, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.6rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <Eye size={16} /> Quick View
                                    </button>

                                    {role === 'user' ? (
                                        <button onClick={() => handleAddToCart(p.id)} style={{ flex: 1, background: 'var(--orange-primary)', border: '1px solid var(--orange-hover)', borderRadius: '6px', padding: '0.6rem', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)' }}>
                                            <ShoppingCart size={16} /> Add to Cart
                                        </button>
                                    ) : (
                                        <div style={{ flex: 1, alignSelf: 'center', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>ADMIN LOCK</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {displayedProducts.length === 0 && <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>No items exist in this section yet. Switch tabs to keep browsing!</p>}
                </div>

                {/* MODAL OVERLAY */}
                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: '16px', width: '420px', padding: '2.5rem', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={16} strokeWidth={3} />
                            </button>
                            <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontWeight: '800' }}>Upload New Item</h3>

                            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Section</label>
                                    <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ cursor: 'pointer' }}>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Product Name</label>
                                    <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Description</label>
                                    <input className="input" type="text" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Price ($)</label>
                                        <input className="input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Stock Quantity</label>
                                        <input className="input" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Upload Image File:</label>
                                    <input type="file" style={{ display: 'block', marginTop: '0.5rem', color: '#475569', fontSize: '0.9rem' }} onChange={e => setImage(e.target.files[0])} />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '8px' }}>Deploy to Store</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
