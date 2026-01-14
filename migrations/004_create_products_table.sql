-- Миграция 004: Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) DEFAULT 'Другое',
    image_url VARCHAR(500) NULL,
    available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    price_discount DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_available (available),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
