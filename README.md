# 🛒 BharatBasket - Hyperlocal 10-Minute Quick Commerce Ecosystem

**BharatBasket** is an end-to-end multi-tier hyperlocal quick-commerce platform built with Node.js, Express, Socket.io, MongoDB Atlas, and React + Tailwind CSS.

---

## 🏛️ Ecosystem Architecture

| Application | Port | Role & Capabilities |
| :--- | :--- | :--- |
| **`backend/`** | `:5000` | Central Express REST API, MongoDB Mongoose models, JWT RBAC, Socket.io real-time broadcast engine |
| **`client-customer/`** | `:3000` | Customer storefront with category browser, lightning cart, instant order placement, live rider tracking modal |
| **`client-seller/`** | `:3001` | Merchant POS terminal with **Self Delivery vs Partner Delivery Mode Toggle**, inventory manager, audio chime 🔔 |
| **`client-delivery/`** | `:3003` | **Delivery Partner Fleet Portal** with Online/Offline duty switch, available pickup queue, step-by-step navigation mission, trip earnings |
| **`client-admin/`** | `:3002` | Super Admin governance console for vendor approvals, master catalog management, platform-wide analytics |

---

## 🛵 Delivery Workflow

1. **Seller Delivery Mode Switch:**
   - **Self Delivery:** Store staff fulfills and delivers the order directly to customer.
   - **Delivery Partner Fleet:** When marked ready, order is broadcasted in real-time to all nearby online BharatBasket delivery partners with an audio chime 🔔.
2. **Order Claim & Fulfillment:**
   - The first delivery partner to click **"Accept Trip"** claims the order atomically.
   - **Step 1:** Partner navigates to store location and confirms pickup.
   - **Step 2:** Partner navigates to customer doorstep, collects COD/verifies payment, and marks delivered.
   - Customer and seller see live status updates and rider details in real-time!

---

## 🔑 Demo Credentials

- **Super Admin:** `admin@bharatbasket.com` / `admin1234`
- **Merchant Seller:** `seller@bharatbasket.com` / `seller1234`
- **Delivery Partner Rider:** `rider@bharatbasket.com` / `rider1234`
- **Customer:** `customer@bharatbasket.com` / `customer1234`
