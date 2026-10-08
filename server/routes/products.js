import { Router } from 'express';
import { query, execute } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/products
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    let products = await query('SELECT * FROM products');

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price_asc') {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      products.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product catalog.',
      error: error.message,
    });
  }
});

/**
 * GET /api/categories
 */
router.get('/categories', async (_req, res) => {
  try {
    const rows = await query('SELECT DISTINCT category FROM products');
    const categories = rows.map((r) => r.category).filter(Boolean);
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const products = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      product: products[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details.',
      error: error.message,
    });
  }
});

/**
 * POST /api/products (Admin Only)
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url, rating } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, stock quantity, and category are required.',
      });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and stock cannot be negative numbers.',
      });
    }

    const defaultImg =
      image_url && image_url.trim() !== ''
        ? image_url.trim()
        : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';

    const result = await execute(
      'INSERT INTO products (name, description, price, stock, category, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name.trim(),
        description ? description.trim() : '',
        parseFloat(price),
        parseInt(stock, 10),
        category.trim(),
        defaultImg,
        parseFloat(rating) || 4.5,
      ]
    );

    const created = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: created[0],
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product.',
      error: error.message,
    });
  }
});

/**
 * PUT /api/products/:id (Admin Only)
 */
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const existing = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, description, price, stock, category, image_url } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, stock quantity, and category are required.',
      });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and stock cannot be negative numbers.',
      });
    }

    await execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?',
      [
        name.trim(),
        description ? description.trim() : '',
        parseFloat(price),
        parseInt(stock, 10),
        category.trim(),
        image_url || existing[0].image_url,
        id,
      ]
    );

    const updated = await query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updated[0],
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product.',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/products/:id (Admin Only)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const existing = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await execute('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Product "${existing[0].name}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message,
    });
  }
});

export default router;
