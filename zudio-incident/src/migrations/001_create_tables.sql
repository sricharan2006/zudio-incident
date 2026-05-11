-- created by contractor, 2023-08 -- reach out to Vikram if questions
-- Migration: 001_create_tables
-- Zudio e-commerce schema

-- clean up if re-running (handy during dev)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- users
-- note: role has no CHECK constraint — any string works
--       password stored as text (hashing TODO)
-- ------------------------------------------------------------
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255),
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   TEXT,
  phone      VARCHAR(20),
  role       VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);
-- no index on email beyond the unique constraint (unique already creates one)
-- role column has no CHECK ('admin', 'customer', anything goes)

-- ------------------------------------------------------------
-- products
-- stock has no CHECK so it can go negative (relevant after stock-decrement bug fix)
-- no index on category_id — full scan when browsing by category
-- ------------------------------------------------------------
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  description TEXT,
  price       NUMERIC(10, 2),
  stock       INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  image_url   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
-- intentionally no index on products.category_id

-- ------------------------------------------------------------
-- orders
-- user_id has no NOT NULL — orphaned orders are possible
-- no index on user_id — full table scan every time a user checks history
-- ------------------------------------------------------------
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id),
  total_amount     NUMERIC(10, 2),
  discount         NUMERIC(10, 2) DEFAULT 0,
  shipping_address TEXT,
  status           VARCHAR(50) DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
-- intentionally no index on orders.user_id

-- ------------------------------------------------------------
-- order_items
-- denormalised: stores product_name and product_price alongside product_id
-- this means price history is embedded in the row rather than computed from products
-- quantity has no CHECK constraint — negative values are allowed
-- no index on order_id — full table scan per order in the N+1 query
-- ------------------------------------------------------------
CREATE TABLE order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER REFERENCES orders(id),
  product_id    INTEGER REFERENCES products(id),
  product_name  VARCHAR(255),
  product_price NUMERIC(10, 2),
  quantity      INTEGER,
  unit_price    NUMERIC(10, 2),
  created_at    TIMESTAMP DEFAULT NOW()
);
-- intentionally no index on order_items.order_id

-- ------------------------------------------------------------
-- coupons
-- single-use coupons, no per-user limit
-- used flag is non-atomic (race condition possible — see checkout controller)
-- ------------------------------------------------------------
CREATE TABLE coupons (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,
  discount_amount NUMERIC(10, 2),
  used            BOOLEAN DEFAULT false,
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
