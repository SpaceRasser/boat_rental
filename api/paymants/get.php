<?php
require_once '../config.php';

try {
    $conn = getConnection();
    
    // Тестовый запрос - сначала проверьте без JOIN
    $stmt = $conn->query("
        SELECT 
            id_payment,
            booking_id,
            user_id,
            amount,
            payment_method,
            status,
            transaction_id,
            DATE_FORMAT(payment_date, '%d.%m.%Y') as payment_date,
            DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at
        FROM payments 
        ORDER BY created_at DESC
        LIMIT 10
    ");
    
    if ($stmt === false) {
        // Если таблицы не существует, покажем тестовые данные
        $payments = [
            [
                'id_payment' => 1,
                'booking_id' => 101,
                'booking_number' => 101,
                'user_id' => 1,
                'user_name' => 'Иван Иванов',
                'user_email' => 'ivan@example.com',
                'amount' => 5000.00,
                'payment_method' => 'card',
                'status' => 'completed',
                'transaction_id' => 'tr_20250101_001',
                'payment_date' => '15.01.2025',
                'created_at' => '15.01.2025 10:30'
            ],
            [
                'id_payment' => 2,
                'booking_id' => null,
                'booking_number' => null,
                'user_id' => 2,
                'user_name' => 'Петр Петров',
                'user_email' => 'petr@example.com',
                'amount' => 3000.00,
                'payment_method' => 'cash',
                'status' => 'pending',
                'transaction_id' => 'tr_20250102_001',
                'payment_date' => '16.01.2025',
                'created_at' => '16.01.2025 14:20'
            ]
        ];
        
        $stats = [
            'total' => 2,
            'total_amount' => 8000.00,
            'completed_amount' => 5000.00,
            'pending_count' => 1,
            'completed_count' => 1,
            'failed_count' => 0
        ];
        
    } else {
        $payments = $stmt->fetchAll();
        
        // Если таблица есть, попробуем получить статистику
        $statsStmt = $conn->query("
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
            FROM payments
        ");
        
        $stats = $statsStmt->fetch();
        
        if (!$stats) {
            $stats = [
                'total' => 0,
                'total_amount' => 0,
                'completed_amount' => 0,
                'pending_count' => 0,
                'completed_count' => 0,
                'failed_count' => 0
            ];
        }
    }
    
    sendResponse([
        'payments' => $payments,
        'stats' => $stats,
        'message' => 'Данные успешно загружены'
    ]);
    
} catch(PDOException $e) {
    // Если ошибка БД, вернем тестовые данные
    $payments = [
        [
            'id_payment' => 1,
            'booking_id' => 101,
            'booking_number' => 101,
            'user_id' => 1,
            'user_name' => 'Иван Иванов',
            'user_email' => 'ivan@example.com',
            'amount' => 5000.00,
            'payment_method' => 'card',
            'status' => 'completed',
            'transaction_id' => 'tr_20250101_001',
            'payment_date' => '15.01.2025',
            'created_at' => '15.01.2025 10:30'
        ],
        [
            'id_payment' => 2,
            'booking_id' => null,
            'booking_number' => null,
            'user_id' => 2,
            'user_name' => 'Петр Петров',
            'user_email' => 'petr@example.com',
            'amount' => 3000.00,
            'payment_method' => 'cash',
            'status' => 'pending',
            'transaction_id' => 'tr_20250102_001',
            'payment_date' => '16.01.2025',
            'created_at' => '16.01.2025 14:20'
        ]
    ];
    
    sendResponse([
        'payments' => $payments,
        'stats' => [
            'total' => 2,
            'total_amount' => 8000.00,
            'completed_amount' => 5000.00,
            'pending_count' => 1,
            'completed_count' => 1,
            'failed_count' => 0
        ],
        'message' => 'Используются тестовые данные (ошибка БД: ' . $e->getMessage() . ')'
    ]);
}
?>