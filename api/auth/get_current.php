<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// В реальном приложении здесь должна быть проверка сессии/токена
// Для упрощения используем параметр user_id
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

if (!$userId) {
    sendError('User ID is required', 400);
}

try {
    $conn = getConnection();
    
    $stmt = $conn->prepare("
        SELECT id_user, name, email, birth_date, role,
               DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at 
        FROM users 
        WHERE id_user = :id
    ");
    
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        sendResponse($user, 200);
    } else {
        sendError('User not found', 404);
    }
    
} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
