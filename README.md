# FLAGSHIP E-COMMERCE PLATFORM

A production-ready full-stack e-commerce web application engineered with **React** (frontend), **Node.js + Express** (backend REST API), and **MongoDB with Mongoose**.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Database & Seeding](#database--seeding)
5. [Starting the Application](#starting-the-application)
6. [Default Login Credentials](#default-login-credentials)
7. [Simulated Payment Gateway](#simulated-payment-gateway)
8. [REST API Route Table](#rest-api-route-table)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 1. Architecture Overview

```
Flagship/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection manager (Mongoose)
│   │   ├── controllers/     # Route logic (Auth, Products, Cart, Orders, Payment, Admin)
│   │   ├── middleware/      # JWT auth, admin guard, input validation, error handlers
│   │   ├── models/          # User, Product, Cart, Order, Review schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── seed/            # Automated seeding script
│   │   ├── app.js           # Express application configuration & security
│   │   └── server.js        # Server bootstrap and graceful shutdown
│   ├── tests/               # Jest + Supertest + MongoMemoryServer test suites
│   ├── .env.example         # Template environment variables
│   ├── .env                 # Working environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, RatingStars, Modal, etc.
│   │   ├── context/         # AuthContext, CartContext, ToastContext
│   │   ├── pages/           # Customer & Admin pages (Catalog, Details, Cart, Checkout, etc.)
│   │   ├── services/        # Axios API client with interceptors
│   │   ├── test/            # Vitest component test suites
│   │   ├── App.jsx          # Route definitions & protection
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── docs/
    └── APP_STATUS.md        # Comprehensive build and validation report
```

---

## 2. Prerequisites

- **Node.js**: `v18.0.0` or higher (verified on Node `v26.13.0`)
- **npm**: `v9.0.0` or higher (verified on npm `12.2.1`)
- **MongoDB**: Running locally or in Docker on port `27017` *(optional — see Offline Mode below)*
  - *Note:* Mongo Express is typically accessible at `http://localhost:8081`

### Offline / In-Memory Mode (No MongoDB Required)

The app is **fully functional without MongoDB**. When the server cannot reach MongoDB, it automatically falls back to in-memory data stores pre-loaded with 22 products, an admin user, and a demo user. You can browse the catalog, log in, add items to cart, checkout, simulate payments, and use the admin panel — all without a database.

**Key behaviors in offline mode:**
- A subtle amber banner appears in the Navbar: *"Running in offline mode — data won't persist across server restarts"*
- `GET /api/health` returns status `degraded` with `mongo: "disconnected"`
- Login uses plain-text password comparison (bcrypt is used when MongoDB is live)
- All cart, order, and user data exists only in server memory and is lost on restart

**When MongoDB starts later:**
- The backend automatically reconnects and seeds the database if it's empty (via `autoSeedIfEmpty()`)
- The app seamlessly switches from in-memory mode to live MongoDB — no restart needed

---

## 3. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` (pre-configured):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=flagship_ecommerce_jwt_super_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **MongoDB Authentication Variants:**
> - Without credentials: `mongodb://localhost:27017/ecommerce`
> - With credentials in Docker: `mongodb://<username>:<password>@localhost:27017/ecommerce?authSource=admin`

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env` (pre-configured):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Database & Seeding

The seed script purges existing collections and loads an admin account, demo user account, and **22 realistic products across 5 categories** with image URLs and sample reviews.

```bash
cd backend
npm run seed
```

*The seed script is safe to re-run at any time.*

---

## 5. Starting the Application

### Development Mode

1. **Start Backend API** (Runs on port `5000` with hot-reload via `nodemon`):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Dev Server** (Runs on port `5173` via Vite):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open **`http://localhost:5173`** in your browser.

### Production Mode

- **Backend:** `cd backend && npm start`
- **Frontend Build & Preview:** `cd frontend && npm run build && npm run preview`

---

## 6. Default Login Credentials

Use the convenient **"Fill Admin"** and **"Fill Demo User"** quick-fill buttons on the login page or manually enter:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@example.com` | `Admin@123` | Full access to Admin Dashboard, Product CRUD, Order Management, User directory |
| **Customer / Shopper** | `user@example.com` | `User@123` | Cart operations, checkout, reviews, order history, profile settings |

---

## 7. Simulated Payment Gateway

Checkout includes a simulated payment gateway designed as a drop-in precursor to Stripe.
- **Card Testing (Success):** Enter any card number or click the **"Fill Success Card"** button (`4242 4242 4242 4242`). The order will be immediately approved and marked as `isPaid: true` with a simulated charge identifier.
- **Card Testing (Decline Simulation):** Click **"Fill Declined Card"** (`4000 0000 0000 0000`). The payment simulation will reject the transaction with a realistic bank decline notice.

---

## 8. REST API Route Table

### System & Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Reports server uptime and MongoDB connection state |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Register a new user |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, email, or password |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (search, category, price range, sort, pagination) |
| `GET` | `/api/products/categories` | Public | Retrieve distinct category list |
| `GET` | `/api/products/:id` | Public | Get single product and its customer reviews |
| `POST` | `/api/products` | Admin only | Create new product |
| `PUT` | `/api/products/:id` | Admin only | Update product details |
| `DELETE` | `/api/products/:id` | Admin only | Delete product and associated reviews |
| `POST` | `/api/products/:id/reviews` | Authenticated | Add customer review (1-5 stars & comment) |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Get current user's shopping cart |
| `POST` | `/api/cart` | Authenticated | Add item to cart |
| `PUT` | `/api/cart/:productId` | Authenticated | Update item quantity |
| `DELETE` | `/api/cart/:productId` | Authenticated | Remove item from cart |
| `DELETE` | `/api/cart` | Authenticated | Clear cart |

### Orders & Payment (`/api/orders`, `/api/payment`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Create order from cart (stock verified & decremented) |
| `GET` | `/api/orders/my-orders` | Authenticated | Retrieve logged-in user's order history |
| `GET` | `/api/orders/:id` | Authenticated | Get order details by ID (owner or admin) |
| `GET` | `/api/orders` | Admin only | List all orders with pagination and user details |
| `PUT` | `/api/orders/:id/status` | Admin only | Update fulfillment status (`processing`, `shipped`, `delivered`, `cancelled`) |
| `POST` | `/api/payment/simulate` | Authenticated | Process simulated payment transaction |

### Admin Area (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin only | Dashboard metrics (revenue, orders, low stock products) |
| `GET` | `/api/admin/users` | Admin only | User directory |
| `PUT` | `/api/admin/users/:id/role` | Admin only | Change user role (`user` / `admin`) |
| `DELETE` | `/api/admin/users/:id` | Admin only | Remove user account |

---

## 9. Testing & Quality Assurance

### Run Backend Tests (Jest + Supertest + mongodb-memory-server)
```bash
cd backend
npm test
```
*Executes 17 comprehensive unit & integration tests covering auth, products, cart, orders, and payment simulation.*

### Run Backend In-Memory E2E Script
```bash
cd backend
node tests/e2e-simulation.js
```

### Run Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```

### Run Linters
- **Backend:** `cd backend && npm run lint`
- **Frontend:** `cd frontend && npm run lint`

### Run Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 10. Troubleshooting & FAQ

### MongoDB Connection Failed or Degraded
- Verify MongoDB is running locally:
  ```bash
  docker ps
  ```
- If your Docker container requires credentials, ensure `authSource=admin` is appended:
  ```env
  MONGO_URI=mongodb://root:example@localhost:27017/ecommerce?authSource=admin
  ```
- Verify Mongo Express is reachable at `http://localhost:8081` to view collections.

### CORS Errors
- The backend restricts cross-origin requests using `CLIENT_URL`. If running Vite on a port other than `5173`, update `CLIENT_URL` in `backend/.env`.

### Rate Limit Reached
- Public authentication routes have rate limiting (100 requests per 15 minutes) to protect against credential stuffing. If hit during rapid automated scripts, wait 15 minutes or temporarily adjust `authLimiter` in `backend/src/routes/authRoutes.js`.
