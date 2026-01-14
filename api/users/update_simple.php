<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Принимаем POST для обновления (проще для тестирования)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST']);
    exit();
}

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);

// Проверяем ID
if (empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit();
}

// Проверяем обязательные поля
if (empty($data['name']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and email are required']);
    exit();
}

try {
    // Подключение к базе
    require_once '../config.php';
    $conn = getConnection();
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $userId = intval($data['id']);
    
    // Проверяем существование пользователя
    $check = $conn->prepare("SELECT id_user FROM users WHERE id_user = ?");
    $check->execute([$userId]);
    
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit();
    }
    
    // Проверяем email
    $emailCheck = $conn->prepare("SELECT id_user FROM users WHERE email = ? AND id_user != ?");
    $emailCheck->execute([trim($data['email']), $userId]);
    
    if ($emailCheck->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Email already in use']);
        exit();
    }
    
    // Подготавливаем данные для обновления
    $name = trim($data['name']);
    $email = trim($data['email']);
    $birth_date = !empty($data['birth_date']) ? trim($data['birth_date']) : null;
    $role = !empty($data['role']) ? trim($data['role']) : null;
    
    // Формируем SQL запрос
    $sql = "UPDATE users SET name = ?, email = ?, birth_date = ?";
    $params = [$name, $email, $birth_date];
    
    // Если есть роль, обновляем её
    if ($role) {
        $allowedRoles = ['client', 'owner', 'admin'];
        if (in_array($role, $allowedRoles)) {
            $sql .= ", role = ?";
            $params[] = $role;
        }
    }
    
    // Если есть новый пароль
    if (!empty($data['password'])) {
        $sql .= ", password = ?";
        $params[] = md5(trim($data['password']));
    }
    
    $sql .= " WHERE id_user = ?";
    $params[] = $userId;
    
    // Выполняем обновление
    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute($params)) {
        // Получаем обновленного пользователя
        $getUser = $conn->prepare("SELECT * FROM users WHERE id_user = ?");
        $getUser->execute([$userId]);
        $user = $getUser->fetch(PDO::FETCH_ASSOC);
        
        // Форматируем дату
        if ($user['created_at']) {
            $date = new DateTime($user['created_at']);
            $user['created_at'] = $date->format('d.m.Y H:i');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update user']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>