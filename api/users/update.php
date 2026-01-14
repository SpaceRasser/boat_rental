<?php
require_once '../config.php';

// Разрешаем все методы
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Принимаем PUT, POST или PATCH для обновления
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

// Получаем ID пользователя
$userId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($userId <= 0) {
    sendError('Invalid user ID');
}

// Получаем данные
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Валидация
if (empty($data['name']) || empty($data['email'])) {
    sendError('Name and email are required');
}

try {
    $conn = getConnection();
    
    // Проверяем существование пользователя
    $checkStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = :id");
    $checkStmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('User not found', 404);
    }
    
    // Проверяем, что email не занят другим пользователем
    if (isset($data['email'])) {
        $emailCheck = $conn->prepare("SELECT id_user FROM users WHERE email = :email AND id_user != :id");
        $emailCheck->bindParam(':email', $data['email'], PDO::PARAM_STR);
        $emailCheck->bindParam(':id', $userId, PDO::PARAM_INT);
        $emailCheck->execute();
        
        if ($emailCheck->fetch()) {
            sendError('Email already in use by another user');
        }
    }
    
    // Формируем запрос обновления
    $updateFields = [];
    $params = [':id' => $userId];
    
    if (isset($data['name'])) {
        $updateFields[] = 'name = :name';
        $params[':name'] = trim($data['name']);
    }
    
    if (isset($data['email'])) {
        $updateFields[] = 'email = :email';
        $params[':email'] = trim($data['email']);
    }
    
    if (isset($data['birth_date'])) {
        $updateFields[] = 'birth_date = :birth_date';
        $params[':birth_date'] = !empty($data['birth_date']) ? trim($data['birth_date']) : null;
    }
    
    if (isset($data['password']) && !empty(trim($data['password']))) {
        $updateFields[] = 'password = :password';
        $params[':password'] = md5(trim($data['password'])); // Временное решение
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update');
    }
    
    // Выполняем обновление
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id_user = :id";
    $stmt = $conn->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($value === null) {
            $stmt->bindValue($key, null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        // Получаем обновленного пользователя
        $userStmt = $conn->prepare("
            SELECT id_user, name, email, birth_date, 
                   DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at 
            FROM users 
            WHERE id_user = :id
        ");
        $userStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($user);
    } else {
        sendError('Failed to update user');
    }
    
} catch(PDOException $e) {
    error_log('Database error in update: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>