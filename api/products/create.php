<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Валидация
if (empty($data['name']) || empty($data['price'])) {
    sendError('Missing required fields: name, price');
}

try {
    $conn = getConnection();
    
    // Вставляем данные
    $stmt = $conn->prepare("
        INSERT INTO products (
            name, description, category, image_url, 
            available, quantity, price, price_discount
        ) VALUES (
            :name, :description, :category, :image_url,
            :available, :quantity, :price, :price_discount
        )
    ");
    
    // Подготавливаем данные
    $name = trim($data['name']);
    $description = isset($data['description']) ? trim($data['description']) : null;
    $category = isset($data['category']) ? trim($data['category']) : 'Другое';
    $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;
    $available = isset($data['available']) ? (bool)$data['available'] : true;
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 0;
    $price = floatval($data['price']);
    $price_discount = isset($data['price_discount']) ? floatval($data['price_discount']) : null;
    
    // Биндим параметры
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->bindParam(':image_url', $image_url, PDO::PARAM_STR);
    $stmt->bindParam(':available', $available, PDO::PARAM_BOOL);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':price_discount', $price_discount);
    
    if ($stmt->execute()) {
        $productId = $conn->lastInsertId();
        
        // Получаем созданный товар
        $productStmt = $conn->prepare("
            SELECT 
                id_product,
                name,
                description,
                category,
                image_url,
                available,
                quantity,
                price,
                price_discount,
                DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
            FROM products 
            WHERE id_product = :id
        ");
        $productStmt->bindParam(':id', $productId, PDO::PARAM_INT);
        $productStmt->execute();
        $product = $productStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($product, 201);
    } else {
        sendError('Failed to create product');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>