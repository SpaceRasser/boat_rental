<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    // Получаем параметры пагинации
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    // Получаем пользователей
    $stmt = $conn->prepare("
        SELECT id_user, name, email, birth_date, role,
               DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at 
        FROM users 
        ORDER BY id_user DESC 
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Получаем общее количество
    $countStmt = $conn->query("SELECT COUNT(*) as total FROM users");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    sendResponse([
        'users' => $users,
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