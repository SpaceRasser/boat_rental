-- Миграция 006: Создание таблицы bookings
CREATE TABLE IF NOT EXISTS bookings (
    id_booking INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    owner_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'бронь',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_owner (owner_id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES owners(id_owner) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
