<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$bookingId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($bookingId <= 0) {
    sendError('Invalid booking ID');
}

try {
    $conn = getConnection();
    
    // Проверяем существование бронирования
    $checkStmt = $conn->prepare("SELECT id_booking FROM bookings WHERE id_booking = :id");
    $checkStmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Booking not found', 404);
    }
    
    // Удаляем бронирование (или меняем статус на отменена)
    // Вариант 1: Мягкое удаление
    $stmt = $conn->prepare("UPDATE bookings SET status = 'отменена' WHERE id_booking = :id");
    // Вариант 2: Полное удаление
    // $stmt = $conn->prepare("DELETE FROM bookings WHERE id_booking = :id");
    
    $stmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Booking deleted successfully', 'id' => $bookingId]);
    } else {
        sendError('Failed to delete booking');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>