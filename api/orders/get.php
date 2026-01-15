<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    $stmt = $conn->prepare("
        SELECT 
            o.id_order,
            o.boat_id,
            b.name as boat_name,
            o.product_id,
            p.name as product_name,
            o.status,
            o.available,
            o.available_days,
            TIME_FORMAT(o.available_time_start, '%H:%i') as available_time_start,
            TIME_FORMAT(o.available_time_end, '%H:%i') as available_time_end,
            o.quantity,
            o.price,
            o.price_discount,
            DATE_FORMAT(o.created_at, '%d.%m.%Y %H:%i') as created_at
        FROM boat_orders o
        LEFT JOIN boats b ON o.boat_id = b.id_boat
        LEFT JOIN products p ON o.product_id = p.id_product
        ORDER BY o.id_order DESC 
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $countStmt = $conn->query("SELECT COUNT(*) as total FROM boat_orders");
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