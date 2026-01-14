<?php
require_once '../config.php';

try {
    $conn = getConnection();

    $stmt = $conn->prepare("SELECT
            b.id_booking,
            b.user_id,
            u.name as user_name,
            u.email as user_email,
            b.boat_id,
            bt.name as boat_name,
            bt.owner_id,
            o.name as owner_name,
            o.email as owner_email,
            TIME_FORMAT(b.start_time, '%H:%i') as start_time,
            TIME_FORMAT(b.end_time, '%H:%i') as end_time,
            DATE_FORMAT(b.booking_date, '%d.%m.%Y') as booking_date,
            b.status,
            b.amount,
            DATE_FORMAT(b.created_at, '%d.%m.%Y %H:%i') as created_at
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id_user
        LEFT JOIN boats bt ON b.boat_id = bt.id_boat
        LEFT JOIN owners o ON bt.owner_id = o.id_owner
        ORDER BY b.booking_date DESC, b.start_time ASC
    ");
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $bookingIds = array_column($bookings, 'id_booking');
    $itemsByBooking = [];

    if (!empty($bookingIds)) {
        $placeholders = implode(',', array_fill(0, count($bookingIds), '?'));
        $itemsStmt = $conn->prepare("SELECT
                bi.id_booking_item,
                bi.booking_id,
                bi.product_id,
                p.name as product_name,
                bi.quantity,
                bi.price,
                bi.price_discount
            FROM booking_items bi
            LEFT JOIN products p ON bi.product_id = p.id_product
            WHERE bi.booking_id IN ($placeholders)
        ");
        $itemsStmt->execute($bookingIds);

        foreach ($itemsStmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $bookingId = $item['booking_id'];
            if (!isset($itemsByBooking[$bookingId])) {
                $itemsByBooking[$bookingId] = [];
            }
            $itemsByBooking[$bookingId][] = $item;
        }
    }

    foreach ($bookings as &$booking) {
        $booking['items'] = $itemsByBooking[$booking['id_booking']] ?? [];
    }
    unset($booking);

    sendResponse([
        'bookings' => $bookings
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
