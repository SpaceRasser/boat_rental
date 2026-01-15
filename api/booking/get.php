<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    $stmt = $conn->prepare("
        SELECT 
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
        ORDER BY b.booking_date DESC, b.start_time ASC
    ");
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse([
        'bookings' => $bookings
    ]);
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>