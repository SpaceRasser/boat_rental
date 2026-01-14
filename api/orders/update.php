<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$orderId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($orderId <= 0) {
    sendError('Invalid order ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование заказа
    $checkStmt = $conn->prepare("SELECT id_order FROM boat_orders WHERE id_order = :id");
    $checkStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Order not found', 404);
    }
    
    // Формируем запрос обновления
    $updateFields = [];
    $params = [':id' => $orderId];
    
    $fields = [
        'status' => PDO::PARAM_STR,
        'available' => PDO::PARAM_BOOL,
        'available_days' => PDO::PARAM_STR,
        'available_time_start' => PDO::PARAM_STR,
        'available_time_end' => PDO::PARAM_STR,
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
    $sql = "UPDATE boat_orders SET " . implode(', ', $updateFields) . " WHERE id_order = :id";
    $stmt = $conn->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($value === null) {
            $stmt->bindValue($key, null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        // Получаем обновленный заказ
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
        
        sendResponse($order);
    } else {
        sendError('Failed to update order');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>