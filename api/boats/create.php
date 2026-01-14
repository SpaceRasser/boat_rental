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
    
    // owner_id - опционально, только если передан и существует в таблице owners
    $owner_id = null;
    if (!empty($data['owner_id'])) {
        $ownerId = intval($data['owner_id']);
        $checkOwner = $conn->prepare("SELECT id_owner FROM owners WHERE id_owner = ?");
        $checkOwner->execute([$ownerId]);
        if ($checkOwner->fetch()) {
            $owner_id = $ownerId;
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
                price, price_discount, available_days,
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
