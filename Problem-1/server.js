const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001;

// Define the base URL for the test server
const TEST_SERVER_BASE_URL = "http://20.244.56.144/test/companies/AMZ/categories/Laptop/products?top=10&minPrice=1&maxPrice=10000";

// Function to fetch top products from a company and category
async function fetchTopProducts(company, category, top, minPrice, maxPrice) {
    const url = `${TEST_SERVER_BASE_URL}/companies/${company}/categories/${category}/products`;

    const params = {
        top,
        minPrice,
        maxPrice
    };

    try {
        const response = await axios.get(url, { params });
        return response.data.map((product, index) => ({
            ...product,
            productId: `${company}_${category}_${index}` // Generate unique product ID
        }));
    } catch (error) {
        console.error('Error fetching top products:', error);
        throw error;
    }
}

// Endpoint to get top products by category
app.get('/categories/:categoryName/products', async (req, res) => {
    const { categoryName } = req.params;
    const { top, minPrice, maxPrice, page, sort } = req.query;
    const company = req.query.company || 'AMZ'; // Default to 'AMZ' if company is not provided

    try {
        const products = await fetchTopProducts(company, categoryName, top, minPrice, maxPrice);

        // Sorting logic
        if (sort) {
            products.sort((a, b) => {
                switch (sort) {
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'rating_asc':
                        return a.rating - b.rating;
                    case 'rating_desc':
                        return b.rating - a.rating;
                    case 'discount_asc':
                        return a.discount - b.discount;
                    case 'discount_desc':
                        return b.discount - a.discount;
                    default:
                        return 0;
                }
            });
        }

        
        // Pagination logic
        let start = 0;
        let end = products.length;

        if (page && top > 10) {
            start = (page - 1) * top;
            end = start + parseInt(top);
        }

        const paginatedProducts = products.slice(start, end);

        res.json(paginatedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get a specific product by ID
app.get('/categories/:categoryName/products/:productId', async (req, res) => {
    const { categoryName, productId } = req.params;
    const company = req.query.company || 'AMZ'; // Default to 'AMZ' if company is not provided

    try {
        const products = await fetchTopProducts(company, categoryName, 10, 0, 10000);

        const product = products.find(p => p.productId === productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
