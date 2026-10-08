# 🛒 NovaMart — Full-Stack E-Commerce Platform

A production-ready, full-stack E-Commerce Web Application built with **React.js**, **Node.js with Express.js**, **MySQL (`mysql2/promise`)**, and **JWT Authentication with bcryptjs password hashing**.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **User Registration & Login**: Passwords hashed with `bcryptjs` (10 salt rounds).
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens (7-day validity).
- **Two Distinct Roles**:
  - `user`: Browse catalog, manage shopping cart, execute orders, and view personal order history.
  - `admin`: Full product catalog CRUD management, view all customer orders, and update fulfillment statuses.

### 2. Product Catalog & Inventory Management
- **Public Storefront**: Browse products with real-time text search, category filtering, and sorting (Price, Rating, Name).
- **Inventory Badges**: Dynamic status indicators (`In Stock`, `Only X Left!`, `Out of Stock`).
- **Admin CRUD Management**: Create, Read, Update, and Delete products with modal dialogues and image preview.

### 3. Shopping Cart & Transactional Checkout
- **Cart Management**: Dynamic quantity adjustments, stock cap enforcement, and automatic subtotal/tax/shipping calculations.
- **ACID Database Transactions**:
  - Checkout executes in a strict database transaction (`START TRANSACTION` ... `COMMIT` / `ROLLBACK`).
  - Atomically locks and verifies stock availability for each item.
  - Decrements product inventory in MySQL upon order completion.
  - Rolls back automatically with HTTP 400 error if any product has insufficient stock.

### 4. Order Tracking & Fulfillment Pipeline
- **Customer View**: Live 4-step progress tracker (`Pending` → `Processing` → `Shipped` → `Delivered`), order line item breakdowns, and shipping metadata.
- **Admin View**: Centralized order management dashboard with status dropdowns to update fulfillment in real time.

### 5. Interactive Setup & Documentation Hub
- Embedded in-app modal providing 1-click `schema.sql` copying, API reference documentation, and live database engine diagnostics.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 (ES6+ JavaScript / JSX), Tailwind CSS, Lucide Icons |
| **Backend** | Node.js (v18+), Express.js (REST APIs) |
| **Database** | MySQL 8.0+ (`mysql2/promise` with connection pooling) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing |
| **Tooling** | Vite, tsx / Node ES Modules |

---

## 📂 Project Directory Structure

```text
├── schema.sql                   # MySQL database schema DDL & initial seed data
├── .env.example                 # Environment variables template
├── package.json                 # Project dependencies and npm scripts
├── server.js                    # Full-stack Express server & Vite integration
├── server/
│   ├── db.js                    # MySQL connection pool & transactional query runner
│   ├── middleware/
│   │   └── auth.js              # JWT verification & RBAC role guards
│   └── routes/
│       ├── auth.js              # Registration, login, and user profile endpoints
│       ├── products.js          # Product catalog and admin CRUD endpoints
│       └── orders.js            # Transactional checkout and order tracking
├── src/
│   ├── main.jsx                 # React root DOM entry point
│   ├── App.jsx                  # Main application router and state assembly
│   ├── index.css                # Global CSS styling
│   ├── services/
│   │   └── api.js               # Frontend API client with JWT header injection
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication & user session management
│   │   └── CartContext.jsx      # Shopping cart state & pricing math
│   └── components/
│       ├── Navbar.jsx           # Top navigation bar with role badges
│       ├── ProductCard.jsx      # Product card with stock badges
│       ├── ProductDetailModal.jsx # Detailed product view & quantity picker
│       ├── CartDrawer.jsx       # Slide-over cart drawer
│       ├── CheckoutModal.jsx    # Secure transactional checkout form
│       ├── AuthModal.jsx        # Login & Signup modal with 1-click demo buttons
│       ├── OrderHistoryView.jsx # Customer order tracking with progress stepper
│       ├── AdminDashboard.jsx   # Admin analytics, product CRUD & order management
│       └── SetupGuideModal.jsx  # In-app setup instructions & schema viewer
└── README.md                    # Project documentation
```

---

## 🗄️ Database Schema (`schema.sql`)

The database schema is written for **MySQL 8.0+** using the `InnoDB` storage engine to enforce foreign key integrity and transactional isolation.

### Tables Overview
1. **`users`**:
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `name VARCHAR(100) NOT NULL`
   - `email VARCHAR(191) NOT NULL UNIQUE`
   - `password_hash VARCHAR(255) NOT NULL`
   - `role ENUM('user', 'admin') DEFAULT 'user'`
   - `created_at`, `updated_at` timestamps
2. **`products`**:
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `name VARCHAR(200) NOT NULL`
   - `description TEXT`
   - `price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)`
   - `stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0)`
   - `category VARCHAR(100) NOT NULL`
   - `image_url VARCHAR(500)`
   - `rating DECIMAL(3, 2) DEFAULT 4.50`
   - `created_at`, `updated_at` timestamps
3. **`orders`**:
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `user_id INT NOT NULL` (Foreign Key -> `users.id` ON DELETE CASCADE)
   - `total_amount DECIMAL(10, 2) NOT NULL`
   - `shipping_address TEXT NOT NULL`
   - `payment_method VARCHAR(50) DEFAULT 'Credit Card'`
   - `status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending'`
   - `created_at`, `updated_at` timestamps
4. **`order_items`**:
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `order_id INT NOT NULL` (Foreign Key -> `orders.id` ON DELETE CASCADE)
   - `product_id INT NOT NULL` (Foreign Key -> `products.id` ON DELETE RESTRICT)
   - `quantity INT NOT NULL CHECK (quantity > 0)`
   - `unit_price DECIMAL(10, 2) NOT NULL`
   - `created_at` timestamp

---

## 🚀 Step-by-Step Local Setup & Execution Guide

### Step 1: Install MySQL & Initialize Database
Ensure MySQL Server is running locally on port 3306.

1. Connect to MySQL CLI:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS novamart_db;
   USE novamart_db;
   ```
3. Import the `schema.sql` file:
   ```bash
   mysql -u root -p novamart_db < schema.sql
   ```

### Step 2: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` to match your local MySQL configuration:
```ini
PORT=3000
NODE_ENV=development

# MySQL Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=novamart_db

# Security
JWT_SECRET=novamart_super_secret_jwt_key_2026_internship_task
JWT_EXPIRES_IN=7d
```

> **Note**: If `DB_HOST` is omitted or unavailable, the application gracefully activates an internal in-memory relational engine with identical SQL query semantics, allowing instant preview testing out of the box.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the Application
Start the development server:
```bash
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser.

---

## 🔑 Default Evaluation Accounts

The database comes pre-seeded with test accounts for instant evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@novamart.com` | `password123` | Full Product CRUD, Manage Customer Orders, View Metrics |
| **Customer** | `jane@novamart.com` | `password123` | Browse Catalog, Shopping Cart, Checkout, Order Tracking |

*(1-click demo login buttons are also available in the application's Sign In dialog).*

---

## 📡 REST API Endpoints Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Sign in user, verify bcrypt hash, return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of currently authenticated user |

### Products Routes (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (supports `category`, `search`, and `sortBy`) |
| `GET` | `/api/products/categories` | Public | Retrieve list of distinct product categories |
| `GET` | `/api/products/:id` | Public | Retrieve detailed information for a single product |
| `POST` | `/api/products` | **Admin Only** | Create a new product in the database |
| `PUT` | `/api/products/:id` | **Admin Only** | Update an existing product's title, price, stock, etc. |
| `DELETE` | `/api/products/:id` | **Admin Only** | Delete a product from the database |

### Orders & Tracking Routes (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Execute transactional checkout & decrement product inventory |
| `GET` | `/api/orders` | Authenticated | Retrieve current user's order history with line items |
| `GET` | `/api/orders/:id` | Authenticated | View details for a single order (owner or admin) |
| `GET` | `/api/orders/admin/all` | **Admin Only** | Retrieve all customer orders across the platform |
| `PATCH` | `/api/orders/admin/:id/status`| **Admin Only** | Update fulfillment status (`Pending`, `Processing`, `Shipped`, etc.) |

### System Routes (`/api/system`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system/status` | Public | Check active database mode (MySQL vs Memory) and table record counts |
| `POST` | `/api/system/reset` | Public | Reset database back to default initial seed dataset |
| `GET` | `/api/system/schema` | Public | Read raw `schema.sql` content for documentation display |

---

## 🧪 Verification & Testing Workflow

1. **Verify Authentication & RBAC**:
   - Sign in as `jane@novamart.com` (Customer) and verify that the Admin Panel button is not visible and direct requests to `/api/products` (POST) return HTTP 403 Forbidden.
   - Sign in as `admin@novamart.com` (Admin) and verify access to the Admin Dashboard.
2. **Verify Transactional Checkout & Stock Deduction**:
   - Note the available stock of a product (e.g. 25 units).
   - Add 3 units to the cart and proceed to checkout.
   - Complete checkout and verify that product stock immediately decreases to 22 units in the catalog.
3. **Verify Order Tracking**:
   - Navigate to **My Orders** to view the newly created order in `Pending` state.
4. **Verify Admin Status Updates**:
   - In Admin Panel > Customer Orders, change the order status from `Pending` to `Processing` or `Shipped`.
   - Switch back to customer view to see the live tracking stepper update.

---

## 📄 License
This project is licensed under the Apache-2.0 License.
