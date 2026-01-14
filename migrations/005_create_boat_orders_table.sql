-- Миграция 005: Создание таблицы boat_orders
CREATE TABLE IF NOT EXISTS boat_orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    boat_id INT NOT NULL,
    product_id INT NULL,
    status VARCHAR(50) DEFAULT 'ожидание',
    available BOOLEAN DEFAULT TRUE,
    available_days VARCHAR(255) DEFAULT 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
    available_time_start TIME DEFAULT '09:00:00',
    available_time_end TIME DEFAULT '18:00:00',
    quantity INT DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    price_discount DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_boat (boat_id),
    INDEX idx_product (product_id),
    INDEX idx_status (status),
    FOREIGN KEY (boat_id) REFERENCES boats(id_boat) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id_product) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
