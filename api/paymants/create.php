<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Валидация
if (empty($data['amount']) || empty($data['user_id'])) {
    sendError('Missing required fields: amount, user_id', 400);
}

if (!is_numeric($data['amount']) || floatval($data['amount']) <= 0) {
    sendError('Amount must be a positive number', 400);
}

try {
    $conn = getConnection();
    
    // Проверка пользователя
    $userStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = ?");
    $userStmt->execute([$data['user_id']]);
    if (!$userStmt->fetch()) {
        sendError('User not found', 404);
    }
    
    // Проверка бронирования (если указано)
    if (!empty($data['booking_id'])) {
        $bookingStmt = $conn->prepare("SELECT id_booking FROM bookings WHERE id_booking = ?");
        $bookingStmt->execute([$data['booking_id']]);
        if (!$bookingStmt->fetch()) {
            sendError('Booking not found', 404);
        }
    }
    
    // Подготавливаем данные для вставки
    $booking_id = !empty($data['booking_id']) ? intval($data['booking_id']) : null;
    $user_id = intval($data['user_id']);
    $amount = floatval($data['amount']);
    $payment_method = isset($data['payment_method']) ? $data['payment_method'] : 'card';
    $status = isset($data['status']) ? $data['status'] : 'pending';
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    $payment_date = isset($data['payment_date']) ? $data['payment_date'] : date('Y-m-d');
    
    // Вставляем платеж
    $stmt = $conn->prepare("
        INSERT INTO payments 
        (booking_id, user_id, amount, payment_method, status, transaction_id, payment_date, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    if ($stmt->execute([$booking_id, $user_id, $amount, $payment_method, $status, $transaction_id, $payment_date])) {
        $paymentId = $conn->lastInsertId();
        
        // Получаем созданный платеж с полной информацией
        $selectStmt = $conn->prepare("
            SELECT 
                p.id_payment,
                p.booking_id,
                b.id_booking as booking_number,
                p.user_id,
                u.name as user_name,
                u.email as user_email,
                p.amount,
                p.payment_method,
                p.status,
                p.transaction_id,
                DATE_FORMAT(p.payment_date, '%d.%m.%Y') as payment_date,
                DATE_FORMAT(p.created_at, '%d.%m.%Y %H:%i') as created_at
            FROM payments p
            LEFT JOIN bookings b ON p.booking_id = b.id_booking
            LEFT JOIN users u ON p.user_id = u.id_user
            WHERE p.id_payment = ?
        ");
        
        $selectStmt->execute([$paymentId]);
        $payment = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($payment, 201);
    } else {
        sendError('Failed to create payment', 500);
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>