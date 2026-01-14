<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$boatId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($boatId <= 0) {
    sendError('Invalid boat ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование лодки
    $checkStmt = $conn->prepare("SELECT id_boat FROM boats WHERE id_boat = :id");
    $checkStmt->bindParam(':id', $boatId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        sendError('Boat not found', 404);
    }
    
    // Формируем запрос обновления
    $updateFields = [];
    $params = [':id' => $boatId];
    
    $fields = [
        'name' => PDO::PARAM_STR,
        'description' => PDO::PARAM_STR,
        'image_url' => PDO::PARAM_STR,
        'available' => PDO::PARAM_BOOL,
        'quantity' => PDO::PARAM_INT,
        'price' => null,
        'price_discount' => null,
        'available_days' => PDO::PARAM_STR,
        'available_time_start' => PDO::PARAM_STR,
        'available_time_end' => PDO::PARAM_STR
    ];
    
    foreach ($fields as $field => $type) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update');
    }
    
    // Выполняем обновление
    $sql = "UPDATE boats SET " . implode(', ', $updateFields) . " WHERE id_boat = :id";
    $stmt = $conn->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($value === null) {
            $stmt->bindValue($key, null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        // Получаем обновленную лодку
        $boatStmt = $conn->prepare("
            SELECT 
                id_boat,
                name,
                description,
                image_url,
                available,
                quantity,
                price,
                price_discount,
                available_days,
                TIME_FORMAT(available_time_start, '%H:%i') as available_time_start,
                TIME_FORMAT(available_time_end, '%H:%i') as available_time_end,
                DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
            FROM boats 
            WHERE id_boat = :id
        ");
        $boatStmt->bindParam(':id', $boatId, PDO::PARAM_INT);
        $boatStmt->execute();
        $boat = $boatStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($boat);
    } else {
        sendError('Failed to update boat');
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>