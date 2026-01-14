<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'boat_rental_system';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

try {
    // Для Docker используем TCP соединение с указанием порта
    if ($host !== 'localhost' && $host !== '127.0.0.1') {
        $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8";
    } else {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    }
    
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Connection failed: ' . $e->getMessage()
    ]);
    exit();
}
?>