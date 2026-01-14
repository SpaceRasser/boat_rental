<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Валидация
if (empty($data['name']) || empty($data['email'])) {
    sendError('Missing required fields: name, email');
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

try {
    $conn = getConnection();
    
    // Проверка на существующий email
    $checkStmt = $conn->prepare("SELECT id_owner FROM owners WHERE email = ?");
    $checkStmt->execute([$data['email']]);
    
    if ($checkStmt->fetch()) {
        sendError('Email already exists');
    }
    
    // Создаем владельца
    $sql = "INSERT INTO owners (name, email, password, created_at) 
            VALUES (?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    
    // Генерируем временный пароль (можно изменить позже)
    $tempPassword = password_hash('temp123', PASSWORD_DEFAULT);
    
    if ($stmt->execute([$data['name'], $data['email'], $tempPassword])) {
        $ownerId = $conn->lastInsertId();
        
        // Получаем созданного владельца
        $selectSql = "SELECT 
                        id_owner,
                        name,
                        email,
                        DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
                    FROM owners 
                    WHERE id_owner = ?";
        
        $selectStmt = $conn->prepare($selectSql);
        $selectStmt->execute([$ownerId]);
        $owner = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($owner, 201);
    } else {
        sendError('Failed to create owner');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>