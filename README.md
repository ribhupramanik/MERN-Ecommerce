# MERN E-Commerce

A full-stack fashion storefront with customer accounts, a persistent shopping cart, Stripe checkout, and an admin dashboard for managing products and reviewing sales. Built with MongoDB, Express, React, and Node.js, with Redis and Cloudinary supporting session storage, caching, and product media.

[Live Demo](https://mern-ecommerce-6gnq.onrender.com) · [Source Code](https://github.com/ribhupramanik/MERN-Ecommerce)

## Project at a glance

| Area | Implementation |
| --- | --- |
| Customer experience | Seven product categories, featured products, cart quantity controls, coupons, and checkout |
| Admin experience | Product creation and deletion, featured-product controls, and sales analytics |
| Authentication | Password hashing with bcrypt, JWT access and refresh tokens, HTTP-only cookies, and role-based API access |
| Data and services | MongoDB persistence, Redis session storage and featured-product caching, Cloudinary uploads, Stripe Checkout |
| Interface | Responsive layouts, animated components, toast notifications, and chart-based reporting |

## Explore the application

1. Open the demo and browse the category pages and featured products.
2. Create a customer account to add products to your cart, change quantities, and explore the coupon flow.
3. For a local admin walkthrough, promote your own account as described below, then open the Dashboard to create products, toggle featured items, and inspect sales charts.

The demo depends on active database and external-service connections. Use Stripe test credentials when running checkout locally.

## Engineering highlights

- **Separated API responsibilities:** Routes, controllers, models, middleware, and service clients live in dedicated backend directories. [Browse the backend](backend).
- **Authorization on the server:** Authentication middleware checks access tokens, while admin middleware restricts product management and analytics endpoints. [View middleware](backend/middleware/auth.middleware.js).
- **Shared client state:** Zustand stores manage account, cart, and product state across React pages. [View stores](frontend/src/stores).
- **Cache-backed product discovery:** Featured products are read from Redis, populated from MongoDB on a cache miss, and refreshed when an admin changes featured status. [View product controller](backend/controllers/product.controller.js).
- **Checkout integration:** The backend creates Stripe Checkout sessions in INR; the success handler checks payment status before recording an order and clearing the cart. [View payment controller](backend/controllers/payment.controller.js).
- **Aggregated reporting:** MongoDB aggregation calculates order counts, revenue, and daily sales, including zero-value entries for dates without orders. [View analytics](backend/controllers/analytics.controller.js).

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 7, React Router, Zustand, Axios |
| Styling and UI | Tailwind CSS 4, Framer Motion, Lucide React, React Hot Toast |
| Charts | Recharts |
| Backend | Node.js, Express 5, Mongoose |
| Storage | MongoDB, Redis via ioredis |
| Integrations | Stripe Checkout, Cloudinary |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Hosting | Render; Express serves the built React application in production |

## Architecture

```mermaid
flowchart LR
    Browser[React + Zustand] -->|Axios /api requests| API[Express API]
    API --> MongoDB[(MongoDB)]
    API --> Redis[(Redis)]
    API --> Cloudinary[Cloudinary product images]
    API --> Stripe[Stripe Checkout]
    Browser -->|Checkout redirect| Stripe
```

MongoDB stores users and their carts, products, coupons, and orders. Redis stores refresh tokens and the featured-product cache. Uploaded product images use Cloudinary; category thumbnails are static files in `frontend/public`.

## Run locally

### Prerequisites

- Node.js 22.12+ and npm.
- A MongoDB database and an active Redis instance, such as Upstash.
- Cloudinary credentials and a Stripe test secret key.

### 1. Install dependencies

```bash
git clone https://github.com/ribhupramanik/MERN-Ecommerce.git
cd MERN-Ecommerce
npm install
npm install --prefix frontend
```

### 2. Configure the backend

Create a `.env` file in the repository root using the following template. Replace the placeholder values with your own credentials. The `.env` file is ignored by Git.

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/mern_ecommerce
UPSTASH_REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_REDIS_HOST:6379

ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_replace_with_your_key
```

Use your provider's Redis connection URL, including its protocol and port. Redis must be available for signup and login because the backend stores refresh tokens there.

### 3. Start both servers

In one terminal, start the API:

```bash
npm run dev
```

In a second terminal, start the frontend:

```bash
npm run dev --prefix frontend
```

Open [localhost:5173](http://localhost:5173). Vite proxies `/api` requests to port `5000`. If Vite selects another port, update `CLIENT_URL` to match and restart the backend so checkout redirects return to the correct address.

### 4. Explore the admin dashboard

New accounts receive the `customer` role. For your local database, create an account through the UI, then use MongoDB Compass to set that user's `role` field to `admin` in the `users` collection. Sign out and back in to access the Dashboard.

An empty database has no products. Use the dashboard to add products with images and mark selected products as featured.

## Build and deployment

The root build script installs dependencies for both applications and builds the frontend:

```bash
npm run build
```

For Render, use `npm run build` as the build command and `npm start` as the start command. Configure the environment variables above, set `NODE_ENV=production`, and set `CLIENT_URL` to the deployed site's HTTPS origin.

In production, Express serves `frontend/dist` and handles frontend navigation through the React entry page. Keep the category images in `frontend/public` committed so they are included in the build.

## API overview

| Prefix | Responsibility | Access |
| --- | --- | --- |
| `/api/auth` | Signup, login, logout, refresh tokens, profile | Public auth actions; protected profile |
| `/api/products` | Categories, featured products, recommendations, product management | Public browsing; authenticated recommendations; admin management |
| `/api/cart` | Read cart, add/remove items, update quantities | Customer account |
| `/api/coupons` | Retrieve and validate coupons | Customer account |
| `/api/payments` | Create checkout sessions and process checkout success | Customer account |
| `/api/analytics` | Summary metrics and daily sales | Admin |

See [backend/routes](backend/routes) for exact methods and endpoint paths.

## Development checks and next steps

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

These commands run frontend linting and compilation; the repository does not currently include an automated test suite.

Planned improvements include automated coverage for authentication, cart, and checkout flows; server-side price lookup during checkout; and webhook-based payment fulfillment with idempotent order creation. These are future work, not implemented features.

## Author

[Ribhu Pramanik](https://github.com/ribhupramanik)
