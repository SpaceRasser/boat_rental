-- Миграция 007: Создание таблицы payments
CREATE TABLE IF NOT EXISTS payments (
    id_payment INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'card',
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    FOREIGN KEY (booking_id) REFERENCES bookings(id_booking) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
