<?php
require_once '../config.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$paymentId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($paymentId <= 0) {
    sendError('Invalid payment ID', 400);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $conn = getConnection();
    
    // Проверяем существование платежа
    $checkStmt = $conn->prepare("SELECT id_payment FROM payments WHERE id_payment = ?");
    $checkStmt->execute([$paymentId]);
    
    if (!$checkStmt->fetch()) {
        sendError('Payment not found', 404);
    }
    
    // Формируем запрос обновления
    $updateParts = [];
    $params = [];
    
    // Разрешенные поля для обновления
    $allowedFields = ['booking_id', 'user_id', 'amount', 'payment_method', 'status', 'transaction_id', 'payment_date'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateParts[] = "$field = ?";
            
            if ($field === 'amount') {
                $params[] = floatval($data[$field]);
            } elseif (in_array($field, ['booking_id', 'user_id'])) {
                $params[] = !empty($data[$field]) ? intval($data[$field]) : null;
            } else {
                $params[] = $data[$field];
            }
        }
    }
    
    if (empty($updateParts)) {
        sendError('No fields to update', 400);
    }
    
    // Добавляем ID в параметры
    $params[] = $paymentId;
    
    // Выполняем обновление
    $sql = "UPDATE payments SET " . implode(', ', $updateParts) . " WHERE id_payment = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute($params)) {
        // Получаем обновленный платеж
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
        
        sendResponse($payment);
    } else {
        sendError('Failed to update payment', 500);
    }
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>