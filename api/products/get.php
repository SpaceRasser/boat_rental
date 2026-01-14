<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    // Проверяем, есть ли поле category в таблице
    $checkStmt = $conn->query("SHOW COLUMNS FROM products LIKE 'category'");
    $hasCategory = $checkStmt->rowCount() > 0;
    
    if ($hasCategory) {
        $sql = "
            SELECT 
                id_product,
                name,
                description,
                category,
                image_url,
                available,
                quantity,
                price,
                price_discount,
                DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
            FROM products 
            ORDER BY id_product DESC 
            LIMIT :limit OFFSET :offset
        ";
    } else {
        // Если нет поля category, используем старую структуру
        $sql = "
            SELECT 
                id_product,
                name,
                description,
                '' as category,  -- Пустая строка вместо категории
                image_url,
                available,
                quantity,
                price,
                price_discount,
                DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
            FROM products 
            ORDER BY id_product DESC 
            LIMIT :limit OFFSET :offset
        ";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $countStmt = $conn->query("SELECT COUNT(*) as total FROM products");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    sendResponse([
        'products' => $products,
        'has_category' => $hasCategory,
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