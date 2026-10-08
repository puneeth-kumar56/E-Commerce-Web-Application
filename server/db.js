import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let mysqlPool = null;
let activeMode = 'memory';

// Initial Seed Data for In-Memory Fallback & Reseed
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const initialUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@novamart.com',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Jane Customer',
    email: 'jane@novamart.com',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'user',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialProducts = [
  {
    id: 1,
    name: 'Aura Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and spatial audio.',
    price: 199.99,
    stock: 25,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Pulse Chrono Smartwatch Series 7',
    description: 'Sleek aerospace aluminum case, always-on AMOLED display, optical heart rate sensor, and waterproof design.',
    price: 149.50,
    stock: 18,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    rating: 4.7,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Heritage Full-Grain Leather Backpack',
    description: 'Handcrafted top-grain leather with dedicated padded 15-inch laptop sleeve and waterproof brass hardware.',
    price: 129.00,
    stock: 12,
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    rating: 4.9,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Nordic Minimalist Ceramic Pour-Over Kettle',
    description: 'Precision gooseneck spout for optimal water flow, ergonomic wooden handle, and matte ceramic exterior.',
    price: 45.00,
    stock: 30,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    rating: 4.6,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'ErgoLift Mechanical RGB Gaming Keyboard',
    description: 'Gateron optical switches, hot-swappable PCB, aircraft-grade aluminum top plate, and sound-dampening foam.',
    price: 89.99,
    stock: 15,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    rating: 4.8,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Botanical Organic Linen Throw Blanket',
    description: 'Woven from 100% certified French flax linen. Soft, breathable, hypoallergenic, and machine washable.',
    price: 59.95,
    stock: 20,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    rating: 4.5,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'Apex Ultra Running Shoes',
    description: 'Engineered mesh upper, responsive carbon-fiber plate, and high-rebound supercritical midsole foam.',
    price: 119.00,
    stock: 14,
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    rating: 4.7,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Studio Pro 4K Ultra-Wide USB Webcam',
    description: '4K Sony STARVIS sensor, dual noise-reducing stereo microphones, and physical magnetic privacy shutter.',
    price: 79.99,
    stock: 22,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80',
    rating: 4.6,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialOrders = [
  {
    id: 1001,
    user_id: 2,
    total_amount: 349.49,
    shipping_address: '742 Evergreen Terrace, Springfield, IL 62704',
    payment_method: 'Credit Card',
    status: 'Delivered',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 1002,
    user_id: 2,
    total_amount: 129.00,
    shipping_address: '742 Evergreen Terrace, Springfield, IL 62704',
    payment_method: 'Stripe',
    status: 'Processing',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialOrderItems = [
  {
    id: 1,
    order_id: 1001,
    product_id: 1,
    quantity: 1,
    unit_price: 199.99,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    order_id: 1001,
    product_id: 2,
    quantity: 1,
    unit_price: 149.50,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    order_id: 1002,
    product_id: 3,
    quantity: 1,
    unit_price: 129.00,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// In-Memory Database Store (Simulating MySQL relational engine)
class InMemoryDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.orders = JSON.parse(JSON.stringify(initialOrders));
    this.orderItems = JSON.parse(JSON.stringify(initialOrderItems));
    this.userIdSeq = 10;
    this.productIdSeq = 20;
    this.orderIdSeq = 2000;
    this.orderItemIdSeq = 3000;
  }

  cloneState() {
    return {
      users: JSON.parse(JSON.stringify(this.users)),
      products: JSON.parse(JSON.stringify(this.products)),
      orders: JSON.parse(JSON.stringify(this.orders)),
      orderItems: JSON.parse(JSON.stringify(this.orderItems)),
      userIdSeq: this.userIdSeq,
      productIdSeq: this.productIdSeq,
      orderIdSeq: this.orderIdSeq,
      orderItemIdSeq: this.orderItemIdSeq,
    };
  }

  restoreState(state) {
    this.users = state.users;
    this.products = state.products;
    this.orders = state.orders;
    this.orderItems = state.orderItems;
    this.userIdSeq = state.userIdSeq;
    this.productIdSeq = state.productIdSeq;
    this.orderIdSeq = state.orderIdSeq;
    this.orderItemIdSeq = state.orderItemIdSeq;
  }
}

const memoryDb = new InMemoryDatabase();

export async function initDatabase() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'novamart_db';
  const port = Number(process.env.DB_PORT) || 3306;

  if (host && host.trim() !== '') {
    try {
      const pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test connection
      const conn = await pool.getConnection();
      conn.release();

      mysqlPool = pool;
      activeMode = 'mysql';
      console.log(`[Database] Connected successfully to MySQL database '${database}' on ${host}:${port}`);
      return;
    } catch (err) {
      console.warn(`[Database] MySQL connection to ${host}:${port} unavailable (${err.message}). Using resilient in-memory engine.`);
    }
  }

  activeMode = 'memory';
  console.log('[Database] Running in in-memory mode with full MySQL-compatible schemas & transactions.');
}

export function getDatabaseStatus() {
  return {
    mode: activeMode,
    host: process.env.DB_HOST || 'local-memory',
    database: process.env.DB_NAME || 'novamart_db',
    user: process.env.DB_USER || 'root',
  };
}

export async function resetDatabase() {
  memoryDb.reset();
}

// Low-level query function
export async function query(sql, params = []) {
  if (activeMode === 'mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  }
  return executeMemoryQuery(sql, params);
}

// Low-level execute function (INSERT, UPDATE, DELETE)
export async function execute(sql, params = []) {
  if (activeMode === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.execute(sql, params);
    return { insertId: result.insertId || 0, affectedRows: result.affectedRows || 0 };
  }
  return executeMemoryCommand(sql, params);
}

// Transaction runner
export async function withTransaction(callback) {
  if (activeMode === 'mysql' && mysqlPool) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      const txClient = {
        async query(sql, params) {
          const [rows] = await connection.query(sql, params);
          return rows;
        },
        async execute(sql, params) {
          const [result] = await connection.execute(sql, params);
          return { insertId: result.insertId || 0, affectedRows: result.affectedRows || 0 };
        },
      };
      const result = await callback(txClient);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // In-memory transaction isolation with rollback snapshot
  const snapshot = memoryDb.cloneState();
  try {
    const txClient = {
      async query(sql, params) {
        return executeMemoryQuery(sql, params);
      },
      async execute(sql, params) {
        return executeMemoryCommand(sql, params);
      },
    };
    const result = await callback(txClient);
    return result;
  } catch (err) {
    memoryDb.restoreState(snapshot);
    throw err;
  }
}

// Memory query interpreter for identical REST queries
function executeMemoryQuery(sql, params = []) {
  const cleanSql = sql.trim();
  const lower = cleanSql.toLowerCase();

  // SELECT * FROM users WHERE email = ?
  if (lower.startsWith('select') && lower.includes('from users')) {
    if (lower.includes('where email = ?')) {
      const email = params[0]?.toLowerCase();
      return memoryDb.users.filter((u) => u.email.toLowerCase() === email);
    }
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      return memoryDb.users.filter((u) => u.id === id);
    }
    return memoryDb.users;
  }

  // SELECT * FROM products
  if (lower.startsWith('select') && lower.includes('from products')) {
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      return memoryDb.products.filter((p) => p.id === id);
    }
    let list = [...memoryDb.products];
    if (lower.includes('where category = ?') || lower.includes('category = ?')) {
      const cat = params[0];
      list = list.filter((p) => p.category === cat);
    }
    return list;
  }

  // SELECT DISTINCT category FROM products
  if (lower.includes('select distinct category from products')) {
    const categories = Array.from(new Set(memoryDb.products.map((p) => p.category)));
    return categories.map((cat) => ({ category: cat }));
  }

  // SELECT orders with user details (admin view)
  if (lower.includes('from orders') && lower.includes('join users')) {
    return memoryDb.orders
      .map((ord) => {
        const user = memoryDb.users.find((u) => u.id === ord.user_id);
        return {
          ...ord,
          user_name: user?.name || 'Unknown User',
          user_email: user?.email || '',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // SELECT * FROM orders WHERE user_id = ?
  if (lower.startsWith('select') && lower.includes('from orders')) {
    if (lower.includes('where user_id = ?')) {
      const uid = Number(params[0]);
      return memoryDb.orders
        .filter((o) => o.user_id === uid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      return memoryDb.orders.filter((o) => o.id === id);
    }
    return memoryDb.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // SELECT order_items with product details
  if (lower.includes('from order_items') && lower.includes('join products')) {
    if (lower.includes('where order_id = ?') || lower.includes('order_id = ?')) {
      const orderId = Number(params[0]);
      return memoryDb.orderItems
        .filter((item) => item.order_id === orderId)
        .map((item) => {
          const prod = memoryDb.products.find((p) => p.id === item.product_id);
          return {
            ...item,
            product_name: prod?.name || 'Archived Product',
            product_image: prod?.image_url || '',
          };
        });
    }
  }

  // SELECT * FROM order_items WHERE order_id = ?
  if (lower.startsWith('select') && lower.includes('from order_items')) {
    const orderId = Number(params[0]);
    return memoryDb.orderItems.filter((item) => item.order_id === orderId);
  }

  return [];
}

function executeMemoryCommand(sql, params = []) {
  const cleanSql = sql.trim();
  const lower = cleanSql.toLowerCase();

  // INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  if (lower.startsWith('insert into users')) {
    const [name, email, password_hash, role] = params;
    const newId = ++memoryDb.userIdSeq;
    const now = new Date().toISOString();
    memoryDb.users.push({
      id: newId,
      name,
      email,
      password_hash,
      role: role || 'user',
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // INSERT INTO products
  if (lower.startsWith('insert into products')) {
    const [name, description, price, stock, category, image_url, rating] = params;
    const newId = ++memoryDb.productIdSeq;
    const now = new Date().toISOString();
    memoryDb.products.push({
      id: newId,
      name,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      category: category || 'General',
      image_url: image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      rating: Number(rating) || 4.5,
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // UPDATE products SET ... WHERE id = ?
  if (lower.startsWith('update products')) {
    if (lower.includes('stock = stock - ? where id = ? and stock >= ?')) {
      const [quantity, id, minStock] = params;
      const prod = memoryDb.products.find((p) => p.id === Number(id));
      if (!prod || prod.stock < minStock) {
        return { insertId: 0, affectedRows: 0 };
      }
      prod.stock -= Number(quantity);
      prod.updated_at = new Date().toISOString();
      return { insertId: 0, affectedRows: 1 };
    }

    if (lower.includes('stock = stock - ? where id = ?')) {
      const [quantity, id] = params;
      const prod = memoryDb.products.find((p) => p.id === Number(id));
      if (!prod) return { insertId: 0, affectedRows: 0 };
      prod.stock = Math.max(0, prod.stock - Number(quantity));
      prod.updated_at = new Date().toISOString();
      return { insertId: 0, affectedRows: 1 };
    }

    const [name, description, price, stock, category, image_url, id] = params;
    const prod = memoryDb.products.find((p) => p.id === Number(id));
    if (!prod) return { insertId: 0, affectedRows: 0 };
    prod.name = name;
    prod.description = description;
    prod.price = Number(price);
    prod.stock = Number(stock);
    prod.category = category;
    if (image_url) prod.image_url = image_url;
    prod.updated_at = new Date().toISOString();
    return { insertId: 0, affectedRows: 1 };
  }

  // DELETE FROM products WHERE id = ?
  if (lower.startsWith('delete from products')) {
    const id = Number(params[0]);
    const index = memoryDb.products.findIndex((p) => p.id === id);
    if (index === -1) return { insertId: 0, affectedRows: 0 };
    memoryDb.products.splice(index, 1);
    return { insertId: 0, affectedRows: 1 };
  }

  // INSERT INTO orders
  if (lower.startsWith('insert into orders')) {
    const [user_id, total_amount, shipping_address, payment_method, status] = params;
    const newId = ++memoryDb.orderIdSeq;
    const now = new Date().toISOString();
    memoryDb.orders.push({
      id: newId,
      user_id: Number(user_id),
      total_amount: Number(total_amount),
      shipping_address,
      payment_method: payment_method || 'Credit Card',
      status: status || 'Pending',
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // INSERT INTO order_items
  if (lower.startsWith('insert into order_items')) {
    const [order_id, product_id, quantity, unit_price] = params;
    const newId = ++memoryDb.orderItemIdSeq;
    const now = new Date().toISOString();
    memoryDb.orderItems.push({
      id: newId,
      order_id: Number(order_id),
      product_id: Number(product_id),
      quantity: Number(quantity),
      unit_price: Number(unit_price),
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // UPDATE orders SET status = ? WHERE id = ?
  if (lower.startsWith('update orders')) {
    const [status, id] = params;
    const order = memoryDb.orders.find((o) => o.id === Number(id));
    if (!order) return { insertId: 0, affectedRows: 0 };
    order.status = status;
    order.updated_at = new Date().toISOString();
    return { insertId: 0, affectedRows: 1 };
  }

  return { insertId: 0, affectedRows: 0 };
}
