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
if (empty($data['boat_id']) || empty($data['price'])) {
    sendError('Missing required fields: boat_id, price');
}

try {
    $conn = getConnection();
    
    // Проверяем существование лодки
    $boatStmt = $conn->prepare("SELECT id_boat FROM boats WHERE id_boat = :boat_id");
    $boatStmt->bindParam(':boat_id', $data['boat_id'], PDO::PARAM_INT);
    $boatStmt->execute();
    
    if (!$boatStmt->fetch()) {
        sendError('Boat not found', 404);
    }
    
    // Проверяем существование товара (если указан)
    if (!empty($data['product_id'])) {
        $productStmt = $conn->prepare("SELECT id_product FROM products WHERE id_product = :product_id");
        $productStmt->bindParam(':product_id', $data['product_id'], PDO::PARAM_INT);
        $productStmt->execute();
        
        if (!$productStmt->fetch()) {
            sendError('Product not found', 404);
        }
    }
    
    // Вставляем данные
    $stmt = $conn->prepare("
        INSERT INTO boat_orders (
            boat_id, product_id, status, available, available_days,
            available_time_start, available_time_end, quantity, price, price_discount
        ) VALUES (
            :boat_id, :product_id, :status, :available, :available_days,
            :available_time_start, :available_time_end, :quantity, :price, :price_discount
        )
    ");
    
    // Подготавливаем данные
    $boat_id = intval($data['boat_id']);
    $product_id = !empty($data['product_id']) ? intval($data['product_id']) : null;
    $status = isset($data['status']) ? trim($data['status']) : 'ожидание';
    $available = isset($data['available']) ? (bool)$data['available'] : true;
    $available_days = isset($data['available_days']) ? trim($data['available_days']) : 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье';
    $available_time_start = isset($data['available_time_start']) ? trim($data['available_time_start']) : '09:00';
    $available_time_end = isset($data['available_time_end']) ? trim($data['available_time_end']) : '18:00';
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
    $price = floatval($data['price']);
    $price_discount = isset($data['price_discount']) ? floatval($data['price_discount']) : null;
    
    // Биндим параметры
    $stmt->bindParam(':boat_id', $boat_id, PDO::PARAM_INT);
    $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->bindParam(':available', $available, PDO::PARAM_BOOL);
    $stmt->bindParam(':available_days', $available_days, PDO::PARAM_STR);
    $stmt->bindParam(':available_time_start', $available_time_start, PDO::PARAM_STR);
    $stmt->bindParam(':available_time_end', $available_time_end, PDO::PARAM_STR);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':price_discount', $price_discount);
    
    if ($stmt->execute()) {
        $orderId = $conn->lastInsertId();
        
        // Получаем созданный заказ с информацией о лодке и товаре
        $orderStmt = $conn->prepare("
            SELECT 
                o.id_order,
                o.boat_id,
                b.name as boat_name,
                o.product_id,
                p.name as product_name,
                o.status,
                o.available,
                o.available_days,
                TIME_FORMAT(o.available_time_start, '%H:%i') as available_time_start,
                TIME_FORMAT(o.available_time_end, '%H:%i') as available_time_end,
                o.quantity,
                o.price,
                o.price_discount,
                DATE_FORMAT(o.created_at, '%d.%m.%Y %H:%i') as created_at
            FROM boat_orders o
            LEFT JOIN boats b ON o.boat_id = b.id_boat
            LEFT JOIN products p ON o.product_id = p.id_product
            WHERE o.id_order = :id
        ");
        $orderStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
        $orderStmt->execute();
        $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($order, 201);
    } else {
        sendError('Failed to create order');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>