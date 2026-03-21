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
    `CREATE TABLE IF NOT EXISTS meril_semi_automatic (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sr_no INT NOT NULL,
      category VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      pack_size VARCHAR(50) NOT NULL,
      mrp_units DECIMAL(10, 2) NOT NULL,
      cut_price DECIMAL(10, 2) NOT NULL,
      gst VARCHAR(10) NOT NULL,
      UNIQUE KEY uk_meril_semi_sr_no (sr_no)
    )`
  );

  await dbQuery(
    `INSERT IGNORE INTO meril_semi_automatic (sr_no, category, product_name, pack_size, mrp_units, cut_price, gst) VALUES
      (1, 'meril semi automatic', 'ALBUMIN', '4X50 ML', 1036.00, 392.00, '5%'),
      (2, 'meril semi automatic', 'ALKALINE PHOS.', '4X10 M', 1436.00, 543.00, '5%'),
      (3, 'meril semi automatic', 'ALKALINE PHOS.', '5X20ML', 3087.00, 1167.00, '5%'),
      (4, 'meril semi automatic', 'AMYLASE', '4X10 ML', 7396.00, 2796.00, '5%'),
      (5, 'meril semi automatic', 'BILURUBIN T & D', '4X50ML', 1912.00, 723.00, '5%'),
      (7, 'meril semi automatic', 'CALCIUM ARSENAZO', '2X25ML', 1474.00, 557.00, '5%'),
      (8, 'meril semi automatic', 'CHOLESTROL', '4X25ML', 2281.00, 867.00, '5%'),
      (9, 'meril semi automatic', 'CHOLESTROL', '4X50ML', 4237.00, 1602.00, '5%'),
      (10, 'meril semi automatic', 'CK MB', '2X8/2X2ML', 6196.00, 2342.00, '5%'),
      (11, 'meril semi automatic', 'CK NAC', '2X8/2X2ML', 2451.00, 926.00, '5%'),
      (12, 'meril semi automatic', 'CELL WASH', '4X50ML', 1553.00, 550.00, '5%'),
      (13, 'meril semi automatic', 'CREATININE', '2X25/2X25ML', 1099.00, 415.00, '5%'),
      (14, 'meril semi automatic', 'CREATININE', '3X50/3X50ML', 2838.00, 1050.00, '5%'),
      (16, 'meril semi automatic', 'GGT', '1X8/1X2ML', 1131.00, 428.00, '5%'),
      (17, 'meril semi automatic', 'GLUCOSE', '5X100ML', 2158.00, 816.00, '5%'),
      (19, 'meril semi automatic', 'SGOT', '4X20/4X5ML', 2293.00, 867.00, '5%'),
      (20, 'meril semi automatic', 'SGPT', '4X20/4X5ML', 2174.00, 822.00, '5%'),
      (21, 'meril semi automatic', 'HDL CHOLESTROL', '4X25ML', 1969.00, 720.00, '5%'),
      (22, 'meril semi automatic', 'HDL DIRECT', '1X24/1X8ML', 10987.00, 4154.00, '5%'),
      (23, 'meril semi automatic', 'LDH P', '1X8/1X2ML', 876.00, 332.00, '5%'),
      (24, 'meril semi automatic', 'LDL CHO DIRECT', '1X24/1X8ML', 9963.00, 3480.00, '5%'),
      (26, 'meril semi automatic', 'LIPASE', '1X16/1X10ML', 11998.00, 4535.00, '5%'),
      (27, 'meril semi automatic', 'TRIGLYCERIDE', '4X25ML', 5097.00, 1926.00, '5%'),
      (30, 'meril semi automatic', 'URIC ACID', '4X50ML', 4684.00, 1770.00, '5%'),
      (31, 'meril semi automatic', 'UREA', '4X20/4X5ML', 2388.00, 903.00, '5%'),
      (32, 'meril semi automatic', 'TOTAL PROTEIN', '4X50 ML', 939.00, 354.00, '5%'),
      (33, 'meril semi automatic', 'ASO', '1X40/1X10ML', 16988.00, 5662.00, '5%'),
      (34, 'meril semi automatic', 'CRP', '1X40/1X10ML', 5909.00, 1920.00, '5%'),
      (35, 'meril semi automatic', 'RF', '1X40/1X10ML', 8981.00, 2850.00, '5%')`
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
