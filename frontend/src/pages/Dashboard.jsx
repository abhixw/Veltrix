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

    // RECOMMENDATION STATES
    const [recentProducts, setRecentProducts] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [coOccurringProducts, setCoOccurringProducts] = useState([]);
    const [collaborativeProducts, setCollaborativeProducts] = useState([]);
    const [semanticProducts, setSemanticProducts] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedQuickView, setSelectedQuickView] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

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

    const loadRecommendations = async () => {
        try {
            // 1. Fetch Top Selling
            const topRes = await fetch('http://127.0.0.1:8000/recommendations/top-selling');
            const topData = await topRes.json();
            setTopSellingProducts(topData);

            // 2. Fetch Recently Viewed (Only if logged in)
            if (token) {
                const headers = { 'Authorization': `Bearer ${token}` };

                const recentRes = await fetch('http://127.0.0.1:8000/recommendations/recently-viewed', { headers });
                if (recentRes.ok) {
                    const recentData = await recentRes.json();
                    setRecentProducts(Array.isArray(recentData) ? recentData : []);
                }

                // Fetch Favorite IDs
                const favRes = await fetch('http://127.0.0.1:8000/favorites/ids', { headers });
                if (favRes.ok) {
                    const favData = await favRes.json();
                    setFavoriteIds(Array.isArray(favData) ? favData : []);
                } else if (favRes.status === 401) {
                    // Token likely invalid/expired
                    setFavoriteIds([]);
                }
            }
        } catch (err) {
            console.error("Failed to load user data:", err);
            setFavoriteIds([]);
            setRecentProducts([]);
        }
    };

    useEffect(() => {
        loadProducts();
        loadRecommendations();
    }, [searchQuery, token]);

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

    const handleToggleFavorite = async (productId) => {
        if (!token) return alert("Please login to save favorites!");
        try {
            const res = await fetch(`http://127.0.0.1:8000/favorites/toggle/${productId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'added') setFavoriteIds([...favoriteIds, productId]);
                else setFavoriteIds(favoriteIds.filter(id => id !== productId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuickView = async (product) => {
        setSelectedQuickView(product);
        if (token) {
            // Log view to backend
            try {
                await fetch(`http://127.0.0.1:8000/recommendations/view/${product.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                loadRecommendations(); // Refresh history
            } catch (err) {
                console.error(err);
            }
        }

        // Fetch co-occurrence recommendations
        try {
            const coRes = await fetch(`http://127.0.0.1:8000/recommendations/co-occurrence/${product.id}`);
            const coData = await coRes.json();
            setCoOccurringProducts(coData);

            const colRes = await fetch(`http://127.0.0.1:8000/recommendations/collaborative/${product.id}`);
            const colData = await colRes.json();
            setCollaborativeProducts(colData);

            const semRes = await fetch(`http://127.0.0.1:8000/recommendations/semantic/${product.id}`);
            const semData = await semRes.json();
            setSemanticProducts(semData);

            // Fetch Reviews
            const revRes = await fetch(`http://127.0.0.1:8000/reviews/${product.id}`);
            if (revRes.ok) {
                const revData = await revRes.json();
                setReviews(Array.isArray(revData) ? revData : []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateReview = async (e) => {
        e.preventDefault();
        if (!token) return alert("Please login to review!");
        try {
            const res = await fetch(`http://127.0.0.1:8000/reviews/${selectedQuickView.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
            });

            if (res.ok) {
                alert("Review submitted!");
                setReviewComment('');
                // Refresh reviews
                const revRes = await fetch(`http://127.0.0.1:8000/reviews/${selectedQuickView.id}`);
                const revData = await revRes.json();
                setReviews(revData);
            } else {
                const err = await res.json();
                alert(err.detail || "Error submitting review");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const displayedProducts = products.filter(p => {
        if (selectedCategory === 'Favorites') return favoriteIds.includes(p.id);
        return selectedCategory === 'All' || p.category === selectedCategory;
    });

    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2.5rem 2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* VERTICAL SIDEBAR CATEGORIES - Responsive */}
            <div style={{
                width: window.innerWidth < 1024 ? '100%' : '240px',
                flexShrink: 0,
                position: window.innerWidth < 1024 ? 'static' : 'sticky',
                top: '100px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>Shop by Category</h3>
                <div style={{ display: 'flex', flexDirection: window.innerWidth < 1024 ? 'row' : 'column', gap: '0.5rem', overflowX: 'auto', paddingBottom: window.innerWidth < 1024 ? '1rem' : '0' }}>
                    <button
                        onClick={() => setSelectedCategory('All')}
                        style={{ textAlign: 'left', background: selectedCategory === 'All' ? '#fff7ed' : 'none', border: 'none', color: selectedCategory === 'All' ? 'var(--orange-primary)' : '#475569', fontWeight: selectedCategory === 'All' ? '800' : '600', cursor: 'pointer', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                    >
                        All Categories
                    </button>
                    {role === 'user' && (
                        <button
                            onClick={() => setSelectedCategory('Favorites')}
                            className={`tab ${selectedCategory === 'Favorites' ? 'active' : ''}`}
                            style={{ background: selectedCategory === 'Favorites' ? 'var(--orange-primary)' : 'rgba(255,255,255,0.8)', color: selectedCategory === 'Favorites' ? '#fff' : '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: selectedCategory === 'Favorites' ? '0 4px 12px rgba(249, 115, 22, 0.2)' : 'none' }}>
                            <Heart size={16} fill={selectedCategory === 'Favorites' ? '#db2777' : 'none'} /> My Wishlist
                        </button>
                    )}
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
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>

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

                                {p.stock < 5 && p.stock > 0 && (
                                    <span style={{ position: 'absolute', top: '45px', left: '16px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: '900', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        Low Stock
                                    </span>
                                )}

                                {/* Heart Wishlist Mock */}
                                {role === 'user' && (
                                    <button
                                        onClick={() => handleToggleFavorite(p.id)}
                                        style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s', transform: favoriteIds.includes(p.id) ? 'scale(1.1)' : 'scale(1)' }}>
                                        <Heart size={20} color={favoriteIds.includes(p.id) ? '#db2777' : '#64748b'} fill={favoriteIds.includes(p.id) ? '#db2777' : 'none'} />
                                    </button>
                                )}

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
                                    <button onClick={() => handleQuickView(p)} style={{ flex: 1, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.6rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <Eye size={16} /> Details & Reviews
                                    </button>

                                    {role === 'user' ? (
                                        <button
                                            onClick={() => handleAddToCart(p.id)}
                                            disabled={p.stock <= 0}
                                            style={{
                                                flex: 1,
                                                background: p.stock <= 0 ? '#e2e8f0' : 'var(--orange-primary)',
                                                border: '1px solid var(--orange-hover)',
                                                borderRadius: '6px',
                                                padding: '0.6rem',
                                                color: p.stock <= 0 ? '#94a3b8' : '#fff',
                                                fontWeight: '700',
                                                fontSize: '0.85rem',
                                                cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                boxShadow: p.stock <= 0 ? 'none' : '0 4px 6px rgba(249, 115, 22, 0.2)'
                                            }}>
                                            <ShoppingCart size={16} /> {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}
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

                {/* TOP TRENDING STRIP (User only) */}
                {role === 'user' && topSellingProducts.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#fff7ed', padding: '0.5rem', borderRadius: '10px' }}>
                                <Star size={20} color="var(--orange-primary)" fill="var(--orange-primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Trending This Week</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                            {topSellingProducts.map(p => (
                                <div key={p.id} onClick={() => handleQuickView(p)} style={{ minWidth: '200px', background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <div style={{ height: '140px', background: '#f8fafc', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={`http://127.0.0.1:8000${p.image_url}`} style={{ width: '70%', height: '70%', objectFit: 'contain' }} alt="" />
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.25rem' }}>{p.name}</div>
                                    <div style={{ fontWeight: '800', color: 'var(--orange-primary)', fontSize: '0.9rem' }}>${p.price.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PERSONALIZED RECS (User only) */}
                {role === 'user' && recentProducts.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#f0f9ff', padding: '0.5rem', borderRadius: '10px' }}>
                                <Eye size={20} color="#0369a1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Picked for You</h2>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>(Based on your history)</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                            {recentProducts.map(p => (
                                <div key={p.id} onClick={() => handleQuickView(p)} style={{ minWidth: '180px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1rem', cursor: 'pointer' }}>
                                    <div style={{ height: '120px', background: '#f8fafc', borderRadius: '12px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={`http://127.0.0.1:8000${p.image_url}`} style={{ width: '60%', height: '60%', objectFit: 'contain' }} alt="" />
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#0f172a' }}>{p.name}</div>
                                    <div style={{ fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>${p.price.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem'
                                }}>
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

                {/* QUICK VIEW MODAL - Responsive & Universal */}
                {selectedQuickView && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '2rem' }}>
                        <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '1000px', padding: '2rem', position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: 'auto' }}>
                            <button
                                onClick={() => setSelectedQuickView(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} strokeWidth={3} />
                            </button>

                            {/* Left: Huge Product Image */}
                            <div style={{ flex: '1 1 350px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                <img src={`http://127.0.0.1:8000${selectedQuickView.image_url}`} style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt="" />
                            </div>

                            {/* Right: Info & Logic */}
                            <div style={{ flex: 1 }}>
                                <span style={{ color: 'var(--orange-primary)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedQuickView.category}</span>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem', marginBottom: '1rem' }}>{selectedQuickView.name}</h2>
                                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{selectedQuickView.description || "Crafted with the finest materials for ultimate comfort and durability."}</p>

                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>${selectedQuickView.price.toFixed(2)}</div>

                                <button
                                    onClick={() => { handleAddToCart(selectedQuickView.id); setSelectedQuickView(null); }}
                                    disabled={selectedQuickView.stock <= 0}
                                    style={{ width: '100%', background: selectedQuickView.stock <= 0 ? '#e2e8f0' : 'var(--orange-primary)', border: 'none', color: selectedQuickView.stock <= 0 ? '#94a3b8' : '#fff', padding: '1.25rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', cursor: selectedQuickView.stock <= 0 ? 'not-allowed' : 'pointer' }}>
                                    {selectedQuickView.stock <= 0 ? "Unavailable (Out of Stock)" : "Add to Secure Basket"}
                                </button>

                                {/* CO-OCCURRENCE: USERS ALSO BOUGHT */}
                                {coOccurringProducts.length > 0 && (
                                    <div style={{ marginTop: '2.5rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Customers also grabbed:</h4>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {coOccurringProducts.map(cop => (
                                                <div key={cop.id} onClick={() => handleQuickView(cop)} style={{ flex: 1, background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img src={`http://127.0.0.1:8000${cop.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cop.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* COLLABORATIVE: SIMILAR STYLE */}
                                {collaborativeProducts.length > 0 && (
                                    <div style={{ marginTop: '2rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>People with your style liked:</h4>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {collaborativeProducts.map(cp => (
                                                <div key={cp.id} onClick={() => handleQuickView(cp)} style={{ flex: 1, background: '#fef2f2', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fecaca', cursor: 'pointer' }}>
                                                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img src={`http://127.0.0.1:8000${cp.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                                    </div>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cp.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SEMANTIC: YOU MIGHT ALSO VIBE WITH */}
                                {semanticProducts.length > 0 && (
                                    <div style={{ marginTop: '2rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Similar Vibe:</h4>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {semanticProducts.map(sp => (
                                                <div key={sp.id} onClick={() => handleQuickView(sp)} style={{ flex: 1, background: '#f5f3ff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd6fe', cursor: 'pointer' }}>
                                                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img src={`http://127.0.0.1:8000${sp.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                                    </div>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sp.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM AREA: REVIEWS SECTION */}
                        <div style={{ background: '#fff', width: '100%', maxWidth: '1000px', marginTop: '2rem', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', margin: '0 auto 4rem auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1.5fr', gap: '2rem' }}>

                                {/* REVIEW FORM - Restricted to Logged In Users */}
                                {token ? (
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Write a Review</h3>
                                        <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>Rating</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <Star size={24} fill={s <= reviewRating ? "var(--orange-primary)" : "none"} color={s <= reviewRating ? "var(--orange-primary)" : "#cbd5e1"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>Your Experience</label>
                                                <textarea className="input" rows="4" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was the quality? Did it arrive on time?" style={{ resize: 'none' }} />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: '8px' }}>Post Review</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                                        <Star size={32} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Log in to share your thoughts about this product!</p>
                                    </div>
                                )}

                                {/* REVIEWS LIST */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Customer Feedback ({reviews.length})</h3>
                                        <select
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.5rem', cursor: 'pointer', outline: 'none' }}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const sorted = [...reviews].sort((a, b) => {
                                                    if (val === 'rating') return b.rating - a.rating;
                                                    return new Date(b.created_at) - new Date(a.created_at);
                                                });
                                                setReviews(sorted);
                                            }}
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="rating">Top Rated</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                                        {reviews.length === 0 ? (
                                            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>No reviews yet. Be the first to share your thoughts!</p>
                                        ) : (
                                            reviews.map(rev => (
                                                <div key={rev.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={12} fill={i < rev.rating ? "#eab308" : "none"} color={i < rev.rating ? "#eab308" : "#cbd5e1"} />
                                                                ))}
                                                            </div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{rev.user_email.split('@')[0]}</span>
                                                            {rev.verified_purchase && (
                                                                <span style={{ marginLeft: '10px', fontSize: '0.65rem', fontWeight: '900', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Verified</span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{rev.comment}</p>

                                                    {/* Sentiment AI Tag */}
                                                    {rev.sentiment_score > 0.3 && <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#059669', display: 'inline-block', marginTop: '0.5rem' }}>✨ Highly Positive Experience</span>}
                                                    {rev.sentiment_score < -0.3 && <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#ef4444', display: 'inline-block', marginTop: '0.5rem' }}>⚠️ Critical Feedback</span>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
