import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, PlusCircle, X } from 'lucide-react';

const Dashboard = ({ role, token }) => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // React Form State for connecting to FastAPI
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);

    // 1. Fetch live products from PostgreSQL via FastAPI
    const loadProducts = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/products/');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // 2. Submit a new physical Image & Data securely to the Backend
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!token) return;

        // Because we are uploading an actual image file, we CANNOT use JSON!
        // We must use standard JavaScript FormData to construct the HTTP packet.
        const formData = new FormData();
        formData.append('name', name);
        if (description) formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        if (image) formData.append('image', image);

        try {
            const res = await fetch('http://127.0.0.1:8000/products/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Provide our secure JWT token!
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                // FastAPI sometimes returns an exact array of fields you missed. We must stringify it! 
                const errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail, null, 2);
                alert("Server Error:\n" + errorMsg);
                return;
            }

            // Success! Close the pop-up modal and refresh the frontend catalog!
            setIsModalOpen(false);
            setName(''); setDescription(''); setPrice(''); setStock(''); setImage(null);
            loadProducts();

        } catch (err) {
            console.error(err);
        }
    };

    // 3. Add to Cart Logic (For Shoppers)
    const handleAddToCart = async (productId) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            if (res.ok) alert("Added to cart successfully!");
            else alert("Failed to add to cart");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2>Product Catalog</h2>
                {/* CONDITIONAL RENDERING: Managers ONLY */}
                {role === 'manager' && (
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <PlusCircle size={20} /> Create Product
                    </button>
                )}
            </div>

            {/* Dynamic Native Grid mapping out actual PostgreSQL rows */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {products.map(p => (
                    <div key={p.id} className="glass-panel product-card">
                        <div className="product-img-wrapper" style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            {p.image_url ? (
                                // Notice we attach the FastAPI domain to the static path string!
                                <img src={`http://127.0.0.1:8000${p.image_url}`} alt={p.name} className="product-img" />
                            ) : (
                                <Package size={64} color="var(--text-secondary)" />
                            )}
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <h3>{p.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                {p.description || "No description provided."}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${p.price.toFixed(2)}</span>

                                {/* CONDITIONAL RENDERING: Shoppers ONLY */}
                                {role === 'user' && (
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleAddToCart(p.id)}>
                                        <ShoppingCart size={18} /> Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {products.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No products exist yet. Tell a manager to add some!</p>}
            </div>

            {/* MODAL OVERLAY FOR CREATING PRODUCTS */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Add New Product</h3>

                        <form onSubmit={handleCreateProduct} className="grid" style={{ gap: '1rem' }}>
                            <input className="input" type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input className="input" type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                            <input className="input" type="number" step="0.01" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
                            <input className="input" type="number" placeholder="Stock Quantity" value={stock} onChange={e => setStock(e.target.value)} required />

                            <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload Image:</label>
                                <input type="file" style={{ display: 'block', marginTop: '0.5rem', color: '#fff' }} onChange={e => setImage(e.target.files[0])} />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit to Server</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
