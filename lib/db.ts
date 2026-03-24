import "server-only";

import mysql, { type Pool } from "mysql2/promise";

declare global {
  var __medixPool: Pool | undefined;
}

function getDbPool(): Pool {
  if (global.__medixPool) {
    return global.__medixPool;
  }

  const host = process.env.DB_HOST ?? "localhost";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!user || !database) {
    throw new Error("Database environment variables are missing. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.");
  }

  global.__medixPool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return global.__medixPool;
}

export async function dbQuery<T extends unknown[]>(sql: string, params: unknown[] = []) {
  const pool = getDbPool();
  const [rows, fields] = await pool.query(sql, params);
  return [rows as T, fields] as const;
}

export async function ensureDatabaseSchema() {
  await dbQuery(
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS email_otps (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_otps_email_created (email, id)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_token VARCHAR(128) NOT NULL UNIQUE,
      user_id INT NULL,
      email VARCHAR(255) NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_sessions_user (user_id)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS carts (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_token VARCHAR(128) NOT NULL UNIQUE,
      user_id INT NULL,
      email VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_carts_user (user_id)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS cart_items (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      cart_id BIGINT NOT NULL,
      product_type VARCHAR(30) NOT NULL,
      product_id INT NOT NULL,
      product_key VARCHAR(80) NOT NULL,
      product_name VARCHAR(500) NOT NULL,
      product_subtitle VARCHAR(500) NOT NULL,
      image_url VARCHAR(500) NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      mrp_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_cart_product (cart_id, product_key),
      CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS orders (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      bill_no VARCHAR(40) NOT NULL UNIQUE,
      razorpay_order_id VARCHAR(100) NULL UNIQUE,
      razorpay_payment_id VARCHAR(100) NULL UNIQUE,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      payment_status VARCHAR(30) NOT NULL DEFAULT 'created',
      user_id INT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      address_line TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      notes TEXT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      gst_percent DECIMAL(5,2) NOT NULL,
      gst_amount DECIMAL(10,2) NOT NULL,
      shipping_amount DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      is_udaipur_shipping TINYINT(1) NOT NULL DEFAULT 0,
      shipping_threshold_applied DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orders_email_created (email, created_at)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS order_items (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT NOT NULL,
      product_type VARCHAR(30) NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(500) NOT NULL,
      product_subtitle VARCHAR(500) NOT NULL,
      image_url VARCHAR(500) NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      mrp_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      line_total DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      INDEX idx_order_items_order (order_id)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS payment_events (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT NULL,
      event_type VARCHAR(100) NOT NULL,
      payload_json LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_payment_events_order (order_id)
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS medicine_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medicine_id INT NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES hollister(id) ON DELETE CASCADE
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS meril_fully_automatic (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sr_no INT NOT NULL,
      category VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      pack_size VARCHAR(50) NOT NULL,
      mrp_units DECIMAL(10, 2) NOT NULL,
      cut_price DECIMAL(10, 2) NOT NULL,
      gst VARCHAR(10) NOT NULL
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS meril_product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      meril_product_id INT NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meril_product_id) REFERENCES meril_fully_automatic(id) ON DELETE CASCADE
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS meril_semi_product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      meril_semi_product_id INT NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meril_semi_product_id) REFERENCES meril_semi_automatic(id) ON DELETE CASCADE
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS dynamic_techno (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_code VARCHAR(50) NOT NULL,
      brand_name VARCHAR(100) NOT NULL,
      product_description VARCHAR(255) NOT NULL,
      size VARCHAR(50) NOT NULL,
      uom VARCHAR(50) NOT NULL,
      mrp DECIMAL(10, 2) NOT NULL,
      cut_price DECIMAL(10, 2) NOT NULL
    )`
  );

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS dynamic_techno_product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dynamic_techno_product_id INT NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dynamic_techno_product_id) REFERENCES dynamic_techno(id) ON DELETE CASCADE
    )`
  );

  // One-time cleanup: remove duplicate rows in meril_semi_automatic
  // caused by old INSERT IGNORE running without a unique key
  await dbQuery(
    `DELETE t1 FROM meril_semi_automatic t1
     INNER JOIN meril_semi_automatic t2
     WHERE t1.id > t2.id
       AND t1.sr_no = t2.sr_no
       AND t1.product_name = t2.product_name
       AND t1.pack_size = t2.pack_size`
  );
}
