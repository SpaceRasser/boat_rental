<?php
/**
 * Скрипт для проверки существования таблиц и применения миграций
 * Использование: php check_tables.php
 */

require_once 'api/config.php';

try {
    $conn = getConnection();
    
    echo "✓ Подключение к базе данных установлено\n\n";
    
    // Проверяем существующие таблицы
    $stmt = $conn->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Существующие таблицы:\n";
    if (empty($existingTables)) {
        echo "  (нет таблиц)\n";
    } else {
        foreach ($existingTables as $table) {
            echo "  ✓ $table\n";
        }
    }
    
    echo "\n";
    
    // Список необходимых таблиц
    $requiredTables = [
        'users',
        'owners',
        'boats',
        'products',
        'boat_orders',
        'bookings',
        'payments'
    ];
    
    $missingTables = array_diff($requiredTables, $existingTables);
    
    if (empty($missingTables)) {
        echo "✓ Все таблицы существуют!\n";
    } else {
        echo "✗ Отсутствующие таблицы:\n";
        foreach ($missingTables as $table) {
            echo "  - $table\n";
        }
        
        echo "\nПрименение миграций...\n";
        
        // Читаем и выполняем init.sql
        if (file_exists('init.sql')) {
            $sql = file_get_contents('init.sql');
            
            // Разбиваем на отдельные запросы
            $queries = array_filter(
                array_map('trim', explode(';', $sql)),
                function($query) {
                    return !empty($query) && 
                           !preg_match('/^--/', $query) &&
                           !preg_match('/^USE /i', $query) &&
                           !preg_match('/^CREATE DATABASE/i', $query);
                }
            );
            
            foreach ($queries as $query) {
                if (empty(trim($query))) continue;
                
                try {
                    $conn->exec($query);
                    // Извлекаем название таблицы из CREATE TABLE
                    if (preg_match('/CREATE TABLE.*?`?(\w+)`?/i', $query, $matches)) {
                        echo "  ✓ Создана таблица: {$matches[1]}\n";
                    }
                } catch (PDOException $e) {
                    // Игнорируем ошибки "таблица уже существует"
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        echo "  ✗ Ошибка: " . $e->getMessage() . "\n";
                    }
                }
            }
            
            echo "\n✓ Миграции применены!\n";
        } else {
            echo "✗ Файл init.sql не найден!\n";
        }
    }
    
} catch (PDOException $e) {
    echo "✗ Ошибка подключения к базе данных: " . $e->getMessage() . "\n";
    exit(1);
}
?>
