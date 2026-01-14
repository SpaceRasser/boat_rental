-- Миграция 003: Создание таблицы boats
CREATE TABLE IF NOT EXISTS boats (
    id_boat INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    price_discount DECIMAL(10, 2) NULL,
    available_days VARCHAR(255) DEFAULT 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
    available_time_start TIME DEFAULT '09:00:00',
    available_time_end TIME DEFAULT '18:00:00',
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_available (available),
    INDEX idx_owner (owner_id),
    FOREIGN KEY (owner_id) REFERENCES owners(id_owner) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
