<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$paymentId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($paymentId <= 0) {
    sendError('Invalid payment ID', 400);
}

try {
    $conn = getConnection();
    
    // Проверяем существование платежа
    $checkStmt = $conn->prepare("SELECT id_payment FROM payments WHERE id_payment = ?");
    $checkStmt->execute([$paymentId]);
    
    if (!$checkStmt->fetch()) {
        sendError('Payment not found', 404);
    }
    
    // Удаляем платеж
    $stmt = $conn->prepare("DELETE FROM payments WHERE id_payment = ?");
    
    if ($stmt->execute([$paymentId])) {
        sendResponse([
            'message' => 'Payment deleted successfully',
            'id' => $paymentId
        ]);
    } else {
        sendError('Failed to delete payment', 500);
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>