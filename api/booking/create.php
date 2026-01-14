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

// Логируем входящие данные для отладки
error_log('Received data: ' . print_r($data, true));

// Валидация
$required = ['user_id', 'owner_id', 'start_time', 'end_time', 'booking_date'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        sendError("Missing required field: $field");
    }
}

try {
    $conn = getConnection();
    
    // Подготовка данных
    $user_id = intval($data['user_id']);
    $owner_id = intval($data['owner_id']);
    $start_time = $data['start_time'];
    $end_time = $data['end_time'];
    $booking_date = $data['booking_date'];
    $status = isset($data['status']) ? $data['status'] : 'бронь';
    
    // Проверка доступности времени
    $checkSql = "SELECT id_booking FROM bookings 
                 WHERE owner_id = ? 
                 AND booking_date = ?
                 AND status NOT IN ('отменена', 'завершена')
                 AND (
                    (? BETWEEN start_time AND end_time) OR
                    (? BETWEEN start_time AND end_time) OR
                    (start_time BETWEEN ? AND ?)
                 )";
    
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$owner_id, $booking_date, $start_time, $end_time, $start_time, $end_time]);
    
    if ($checkStmt->fetch()) {
        sendError('Это время уже занято');
    }
    
    // Создаем бронирование (ВАЖНО: 7 параметров в VALUES)
    $sql = "INSERT INTO bookings 
            (user_id, owner_id, start_time, end_time, booking_date, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    
    // 6 параметров (7-й - NOW() в SQL)
    $success = $stmt->execute([$user_id, $owner_id, $start_time, $end_time, $booking_date, $status]);
    
    if ($success) {
        $bookingId = $conn->lastInsertId();
        
        // Получаем созданное бронирование с именами
        $selectSql = "SELECT 
                        b.id_booking,
                        b.user_id,
                        u.name as user_name,
                        u.email as user_email,
                        b.owner_id,
                        o.name as owner_name,
                        o.email as owner_email,
                        TIME_FORMAT(b.start_time, '%H:%i') as start_time,
                        TIME_FORMAT(b.end_time, '%H:%i') as end_time,
                        DATE_FORMAT(b.booking_date, '%d.%m.%Y') as booking_date,
                        b.status,
                        DATE_FORMAT(b.created_at, '%d.%m.%Y %H:%i') as created_at
                    FROM bookings b
                    LEFT JOIN users u ON b.user_id = u.id_user
                    LEFT JOIN owners o ON b.owner_id = o.id_owner
                    WHERE b.id_booking = ?";
        
        $selectStmt = $conn->prepare($selectSql);
        $selectStmt->execute([$bookingId]);
        $booking = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($booking, 201);
    } else {
        $errorInfo = $stmt->errorInfo();
        sendError('Failed to create booking. Error: ' . $errorInfo[2]);
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>