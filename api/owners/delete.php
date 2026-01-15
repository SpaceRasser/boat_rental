<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$ownerId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($ownerId <= 0) {
    sendError('Invalid owner ID');
}

try {
    $conn = getConnection();
    
    // Проверяем существование владельца
    $checkStmt = $conn->prepare("SELECT id_owner FROM owners WHERE id_owner = ?");
    $checkStmt->execute([$ownerId]);
    
    if (!$checkStmt->fetch()) {
        sendError('Owner not found', 404);
    }
    
    // Проверяем, есть ли активные бронирования у этого владельца
    $bookingsCheck = $conn->prepare("
        SELECT id_booking FROM bookings 
        WHERE owner_id = ? 
        AND status NOT IN ('отменена', 'завершена')
    ");
    $bookingsCheck->execute([$ownerId]);
    
    if ($bookingsCheck->fetch()) {
        sendError('Cannot delete owner with active bookings');
    }
    
    // Удаляем владельца
    $stmt = $conn->prepare("DELETE FROM owners WHERE id_owner = ?");
    
    if ($stmt->execute([$ownerId])) {
        sendResponse(['message' => 'Owner deleted successfully', 'id' => $ownerId]);
    } else {
        sendError('Failed to delete owner');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>