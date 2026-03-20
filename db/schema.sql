CREATE TABLE IF NOT EXISTS hollister (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    packing_per_box INT NOT NULL,
    dp_units DECIMAL(10, 2) NOT NULL,
    mrp_units DECIMAL(10, 2) NOT NULL,
    cut_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS medicine_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES hollister(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meril_fully_automatic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sr_no INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    mrp_units DECIMAL(10, 2) NOT NULL,
    cut_price DECIMAL(10, 2) NOT NULL,
    gst VARCHAR(10) NOT NULL
);
