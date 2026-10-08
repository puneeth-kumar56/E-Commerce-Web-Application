import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Terminal,
  BookOpen,
  Copy,
  Check,
  CheckCircle,
  FileCode,
  Activity,
} from 'lucide-react';
import { api } from '../services/api.js';

export function SetupGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('guide');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [schemaText, setSchemaText] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.system.getSchemaSql().then((res) => {
        if (res.success && res.schema) {
          setSchemaText(res.schema);
        }
      }).catch(() => {});

      api.system.getStatus().then((res) => {
        if (res.success) {
          setSystemStatus(res);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Internship Project Blueprint & Execution Guide
              </h2>
              <p className="text-xs text-slate-400">
                MySQL (mysql2/promise) • Express.js • JWT Authentication • React
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 text-xs font-semibold gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            1. Setup & Execution Guide
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            2. schema.sql Script
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            3. REST API Endpoints Reference
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'status'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-violet-400" />
            4. Live Architecture Diagnostic
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-slate-850/70 rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-bold text-white text-base">Prerequisites & Local MySQL Setup</h3>
                </div>
                <p className="text-slate-300 text-xs">
                  Install Node.js (v18+) and MySQL Server (v8.0+) on your operating system. Open your terminal or MySQL Workbench to create the database:
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-1 overflow-x-auto">
                  <div className="text-slate-500"># Log into MySQL CLI as root</div>
                  <div>mysql -u root -p</div>
                  <div className="text-slate-500 mt-2"># In MySQL terminal, create database and run schema</div>
                  <div>CREATE DATABASE IF NOT EXISTS novamart_db;</div>
                  <div>USE novamart_db;</div>
                  <div className="text-slate-500 mt-2"># Import schema directly from project root</div>
                  <div>mysql -u root -p novamart_db &lt; schema.sql</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-850/70 rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h3 className="font-bold text-white text-base">Environment Variables Configuration</h3>
                </div>
                <p className="text-slate-300 text-xs">
                  Copy <code className="text-indigo-300 font-mono">.env.example</code> to <code className="text-indigo-300 font-mono">.env</code> in the project root:
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-1 overflow-x-auto">
                  <div>cp .env.example .env</div>
                  <div className="text-slate-500 mt-2"># Set your MySQL credentials in .env:</div>
                  <div>DB_HOST=localhost</div>
                  <div>DB_PORT=3306</div>
                  <div>DB_USER=root</div>
                  <div>DB_PASSWORD=your_mysql_password</div>
                  <div>DB_NAME=novamart_db</div>
                  <div>JWT_SECRET=novamart_super_secret_jwt_key_2026_internship_task</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-850/70 rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h3 className="font-bold text-white text-base">Dependencies & Starting the Server</h3>
                </div>
                <p className="text-slate-300 text-xs">
                  Install all backend and frontend dependencies, then launch the unified full-stack application:
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-1 overflow-x-auto">
                  <div className="text-slate-500"># Install required packages</div>
                  <div>npm install</div>
                  <div className="text-slate-500 mt-2"># Run the fullstack server with Vite middleware</div>
                  <div>npm run dev</div>
                  <div className="text-slate-500 mt-2"># Open in your web browser:</div>
                  <div className="text-emerald-400">http://localhost:3000</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-850/70 rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h3 className="font-bold text-white text-base">End-to-End Verification Checklist</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">1. Authentication:</strong>
                      Register a new account or use 1-click Demo Admin to test JWT token generation.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">2. RBAC Access Control:</strong>
                      Only users with role='admin' can open Admin Panel and execute product CRUD or status updates.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">3. Atomic Transaction:</strong>
                      Order checkout uses MySQL transaction to check inventory and decrement stock atomically.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">4. Live Order Tracking:</strong>
                      Customers view fulfillment stepper; Admin can update status to Shipped/Delivered in real time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA.SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Full MySQL schema.sql Script</h3>
                  <p className="text-xs text-slate-400">
                    Includes DDL for users, products, orders, order_items with InnoDB engine, Foreign Keys & Seed Data.
                  </p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSchema ? 'Copied!' : 'Copy Script'}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {schemaText || '-- Loading schema.sql content...'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: REST API REFERENCE */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">RESTful API Endpoints Documentation</h3>
                <p className="text-xs text-slate-400">
                  Fully implemented in Express.js backend with JWT Authorization & RBAC verification.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">Auth / RBAC</th>
                      <th className="py-2.5 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/80 text-slate-300">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">POST</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/auth/register</td>
                      <td className="py-2 px-3">Public</td>
                      <td className="py-2 px-3">Registers user, hashes password with bcrypt, returns JWT</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">POST</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/auth/login</td>
                      <td className="py-2 px-3">Public</td>
                      <td className="py-2 px-3">Verifies password hash, issues JWT token (7d)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-sky-400">GET</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/auth/me</td>
                      <td className="py-2 px-3 font-semibold text-indigo-400">Bearer Token</td>
                      <td className="py-2 px-3">Returns authenticated user profile</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-sky-400">GET</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/products</td>
                      <td className="py-2 px-3">Public</td>
                      <td className="py-2 px-3">Catalog browsing with search, category & sort filters</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-sky-400">GET</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/products/:id</td>
                      <td className="py-2 px-3">Public</td>
                      <td className="py-2 px-3">Get single product details and stock</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">POST</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/products</td>
                      <td className="py-2 px-3 font-semibold text-rose-400">Admin Only</td>
                      <td className="py-2 px-3">Creates new product in MySQL catalog</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-amber-400">PUT</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/products/:id</td>
                      <td className="py-2 px-3 font-semibold text-rose-400">Admin Only</td>
                      <td className="py-2 px-3">Updates product title, price, category, stock</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-rose-400">DELETE</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/products/:id</td>
                      <td className="py-2 px-3 font-semibold text-rose-400">Admin Only</td>
                      <td className="py-2 px-3">Deletes product from catalog</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">POST</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/orders</td>
                      <td className="py-2 px-3 font-semibold text-indigo-400">Bearer Token</td>
                      <td className="py-2 px-3">Atomic checkout with stock lock, check & deduction</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-sky-400">GET</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/orders</td>
                      <td className="py-2 px-3 font-semibold text-indigo-400">Bearer Token</td>
                      <td className="py-2 px-3">Customer's own order history with line items</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-sky-400">GET</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/orders/admin/all</td>
                      <td className="py-2 px-3 font-semibold text-rose-400">Admin Only</td>
                      <td className="py-2 px-3">Admin view of all customer orders</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-violet-400">PATCH</td>
                      <td className="py-2 px-3 font-mono text-indigo-300">/api/orders/admin/:id/status</td>
                      <td className="py-2 px-3 font-semibold text-rose-400">Admin Only</td>
                      <td className="py-2 px-3">Updates status (Pending, Processing, Shipped, Delivered)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE DIAGNOSTIC */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Runtime & Database Engine</h3>
                <p className="text-xs text-slate-400">
                  NovaMart features a dual-layer database adapter: connecting to real MySQL via mysql2/promise, with an instant transaction-safe engine fallback when running in sandbox preview.
                </p>
              </div>

              {systemStatus && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block">Active Database Driver:</span>
                    <span className="text-base font-bold font-mono text-indigo-400">
                      {systemStatus.database.mode.toUpperCase()} ENGINE
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {systemStatus.database.mode === 'mysql'
                        ? 'Connected to MySQL pool via mysql2/promise'
                        : 'Simulating MySQL InnoDB relational tables & transactions'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block">Target Database Name:</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {systemStatus.database.database}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Configured in .env DB_NAME
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block">Active Records:</span>
                    <span className="text-base font-bold font-mono text-white">
                      {systemStatus.counts.products} Prods • {systemStatus.counts.orders} Orders
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {systemStatus.counts.users} Registered Users in store
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white text-xs">Internship Defense & Evaluation Tip:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  During your project submission, you can point your examiner directly to <code className="text-indigo-300 font-mono">schema.sql</code>, <code className="text-indigo-300 font-mono">server/db.js</code>, <code className="text-indigo-300 font-mono">server/routes/orders.js</code>, and this interactive guide. Every feature from password hashing (bcrypt) to transaction rollback on insufficient stock is fully implemented.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>NovaMart • Full-Stack Internship Solution</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
