
# NestJS E-Commerce Payment Gateway

> An E-commerce payment gateway using NestJS with integrated Stripe and PayPal support. Built with MongoDB and REST APIs.

---

## 🚀 Overview

This project delivers a secure and modular payment system built with NestJS. It supports payments via Stripe and PayPal, along with order management and role-based access control. the system handles payment success and cancellation through redirect-based endpoints.

---

## 🔧 Technologies Used

- **NestJS** – Progressive Node.js framework
- **Stripe API** – Payment gateway integration
- **PayPal API** – Payment gateway integration
- **MongoDB** – NoSQL database
- **JWT** – Authentication with token decorators
- **Role-Based Access Control (RBAC)**

---

## ✨ Features

- Create payment session using Stripe or PayPal
- Handle success and cancel redirects manually
- Role-based user authorization (`user` role)
- Custom guards and decorators for token and role extraction
- Cancel order endpoint for both Stripe and PayPal
- Well-structured modular architecture

---

## 📁 Project Structure

```
src/
├── orders/          # Order management
├── payments/        # Payment management
├── product/         # Product management
├── users/           # User management
├── utils/           # Shared modules (guards, middlewares, etc.)
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

---

## 🧪 Payment Endpoints

### Stripe

- `POST /stripe` – Create Stripe session  
- `GET /stripe/success?session_id=...` – Confirm payment and create order  
- `GET /stripe/cancel` – Cancel the payment  

### PayPal

- `POST /paypal` – Create PayPal payment  
- `GET /paypal/success?...` – Confirm PayPal payment and create order  
- `GET /paypal/cancel` – Cancel the PayPal payment  

### Cancel Order

- `POST /cancel-order/:sessionId` – Cancel order manually (Stripe or PayPal)

---

## 🔐 Auth & Security

- Uses `@Token()` decorator to extract JWT token
- Guards validate users via `UsersGuard`
- Access limited to users with `@Roles(['user'])`

---

## 📦 Installation

```bash
git clone https://github.com/3laaElsadany/NestJS_E-Commerce_Payment_Gateway.git
cd NestJS_E-Commerce_Payment_Gateway
npm install
```

### Environment Variables (`.env`)

```
DB_URL=your_mongo_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET_KEY=your_paypal_secret
HOST=localhost
PORT=...
EXPIRE_TIME=...
```

### Run the App

```bash
npm run start:dev
```
Your NestJS payment gateway is now ready to process payments.


