<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$boatId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($boatId <= 0) {
    sendError('Invalid boat ID');
}

try {
    $conn = getConnection();
    
    // Проверяем существование лодки
    $checkStmt = $conn->prepare("SELECT id_boat FROM boats WHERE id_boat = :id");
    $checkStmt->bindParam(':id', $boatId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Boat not found', 404);
    }
    
    // Удаляем лодку
    $stmt = $conn->prepare("DELETE FROM boats WHERE id_boat = :id");
    $stmt->bindParam(':id', $boatId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Boat deleted successfully', 'id' => $boatId]);
    } else {
        sendError('Failed to delete boat');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>