<?php
require_once '../config.php';

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

// Получаем ID из URL
$userId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($userId <= 0) {
    sendError('Invalid user ID');
}

try {
    $conn = getConnection();
    
    // Сначала проверяем, есть ли пользователь
    $checkStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = :id");
    $checkStmt->bindParam(':id', $userId);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('User not found', 404);
    }
    
    // Удаляем пользователя
    $stmt = $conn->prepare("DELETE FROM users WHERE id_user = :id");
    $stmt->bindParam(':id', $userId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'User deleted successfully', 'id' => $userId]);
    } else {
        sendError('Failed to delete user');
    }
    
} catch(PDOException $e) {
    // Если есть связи с другими таблицами, удалить не получится
    if ($e->getCode() == '23000') { // Ошибка внешнего ключа
        sendError('Cannot delete user because it has related records in other tables');
    }
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>