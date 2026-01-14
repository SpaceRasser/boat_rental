<?php
/**
 * Конфигурация API
 * Автоматически создает таблицы при первом подключении
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Получение подключения к базе данных
 */
function getConnection() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'boat_rental_system';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
    
    try {
        if ($host !== 'localhost' && $host !== '127.0.0.1') {
            $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4";
        } else {
            $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        }
        
        $conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        
        // Автоматически создаем таблицы при первом подключении
        ensureTablesExist($conn, $dbname);
        
        return $conn;
    } catch(PDOException $e) {
        sendError('Connection failed: ' . $e->getMessage(), 500);
        exit();
    }
}

/**
 * Автоматическое создание таблиц если их нет
 */
function ensureTablesExist($conn, $dbname) {
    static $tablesChecked = false;
    if ($tablesChecked) return;
    
    try {
        // Проверяем существование таблиц
        $stmt = $conn->query("SHOW TABLES");
        $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredTables = ['users', 'owners', 'boats', 'products', 'bookings', 'booking_items', 'payments'];
        $missingTables = array_diff($requiredTables, $existingTables);
        
        if (empty($missingTables)) {
            $tablesChecked = true;
            return;
        }
        
        // Создаем отсутствующие таблицы
        createTableUsers($conn);
        createTableOwners($conn);
        createTableBoats($conn);
        createTableProducts($conn);
        createTableBookings($conn);
        createTableBookingItems($conn);
        createTablePayments($conn);
        
        $tablesChecked = true;
    } catch(PDOException $e) {
        error_log('Error ensuring tables: ' . $e->getMessage());
    }
}

function createTableUsers($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        birth_date DATE NULL,
        role ENUM('client', 'owner', 'admin') DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTableOwners($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS owners (
        id_owner INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTableBoats($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS boats (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTableProducts($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS products (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTableBookings($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS bookings (
        id_booking INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        boat_id INT NOT NULL,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'бронь',
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_boat (boat_id),
        INDEX idx_date (booking_date),
        INDEX idx_status (status),
        INDEX idx_boat_date (boat_id, booking_date),
        FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
        FOREIGN KEY (boat_id) REFERENCES boats(id_boat) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTableBookingItems($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS booking_items (
        id_booking_item INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        product_id INT NULL,
        quantity INT DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        price_discount DECIMAL(10, 2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_booking (booking_id),
        INDEX idx_product (product_id),
        FOREIGN KEY (booking_id) REFERENCES bookings(id_booking) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id_product) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

function createTablePayments($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS payments (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->exec($sql);
}

/**
 * Отправка успешного ответа
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Отправка ошибки
 */
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
?>
