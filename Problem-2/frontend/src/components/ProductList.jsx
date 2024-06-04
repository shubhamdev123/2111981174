import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, TextField, MenuItem, Button, Grid, Card, CardContent, Typography } from '@mui/material';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Laptop');
  const [top, setTop] = useState(10);
  const [sort, setSort] = useState('');
  const [order, setOrder] = useState('asc');

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/categories/${category}/products`, {
        params: { top, sort, order }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, top, sort, order]);

  return (
    <Container>
      <TextField
        label="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        select
        fullWidth
        margin="normal"
      >
        <MenuItem value="Laptop">Laptop</MenuItem>
        <MenuItem value="Phone">Phone</MenuItem>
        {/* Add other categories as needed */}
      </TextField>
      <TextField
        label="Top N"
        value={top}
        onChange={e => setTop(e.target.value)}
        type="number"
        fullWidth
        margin="normal"
      />
      <TextField
        label="Sort By"
        value={sort}
        onChange={e => setSort(e.target.value)}
        select
        fullWidth
        margin="normal"
      >
        <MenuItem value="price">Price</MenuItem>
        <MenuItem value="rating">Rating</MenuItem>
        <MenuItem value="discount">Discount</MenuItem>
      </TextField>
      <TextField
        label="Order"
        value={order}
        onChange={e => setOrder(e.target.value)}
        select
        fullWidth
        margin="normal"
      >
        <MenuItem value="asc">Ascending</MenuItem>
        <MenuItem value="desc">Descending</MenuItem>
      </TextField>
      <Button variant="contained" onClick={fetchProducts} fullWidth>
        Fetch Products
      </Button>
      <Grid container spacing={2} marginTop={2}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.uniqueId}>
            <Card>
              <CardContent>
                <Typography variant="h5">{product.productName}</Typography>
                <Typography variant="body1">Price: ${product.price}</Typography>
                <Typography variant="body1">Rating: {product.rating}</Typography>
                <Typography variant="body1">Discount: {product.discount}%</Typography>
                <Typography variant="body1">Company: {product.company}</Typography>
                <Typography variant="body1">Availability: {product.availability}</Typography>
                <Button component={Link} to={`/product/${product.uniqueId}`} variant="contained">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
