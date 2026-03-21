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

let schemaReady = false;

export async function ensureDatabaseSchema() {
  if (schemaReady) {
    return;
  }

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

  schemaReady = true;
}
