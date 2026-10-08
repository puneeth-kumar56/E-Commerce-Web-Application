import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { initDatabase, getDatabaseStatus, resetDatabase, query } from './server/db.js';
import authRoutes from './server/routes/auth.js';
import productRoutes from './server/routes/products.js';
import orderRoutes from './server/routes/orders.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize Database connection (MySQL with fallback to memory SQL engine)
  await initDatabase();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  // System & Health Endpoints
  app.get('/api/system/status', async (_req, res) => {
    try {
      const dbStatus = getDatabaseStatus();
      const users = await query('SELECT id FROM users');
      const products = await query('SELECT id FROM products');
      const orders = await query('SELECT id FROM orders');

      res.json({
        success: true,
        database: dbStatus,
        counts: {
          users: users.length,
          products: products.length,
          orders: orders.length,
        },
        uptime: process.uptime(),
        nodeVersion: process.version,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Database Reset / Reseed Demo Data
  app.post('/api/system/reset', async (_req, res) => {
    try {
      await resetDatabase();
      res.json({
        success: true,
        message: 'Database reset to initial demo seeds successfully!',
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Schema.sql reader endpoint
  app.get('/api/system/schema', (_req, res) => {
    try {
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf-8');
        res.json({ success: true, schema: content });
      } else {
        res.status(404).json({ success: false, message: 'schema.sql not found on disk' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Dev vs Production static asset handling
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NovaMart Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
