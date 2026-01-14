<?php
require_once '../config.php';

try {
    $conn = getConnection();

    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;

    $stmt = $conn->prepare("SELECT
            b.id_booking as id_order,
            b.id_booking,
            b.user_id,
            u.name as user_name,
            b.boat_id,
            bt.name as boat_name,
            TIME_FORMAT(b.start_time, '%H:%i') as start_time,
            TIME_FORMAT(b.end_time, '%H:%i') as end_time,
            DATE_FORMAT(b.booking_date, '%d.%m.%Y') as booking_date,
            b.status,
            b.amount,
            DATE_FORMAT(b.created_at, '%d.%m.%Y %H:%i') as created_at
        FROM bookings b
        LEFT JOIN boats bt ON b.boat_id = bt.id_boat
        LEFT JOIN users u ON b.user_id = u.id_user
        ORDER BY b.id_booking DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $orderIds = array_column($orders, 'id_booking');
    $itemsByBooking = [];

    if (!empty($orderIds)) {
        $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
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
        $itemsStmt->execute($orderIds);
        foreach ($itemsStmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $bookingId = $item['booking_id'];
            if (!isset($itemsByBooking[$bookingId])) {
                $itemsByBooking[$bookingId] = [];
            }
            $itemsByBooking[$bookingId][] = $item;
        }
    }

    foreach ($orders as &$order) {
        $order['items'] = $itemsByBooking[$order['id_booking']] ?? [];
    }
    unset($order);

    $countStmt = $conn->query("SELECT COUNT(*) as total FROM bookings");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    sendResponse([
        'orders' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
