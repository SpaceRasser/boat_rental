<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$orderId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($orderId <= 0) {
    sendError('Invalid order ID');
}

try {
    $conn = getConnection();
    
    // Проверяем существование заказа
    $checkStmt = $conn->prepare("SELECT id_order FROM boat_orders WHERE id_order = :id");
    $checkStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Order not found', 404);
    }
    
    // Удаляем заказ
    $stmt = $conn->prepare("DELETE FROM boat_orders WHERE id_order = :id");
    $stmt->bindParam(':id', $orderId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Order deleted successfully', 'id' => $orderId]);
    } else {
        sendError('Failed to delete order');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>