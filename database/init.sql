-- ==========================================================
-- Database Initialization Script for MyGarage
-- Personal Model Collection Manager
-- ==========================================================

CREATE DATABASE IF NOT EXISTS mygarage_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE mygarage_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    bio TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ix_users_username (username),
    INDEX ix_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Car',
    brand VARCHAR(100),
    scale VARCHAR(50),
    price DECIMAL(12, 2) DEFAULT NULL,
    purchase_date DATE DEFAULT NULL,
    image_url TEXT,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_models_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_owner_id (owner_id),
    INDEX idx_category (category),
    INDEX idx_brand (brand),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    cover_image_url TEXT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_collections_owner_id (owner_id),
    INDEX ix_collections_visibility (visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collection_models (
    collection_id INT NOT NULL,
    model_id INT NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, model_id),
    CONSTRAINT fk_cm_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data (Inserted only if table is empty)
INSERT INTO models (name, category, brand, scale, price, purchase_date, image_url, description, created_at, updated_at)
SELECT * FROM (
    SELECT 
        'Nissan Skyline GT-R (R34) V-Spec II Bayside Blue' AS name,
        'Car' AS category,
        'Mini GT' AS brand,
        '1/64' AS scale,
        350000.00 AS price,
        '2026-03-15' AS purchase_date,
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Mô hình hợp kim đúc die-cast chi tiết cao, màu xanh Bayside Blue huyền thoại với mâm BBS vàng đồng đặc trưng.' AS description,
        NOW() - INTERVAL 10 DAY AS created_at,
        NOW() - INTERVAL 10 DAY AS updated_at
    UNION ALL
    SELECT 
        'Porsche 911 GT3 RS (992) Weissach Package' AS name,
        'Car' AS category,
        'Hot Wheels' AS brand,
        '1/64' AS scale,
        120000.00 AS price,
        '2026-04-02' AS purchase_date,
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Phiên bản Premium Boulevard Series với bánh cao su Real Riders, chi tiết cánh gió khí động học sợi carbon ấn tượng.' AS description,
        NOW() - INTERVAL 8 DAY AS created_at,
        NOW() - INTERVAL 8 DAY AS updated_at
    UNION ALL
    SELECT 
        'Toyota Century Royal Black' AS name,
        'Car' AS category,
        'Tomica Limited Vintage' AS brand,
        '1/64' AS scale,
        780000.00 AS price,
        '2026-05-20' AS purchase_date,
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Dòng xe biểu tượng quyền lực Nhật Bản từ TLV-NEO. Nước sơn đen bóng sâu, chi tiết rèm che và nội thất nhung tái hiện tỉ mỉ.' AS description,
        NOW() - INTERVAL 5 DAY AS created_at,
        NOW() - INTERVAL 5 DAY AS updated_at
    UNION ALL
    SELECT 
        'RX-78-2 Gundam Ver.Ka' AS name,
        'Gundam' AS category,
        'Bandai' AS brand,
        'MG 1/100' AS scale,
        950000.00 AS price,
        '2026-06-10' AS purchase_date,
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Bộ kit Master Grade thiết kế bởi thiên tài Katoki Hajime. Khung xương inner-frame kim loại kết hợp decal nước sắc nét.' AS description,
        NOW() - INTERVAL 3 DAY AS created_at,
        NOW() - INTERVAL 3 DAY AS updated_at
    UNION ALL
    SELECT 
        'Gundam Barbatos Lupus Rex' AS name,
        'Gundam' AS category,
        'Bandai' AS brand,
        'HG 1/144' AS scale,
        380000.00 AS price,
        '2026-07-01' AS purchase_date,
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Mô hình Barbatos dạng vuốt thú dã chiến từ series Iron-Blooded Orphans. Đã lót panel line và sơn viền móng vuốt vàng.' AS description,
        NOW() - INTERVAL 2 DAY AS created_at,
        NOW() - INTERVAL 2 DAY AS updated_at
    UNION ALL
    SELECT 
        'Mazinger Z Infinity Ver.' AS name,
        'Other' AS category,
        'Bandai Spirits' AS brand,
        'HG 1/144' AS scale,
        820000.00 AS price,
        '2026-08-14' AS purchase_date,
        'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80' AS image_url,
        'Siêu robot biểu tượng Nhật Bản trong phim hoạt hình điện ảnh Mazinger Z: Infinity. Khớp biên độ rộng, Rocket Punch linh hoạt.' AS description,
        NOW() - INTERVAL 1 DAY AS created_at,
        NOW() - INTERVAL 1 DAY AS updated_at
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM models LIMIT 1);
