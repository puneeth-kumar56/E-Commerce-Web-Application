-- =====================================================================
-- NovaMart E-Commerce Database Schema
-- Database Engine: MySQL 8.0+
-- Description: Complete schema with tables, foreign keys, indexes, and initial seed data
-- =====================================================================

-- Step 1: Create Database if not exists
CREATE DATABASE IF NOT EXISTS novamart_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE novamart_db;

-- Step 2: Drop existing tables in reverse dependency order (safe for migrations)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Table: users
-- Roles: 'user', 'admin'
-- Passwords stored as bcrypt hashes
-- =====================================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Table: products
-- Catalog items with stock inventory tracking
-- =====================================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  rating DECIMAL(3, 2) DEFAULT 4.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category (category),
  INDEX idx_products_price (price),
  INDEX idx_products_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Table: orders
-- Customer order master record
-- Statuses: 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
-- =====================================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user_id (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Table: order_items
-- Order line items linked to products
-- =====================================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA
-- Default Passwords:
-- Admin: admin123 (bcrypt hash: $2a$10$wN7KzPzGv7fGzQoDkQ4P9e9qFp3HhXyQ0uJgKzL7YxL5wOq6jZz7a or generated with 10 salt rounds)
-- User: user123
-- Note: The server automatically handles bcrypt generation for seed users.
-- =====================================================================

-- Users
-- Password for both test accounts below is 'password123'
-- Hash: $2b$10$wT8KzQk3uYQcE0vEa8Yf.u1x3YFsmZfVd3rFqD2fB9aY6lA5kQ0sS
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Admin User', 'admin@novamart.com', '$2b$10$wT8KzQk3uYQcE0vEa8Yf.u1x3YFsmZfVd3rFqD2fB9aY6lA5kQ0sS', 'admin'),
(2, 'Jane Customer', 'jane@novamart.com', '$2b$10$wT8KzQk3uYQcE0vEa8Yf.u1x3YFsmZfVd3rFqD2fB9aY6lA5kQ0sS', 'user');

-- Products
INSERT INTO products (id, name, description, price, stock, category, image_url, rating) VALUES
(1, 'Aura Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and spatial audio.', 199.99, 25, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 4.8),
(2, 'Pulse Chrono Smartwatch Series 7', 'Sleek aerospace aluminum case, always-on AMOLED display, optical heart rate sensor, and waterproof design.', 149.50, 18, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 4.7),
(3, 'Heritage Full-Grain Leather Backpack', 'Handcrafted top-grain leather with dedicated padded 15-inch laptop sleeve and waterproof brass hardware.', 129.00, 12, 'Fashion', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 4.9),
(4, 'Nordic Minimalist Ceramic Pour-Over Kettle', 'Precision gooseneck spout for optimal water flow, ergonomic wooden handle, and matte ceramic exterior.', 45.00, 30, 'Home & Kitchen', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80', 4.6),
(5, 'ErgoLift Mechanical RGB Gaming Keyboard', 'Gateron optical switches, hot-swappable PCB, aircraft-grade aluminum top plate, and sound-dampening foam.', 89.99, 15, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 4.8),
(6, 'Botanical Organic Linen Throw Blanket', 'Woven from 100% certified French flax linen. Soft, breathable, hypoallergenic, and machine washable.', 59.95, 20, 'Home & Kitchen', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', 4.5),
(7, 'Apex Ultra Running Shoes', 'Engineered mesh upper, responsive carbon-fiber plate, and high-rebound supercritical midsole foam.', 119.00, 14, 'Fashion', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 4.7),
(8, 'Studio Pro 4K Ultra-Wide USB Webcam', '4K Sony STARVIS sensor, dual noise-reducing stereo microphones, and physical magnetic privacy shutter.', 79.99, 22, 'Electronics', 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80', 4.6);

-- Sample Orders
INSERT INTO orders (id, user_id, total_amount, shipping_address, payment_method, status, created_at) VALUES
(1001, 2, 349.49, '742 Evergreen Terrace, Springfield, IL 62704', 'Credit Card', 'Delivered', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1002, 2, 129.00, '742 Evergreen Terrace, Springfield, IL 62704', 'Stripe', 'Processing', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Sample Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
(1, 1001, 1, 1, 199.99),
(2, 1001, 2, 1, 149.50),
(3, 1002, 3, 1, 129.00);

-- Reset auto-increment counters to prevent id collisions
ALTER TABLE users AUTO_INCREMENT = 10;
ALTER TABLE products AUTO_INCREMENT = 20;
ALTER TABLE orders AUTO_INCREMENT = 2000;
ALTER TABLE order_items AUTO_INCREMENT = 3000;
