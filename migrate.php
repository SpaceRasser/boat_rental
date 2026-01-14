<?php
/**
 * Скрипт для выполнения миграций базы данных
 * Использование: php migrate.php
 */

// Настройки подключения к БД
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'boat_rental_system';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

// Для Docker используем TCP соединение
if ($host !== 'localhost' && $host !== '127.0.0.1') {
    $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4";
} else {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
}

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✓ Подключение к базе данных установлено\n";
    
    // Список миграций в порядке выполнения
    $migrations = [
        'migrations/001_create_users_table.sql',
        'migrations/002_create_owners_table.sql',
        'migrations/003_create_boats_table.sql',
        'migrations/004_create_products_table.sql',
        'migrations/005_create_bookings_table.sql',
        'migrations/006_create_booking_items_table.sql',
        'migrations/007_create_payments_table.sql'
    ];
    
    foreach ($migrations as $migration) {
        if (!file_exists($migration)) {
            echo "✗ Файл миграции не найден: $migration\n";
            continue;
        }
        
        $sql = file_get_contents($migration);
        
        // Удаляем комментарии и пустые строки для чистоты
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/^\s*$/m', '', $sql);
        
        try {
            $pdo->exec($sql);
            echo "✓ Выполнена миграция: " . basename($migration) . "\n";
        } catch (PDOException $e) {
            // Игнорируем ошибки "таблица уже существует"
            if (strpos($e->getMessage(), 'already exists') !== false) {
                echo "⊘ Таблица уже существует: " . basename($migration) . "\n";
            } else {
                echo "✗ Ошибка при выполнении миграции " . basename($migration) . ": " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✓ Все миграции выполнены!\n";
    
    // Проверяем созданные таблицы
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "\nСозданные таблицы:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Ошибка подключения к базе данных: " . $e->getMessage() . "\n";
    echo "\nПроверьте настройки подключения:\n";
    echo "  DB_HOST: $host\n";
    echo "  DB_NAME: $dbname\n";
    echo "  DB_USER: $username\n";
    exit(1);
}
?>
