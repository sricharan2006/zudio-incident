# 🛍️ Zudio Backend API

<div align="center">

**E-commerce backend for the Zudio fashion platform**

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 🚀 Getting Started

```bash
# 1. Fork the repository 
# 2. Clone the repository
git clone <repo-url>
cd zudio-backend

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

> Server starts on `http://localhost:3000`

---

## 🗂️ Project Structure

```
zudio-backend/
├── 📁 src/
│   ├── 📁 controllers/       # Route handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   └── checkout.controller.js
│   ├── 📁 routes/            # Express routers
│   ├── 📁 middleware/        # JWT auth middleware
│   ├── 📁 db/                # pg Pool config
│   ├── 📁 migrations/        # SQL schema
│   └── 📁 seeds/             # Sample data
├── 📁 scripts/               # Utility scripts
├── 📄 .env.example
└── 📄 package.json
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | 🟢 Health check |
| `GET` | `/api/products` | — | 📦 List all products |
| `GET` | `/api/products/:id` | — | 🔍 Get product by ID |
| `POST` | `/api/auth/register` | — | 📝 Register new user |
| `POST` | `/api/auth/login` | — | 🔐 Login & get token |
| `GET` | `/api/orders/history` | 🔒 Bearer | 📋 Get order history |
| `POST` | `/api/cart/checkout` | 🔒 Bearer | 🛒 Place an order |
| `PATCH` | `/api/orders/:id/status` | 🔒 Admin | ✏️ Update order status |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| ⚙️ Runtime | Node.js 18 |
| 🌐 Framework | Express 4 |
| 🗄️ Database | PostgreSQL (node-postgres) |
| 🔑 Auth | JSON Web Tokens |
| 🔧 Dev | Nodemon |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🔥 Start dev server (nodemon) |
| `npm start` | 🚀 Start production server |
| `npm run migrate` | 🗄️ Run DB migrations |
| `npm run seed` | 🌱 Seed sample data |
| `npm run generate:seed` | ⚙️ Regenerate seed SQL file |

---

## ⚠️ Known Issues

- 🔍 Search sometimes returns unexpected results depending on the query string passed.

---

## 📌 TODO

- [ ] ✅ Add input validation across all endpoints
- [ ] 🔒 Password hashing *(ask Rahul)*
- [ ] 🧪 Add unit tests and integration test suite
- [ ] 🚦 Rate limiting on auth endpoints

---

<div align="center">

Made with ☕ by the Zudio dev team
This is the completion of this assignment.

</div>
