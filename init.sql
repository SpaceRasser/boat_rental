-- ============================================
-- ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ BOAT_RENTAL_SYSTEM
-- Автоматически выполняется при первом запуске MySQL в Docker
-- ============================================

CREATE DATABASE IF NOT EXISTS boat_rental_system;
USE boat_rental_system;

-- ============================================
-- ТАБЛИЦА 1: USERS (Пользователи)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birth_date DATE NULL,
    role ENUM('client', 'owner', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА 2: OWNERS (Арендодатели)
-- ============================================
CREATE TABLE IF NOT EXISTS owners (
    id_owner INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА 3: BOATS (Лодки/Услуги)
-- ============================================
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

-- ============================================
-- ТАБЛИЦА 4: PRODUCTS (Товары)
-- ============================================
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

-- ============================================
-- ТАБЛИЦА 5: BOAT_ORDERS (Заказы лодок)
-- ============================================
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

-- ============================================
-- ТАБЛИЦА 6: BOOKINGS (Бронирования)
-- ============================================
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

-- ============================================
-- ТАБЛИЦА 7: PAYMENTS (Платежи)
-- ============================================
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
