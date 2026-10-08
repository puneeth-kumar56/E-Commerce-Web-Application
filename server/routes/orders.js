import { Router } from 'express';
import { withTransaction, query, execute } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders
 * Place Order with strict Database Transaction Handling
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please include items to checkout.',
      });
    }

    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.',
      });
    }

    // Execute atomic transaction
    const orderResult = await withTransaction(async (tx) => {
      let calculatedTotal = 0;
      const orderItemsToInsert = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = parseInt(item.quantity, 10);

        if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid item or quantity for product ID ${item.productId}`);
        }

        const products = await tx.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
          throw new Error(`Product with ID ${productId} does not exist.`);
        }

        const product = products[0];

        if (product.stock < quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${product.stock}.`
          );
        }

        const updateResult = await tx.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [quantity, productId, quantity]
        );

        if (updateResult.affectedRows === 0) {
          throw new Error(`Concurrency conflict: Stock for "${product.name}" changed. Please try again.`);
        }

        const unitPrice = Number(product.price);
        calculatedTotal += unitPrice * quantity;

        orderItemsToInsert.push({
          productId,
          productName: product.name,
          quantity,
          unitPrice,
        });
      }

      const finalAmount = parseFloat(calculatedTotal.toFixed(2));

      const orderInsert = await tx.execute(
        'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, ?)',
        [userId, finalAmount, shippingAddress.trim(), paymentMethod || 'Credit Card', 'Pending']
      );

      const orderId = orderInsert.insertId;

      for (const lineItem of orderItemsToInsert) {
        await tx.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, lineItem.productId, lineItem.quantity, lineItem.unitPrice]
        );
      }

      return {
        orderId,
        totalAmount: finalAmount,
        itemsCount: orderItemsToInsert.length,
        items: orderItemsToInsert,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Stock inventory updated.',
      order: orderResult,
    });
  } catch (error) {
    console.error('Order creation transaction failed:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Transaction failed while processing order.',
    });
  }
});

/**
 * GET /api/orders
 * User View: Retrieve order history
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await query('SELECT * FROM orders WHERE user_id = ?', [userId]);

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          'SELECT oi.*, p.name AS product_name, p.image_url AS product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
          [order.id]
        );
        return {
          ...order,
          items,
        };
      })
    );

    res.json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history.',
      error: error.message,
    });
  }
});

/**
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const orders = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    const items = await query(
      'SELECT oi.*, p.name AS product_name, p.image_url AS product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [orderId]
    );

    res.json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order.',
      error: error.message,
    });
  }
});

/**
 * GET /api/orders/admin/all (Admin View)
 */
router.get('/admin/all', authenticateToken, requireRole('admin'), async (_req, res) => {
  try {
    const orders = await query(
      'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o JOIN users u ON o.user_id = u.id'
    );

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          'SELECT oi.*, p.name AS product_name, p.image_url AS product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
          [order.id]
        );
        return {
          ...order,
          items,
        };
      })
    );

    res.json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all customer orders.',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/orders/admin/:id/status (Admin View)
 */
router.patch('/admin/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const existing = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

    res.json({
      success: true,
      message: `Order #${orderId} status updated to "${status}".`,
      orderId,
      status,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
      error: error.message,
    });
  }
});

export default router;
