const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const CATEGORIES = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];
const TEST_SERVER_BASE_URL = "http://20.244.56.144/test/companies";
const AUTH_TOKEN = "eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9 eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzEwODM1MjY4LCJpYXQi0jE3MTA4M zQ5NjgsImlzcyI6IkFmZm9yZG11ZCIsImp@aSI6IjM3YmI0OTNjLTczZDMtNDd1YS04Njc1LTIxZjY2ZWY5YjczNSIsInN1 YiI6InJhaHVsQGFiYy51ZHUifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjM3YmI0OTNjLTczZDMtNDd 1YS04Njc1LTIxZjY2ZWY5YjczNSIsImNsaWVudFN1Y3J1dCI6IkhWSVFCVmJxbVRHRW1hRUQiLCJvd25lck5hbWUiOiJSYW h1bCIsIm93bmVyRW1haWwiOiJyYWh1bEBhYmMuZWR1Iiwicm9sbE5vIjoiMSJ9.gmk2F73GZ7q7EaIGDShc4oDKK1zWQ9Up 3xQ-4Dbsu8A"; // Replace with your actual token

// Enable CORS for all routes
app.use(cors());

const fetchProductsFromCompany = async (company, category, minPrice, maxPrice, topN) => {
    try {
        const url = `${TEST_SERVER_BASE_URL}/${company}/categories/${category}/products?top=${topN}&minPrice=${minPrice}&maxPrice=${maxPrice === Infinity ? 1000000000 : maxPrice}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}` // Include the authorization header
            }
        });
        return response.data.map(product => ({
            ...product,
            company,
            uniqueId: crypto.createHash('md5').update(`${company}-${product.productName}-${product.price}`).digest('hex')
        }));
    } catch (error) {
        console.error(`Error fetching data from ${company}:`, error.message);
        return [];
    }
};

app.get('/categories/:category/products', async (req, res) => {
    const { category } = req.params;
    const { top = 10, minPrice = 0, maxPrice = Infinity, sort, order = 'asc', page = 1 } = req.query;

    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    const promises = COMPANIES.map(company => fetchProductsFromCompany(company, category, parseFloat(minPrice), parseFloat(maxPrice), parseInt(top, 10)));
    let products = (await Promise.all(promises)).flat();

    if (sort) {
        products.sort((a, b) => {
            if (order === 'asc') {
                return a[sort] > b[sort] ? 1 : -1;
            } else {
                return a[sort] < b[sort] ? 1 : -1;
            }
        });
    }

    const pageSize = parseInt(top, 10);
    const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

    res.json(paginatedProducts);
});

app.get('/categories/:category/products/:productId', async (req, res) => {
    const { category, productId } = req.params;

    const promises = COMPANIES.map(company => fetchProductsFromCompany(company, category, 0, 1000000000, 100));
    let products = (await Promise.all(promises)).flat();
    const product = products.find(p => p.uniqueId === productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
