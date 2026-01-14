<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    $stmt = $conn->prepare("
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
        ORDER BY id_boat DESC 
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $boats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $countStmt = $conn->query("SELECT COUNT(*) as total FROM boats");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    sendResponse([
        'boats' => $boats,
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