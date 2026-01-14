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

    $checkStmt = $conn->prepare("SELECT id_booking FROM bookings WHERE id_booking = :id");
    $checkStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
    $checkStmt->execute();

    if (!$checkStmt->fetch()) {
        sendError('Order not found', 404);
    }

    $stmt = $conn->prepare("UPDATE bookings SET status = 'отменена' WHERE id_booking = :id");
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
