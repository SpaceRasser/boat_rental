<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$bookingId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($bookingId <= 0) {
    sendError('Invalid booking ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование бронирования
    $checkStmt = $conn->prepare("SELECT * FROM bookings WHERE id_booking = ?");
    $checkStmt->execute([$bookingId]);
    $currentBooking = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$currentBooking) {
        sendError('Booking not found', 404);
    }
    
    // Формируем запрос обновления
    $updateParts = [];
    $params = [];
    
    // Поля для обновления
    if (isset($data['user_id'])) {
        $updateParts[] = "user_id = ?";
        $params[] = intval($data['user_id']);
    }
    
    if (isset($data['owner_id'])) {
        $updateParts[] = "owner_id = ?";
        $params[] = intval($data['owner_id']);
    }
    
    if (isset($data['start_time'])) {
        $updateParts[] = "start_time = ?";
        $params[] = $data['start_time'];
    }
    
    if (isset($data['end_time'])) {
        $updateParts[] = "end_time = ?";
        $params[] = $data['end_time'];
    }
    
    if (isset($data['booking_date'])) {
        $updateParts[] = "booking_date = ?";
        $params[] = $data['booking_date'];
    }
    
    if (isset($data['status'])) {
        $updateParts[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (empty($updateParts)) {
        sendError('No fields to update');
    }
    
    // Добавляем ID в конец параметров (для WHERE)
    $params[] = $bookingId;
    
    // Собираем SQL
    $sql = "UPDATE bookings SET " . implode(', ', $updateParts) . " WHERE id_booking = ?";
    
    // Отладка
    error_log("Update SQL: $sql");
    error_log("Params count: " . count($params));
    error_log("Params: " . print_r($params, true));
    
    $stmt = $conn->prepare($sql);
    
    // Выполняем с параметрами
    if ($stmt->execute($params)) {
        // Получаем обновленное бронирование
        $selectSql = "SELECT * FROM bookings WHERE id_booking = ?";
        $selectStmt = $conn->prepare($selectSql);
        $selectStmt->execute([$bookingId]);
        $booking = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($booking);
    } else {
        $errorInfo = $stmt->errorInfo();
        sendError('Failed to update booking. SQL Error: ' . $errorInfo[2]);
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage() . '. SQL: ' . $sql, 500);
}
?>