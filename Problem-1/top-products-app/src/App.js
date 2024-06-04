import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/categories/Laptop/products?top=10&minPrice=1&maxPrice=10000');
                setProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Top Products</h1>
                <div className="products">
                    {products.map(product => (
                        <div key={product.productId} className="product">
                            <h2>{product.productName}</h2>
                            <p>Company: {product.company}</p>
                            <p>Category: {product.category}</p>
                            <p>Price: ${product.price}</p>
                            <p>Rating: {product.rating}</p>
                            <p>Discount: {product.discount}%</p>
                            <p>Availability: {product.availability}</p>
                        </div>
                    ))}
                </div>
            </header>
        </div>
    );
}

export default App;
