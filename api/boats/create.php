<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (empty($data['name']) || empty($data['price'])) {
    sendError('Missing required fields: name, price');
}

try {
    $conn = getConnection();
    
    // Подготавливаем данные
    $name = trim($data['name']);
    $description = isset($data['description']) ? trim($data['description']) : null;
    $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;
    $available = isset($data['available']) ? (bool)$data['available'] : true;
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
    $price = floatval($data['price']);
    $price_discount = isset($data['price_discount']) ? floatval($data['price_discount']) : null;
    $available_days = isset($data['available_days']) ? trim($data['available_days']) : 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье';
    $available_time_start = isset($data['available_time_start']) ? trim($data['available_time_start']) : '09:00';
    $available_time_end = isset($data['available_time_end']) ? trim($data['available_time_end']) : '18:00';
    
    // Определяем owner_id
    $owner_id = null;
    
    // Если owner_id передан напрямую
    if (!empty($data['owner_id'])) {
        $ownerId = intval($data['owner_id']);
        $checkOwner = $conn->prepare("SELECT id_owner FROM owners WHERE id_owner = ?");
        $checkOwner->execute([$ownerId]);
        if ($checkOwner->fetch()) {
            $owner_id = $ownerId;
        }
    }
    // Если передан email пользователя, ищем или создаем владельца
    elseif (!empty($data['user_email'])) {
        $userEmail = trim($data['user_email']);
        
        // Ищем владельца по email
        $findOwner = $conn->prepare("SELECT id_owner FROM owners WHERE email = ?");
        $findOwner->execute([$userEmail]);
        $owner = $findOwner->fetch(PDO::FETCH_ASSOC);
        
        if ($owner) {
            $owner_id = $owner['id_owner'];
        } else {
            // Если владельца нет, создаем его (если передан user_name)
            if (!empty($data['user_name'])) {
                $userName = trim($data['user_name']);
                // Создаем владельца с тем же email и именем
                $createOwner = $conn->prepare("INSERT INTO owners (name, email, password) VALUES (?, ?, ?)");
                // Используем временный пароль (можно будет изменить позже)
                $tempPassword = password_hash('temp_' . time(), PASSWORD_DEFAULT);
                if ($createOwner->execute([$userName, $userEmail, $tempPassword])) {
                    $owner_id = $conn->lastInsertId();
                }
            }
        }
    }
    
    $stmt = $conn->prepare("
        INSERT INTO boats (
            name, description, image_url, available, 
            quantity, price, price_discount, available_days,
            available_time_start, available_time_end, owner_id
        ) VALUES (
            :name, :description, :image_url, :available,
            :quantity, :price, :price_discount, :available_days,
            :available_time_start, :available_time_end, :owner_id
        )
    ");
    
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
    $stmt->bindParam(':image_url', $image_url, PDO::PARAM_STR);
    $stmt->bindParam(':available', $available, PDO::PARAM_BOOL);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':price_discount', $price_discount);
    $stmt->bindParam(':available_days', $available_days, PDO::PARAM_STR);
    $stmt->bindParam(':available_time_start', $available_time_start, PDO::PARAM_STR);
    $stmt->bindParam(':available_time_end', $available_time_end, PDO::PARAM_STR);
    $stmt->bindParam(':owner_id', $owner_id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        $boatId = $conn->lastInsertId();
        
        $boatStmt = $conn->prepare("
            SELECT 
                id_boat, name, description, image_url, available, quantity,
                price, price_discount, available_days, owner_id,
                TIME_FORMAT(available_time_start, '%H:%i') as available_time_start,
                TIME_FORMAT(available_time_end, '%H:%i') as available_time_end,
                DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
            FROM boats 
            WHERE id_boat = :id
        ");
        $boatStmt->bindParam(':id', $boatId, PDO::PARAM_INT);
        $boatStmt->execute();
        $boat = $boatStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($boat, 201);
    } else {
        sendError('Failed to create boat');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
