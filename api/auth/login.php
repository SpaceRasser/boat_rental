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

if (!$data && !empty($_POST)) {
    $data = $_POST;
}

if (empty($data['email']) || empty($data['password'])) {
    sendError('Email and password are required');
}

try {
    $conn = getConnection();
    
    $email = trim($data['email']);
    $password = md5(trim($data['password']));
    
    $stmt = $conn->prepare("
        SELECT id_user, name, email, birth_date, role,
               DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at 
        FROM users 
        WHERE email = :email AND password = :password
    ");
    
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':password', $password, PDO::PARAM_STR);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Убираем пароль из ответа
        unset($user['password']);
        sendResponse($user, 200);
    } else {
        sendError('Invalid email or password', 401);
    }
    
} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    sendError('Server error: ' . $e->getMessage(), 500);
}
?>
