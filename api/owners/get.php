<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    $stmt = $conn->prepare("
        SELECT 
            id_owner,
            name,
            email,
            DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
        FROM owners
        ORDER BY name
    ");
    $stmt->execute();
    $owners = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse($owners);
    
} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>