<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($productId <= 0) {
    sendError('Invalid product ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование товара
    $checkStmt = $conn->prepare("SELECT id_product FROM products WHERE id_product = :id");
    $checkStmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Product not found', 404);
    }
    
    // Формируем запрос обновления
    $updateFields = [];
    $params = [':id' => $productId];
    
    $fields = [
        'name' => PDO::PARAM_STR,
        'description' => PDO::PARAM_STR,
        'category' => PDO::PARAM_STR,
        'image_url' => PDO::PARAM_STR,
        'available' => PDO::PARAM_BOOL,
        'quantity' => PDO::PARAM_INT,
        'price' => null,
        'price_discount' => null
    ];
    
    foreach ($fields as $field => $type) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update');
    }
    
    // Выполняем обновление
    $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id_product = :id";
    $stmt = $conn->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($value === null) {
            $stmt->bindValue($key, null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        // Получаем обновленный товар
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
        
        sendResponse($product);
    } else {
        sendError('Failed to update product');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>