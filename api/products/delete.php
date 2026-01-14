<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($productId <= 0) {
    sendError('Invalid product ID');
}

try {
    $conn = getConnection();
    
    // Проверяем существование товара
    $checkStmt = $conn->prepare("SELECT id_product FROM products WHERE id_product = :id");
    $checkStmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Product not found', 404);
    }
    
    // Удаляем товар
    $stmt = $conn->prepare("DELETE FROM products WHERE id_product = :id");
    $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Product deleted successfully', 'id' => $productId]);
    } else {
        sendError('Failed to delete product');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>