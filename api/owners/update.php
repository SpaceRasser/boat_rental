<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$ownerId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($ownerId <= 0) {
    sendError('Invalid owner ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование владельца
    $checkStmt = $conn->prepare("SELECT id_owner FROM owners WHERE id_owner = ?");
    $checkStmt->execute([$ownerId]);
    
    if (!$checkStmt->fetch()) {
        sendError('Owner not found', 404);
    }
    
    // Формируем запрос обновления
    $updateParts = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updateParts[] = "name = ?";
        $params[] = $data['name'];
    }
    
    if (isset($data['email'])) {
        // Проверка email на уникальность (исключая текущего владельца)
        $emailCheck = $conn->prepare("SELECT id_owner FROM owners WHERE email = ? AND id_owner != ?");
        $emailCheck->execute([$data['email'], $ownerId]);
        
        if ($emailCheck->fetch()) {
            sendError('Email already exists');
        }
        
        $updateParts[] = "email = ?";
        $params[] = $data['email'];
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        $updateParts[] = "password = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updateParts)) {
        sendError('No fields to update');
    }
    
    // Добавляем ID в конец параметров
    $params[] = $ownerId;
    
    // Собираем SQL
    $sql = "UPDATE owners SET " . implode(', ', $updateParts) . " WHERE id_owner = ?";
    
    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute($params)) {
        // Получаем обновленного владельца
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
        
        sendResponse($owner);
    } else {
        sendError('Failed to update owner');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>