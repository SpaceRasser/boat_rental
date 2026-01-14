<?php
require_once '../config.php';

// Разрешаем все методы
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Получаем JSON данные
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Если не получили JSON, пробуем получить из POST
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

// Валидация данных
if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    sendError('Missing required fields: name, email, password');
}

try {
    $conn = getConnection();
    
    // Проверяем, нет ли пользователя с таким email
    $checkStmt = $conn->prepare("SELECT id_user FROM users WHERE email = :email");
    $email = trim($data['email']);
    $checkStmt->bindParam(':email', $email, PDO::PARAM_STR);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendError('User with this email already exists');
    }
    
    // Валидация роли
    $allowedRoles = ['client', 'owner', 'admin'];
    $role = !empty($data['role']) && in_array($data['role'], $allowedRoles) 
        ? $data['role'] 
        : 'client';
    
    // Если роль - клиент, дата рождения обязательна
    if ($role === 'client' && empty($data['birth_date'])) {
        sendError('Birth date is required for clients');
    }
    
    // Создаём пользователя
    $stmt = $conn->prepare("
        INSERT INTO users (name, email, password, birth_date, role) 
        VALUES (:name, :email, :password, :birth_date, :role)
    ");
    
    // Подготавливаем данные
    $name = trim($data['name']);
    $password = md5(trim($data['password'])); // Временное решение
    $birth_date = !empty($data['birth_date']) ? trim($data['birth_date']) : null;
    
    // Биндим параметры с указанием типа
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':password', $password, PDO::PARAM_STR);
    $stmt->bindParam(':role', $role, PDO::PARAM_STR);
    
    if ($birth_date) {
        $stmt->bindParam(':birth_date', $birth_date, PDO::PARAM_STR);
    } else {
        $stmt->bindValue(':birth_date', null, PDO::PARAM_NULL);
    }
    
    if ($stmt->execute()) {
        $userId = $conn->lastInsertId();
        
        // Получаем созданного пользователя
        $userStmt = $conn->prepare("
            SELECT id_user, name, email, birth_date, role,
                   DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at 
            FROM users 
            WHERE id_user = :id
        ");
        $userStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($user, 201);
    } else {
        sendError('Failed to create user');
    }
    
} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    sendError('Server error: ' . $e->getMessage(), 500);
}
?>