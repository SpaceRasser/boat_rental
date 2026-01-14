<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM - Аренда лодок</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .header {
            background: linear-gradient(90deg, #0066cc 0%, #0099ff 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .status-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 5px solid #0066cc;
        }
        
        .success {
            color: #155724;
            background: #d4edda;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .error {
            color: #721c24;
            background: #f8d7da;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .tables-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .table-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .table-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .table-card h3 {
            color: #0066cc;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .table-card ul {
            list-style: none;
            padding-left: 0;
        }
        
        .table-card li {
            padding: 8px 0;
            border-bottom: 1px dashed #eee;
            display: flex;
            justify-content: space-between;
        }
        
        .table-card li:last-child {
            border-bottom: none;
        }
        
        .count {
            background: #0066cc;
            color: white;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 14px;
        }
        
        .buttons {
            display: flex;
            gap: 15px;
            margin-top: 40px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
            font-weight: bold;
        }
        
        .btn-primary {
            background: #0066cc;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0052a3;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
            transform: translateY(-2px);
        }
        
        .steps {
            background: #fff3cd;
            border-radius: 10px;
            padding: 25px;
            margin-top: 40px;
            border-left: 5px solid #ffc107;
        }
        
        .steps h3 {
            color: #856404;
            margin-bottom: 15px;
        }
        
        .steps ol {
            padding-left: 20px;
            line-height: 1.8;
        }
        
        .icon {
            font-size: 20px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CRM Аренды Лодок</h1>
            <p>Панель администратора - Управление заказами, лодками и пользователями</p>
        </div>
        
        <div class="content">
            <div class="status-card">
                <?php
                // Проверяем подключение к базе данных
                try {
                    // Используем переменные окружения из Docker или значения по умолчанию
                    $host = getenv('DB_HOST') ?: 'localhost';
                    $dbname = getenv('DB_NAME') ?: 'boat_rental_system';
                    $username = getenv('DB_USER') ?: 'root';
                    $password = getenv('DB_PASSWORD') ?: '';
                    
                    // Принудительно используем TCP соединение вместо socket
                    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
                    if ($host === 'localhost' || $host === '127.0.0.1') {
                        // Для локального подключения можно использовать socket
                        $pdo = new PDO($dsn, $username, $password);
                    } else {
                        // Для Docker используем TCP с указанием порта
                        $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8";
                        $pdo = new PDO($dsn, $username, $password);
                    }
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
                    // Получаем список таблиц
                    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
                    
                    echo '<h3 style="margin-top: 25px;">📊 Структура базы данных:</h3>';
                    echo '<div class="tables-grid">';
                    
                    // Описания таблиц
                    $tableDescriptions = [
                        'boats' => 'Лодки и катера для аренды',
                        'products' => 'Дополнительные товары',
                        'users' => 'Клиенты системы',
                        'owners' => 'Арендодатели',
                        'bookings' => 'Заказы/бронирования лодок',
                        'booking_items' => 'Товары в заказах',
                        'payments' => 'Оплаты'
                    ];
                    
                    foreach ($tables as $table) {
                        $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                        $description = $tableDescriptions[$table] ?? 'Таблица системы';
                        
                        echo '<div class="table-card">';
                        echo '<h3>' . ucfirst($table) . '</h3>';
                        echo '<p style="color: #666; margin-bottom: 15px;">' . $description . '</p>';
                        echo '<ul>';
                        
                        // Получаем несколько записей для примера
                        $query = $pdo->query("SELECT * FROM $table LIMIT 3");
                        $rows = $query->fetchAll(PDO::FETCH_ASSOC);
                        
                        if (count($rows) > 0) {
                            foreach ($rows as $row) {
                                // Берем первое поле для отображения
                                $firstValue = reset($row);
                                $firstKey = key($row);
                                
                                if ($firstKey === 'name' || $firstKey === 'email') {
                                    echo '<li><span style="color: #333;">' . substr($firstValue, 0, 30) . '...</span></li>';
                                }
                            }
                        } else {
                            echo '<li style="color: #999;">Нет записей</li>';
                        }
                        
                        echo '<li style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #eee;">';
                        echo '<span style="color: #666;">Всего записей:</span>';
                        echo '<span class="count">' . $count . '</span>';
                        echo '</li>';
                        echo '</ul>';
                        echo '</div>';
                    }
                    
                    echo '</div>';
                    
                } catch(PDOException $e) {
                    echo '<div class="error">';
                    echo '<strong>❌ Ошибка подключения к базе данных</strong><br>';
                    echo 'Сообщение: ' . $e->getMessage() . '<br><br>';
                    echo '<strong>Как исправить:</strong>';
                    echo '<ol>';
                    echo '<li>Убедитесь, что XAMPP запущен (Apache и MySQL - зелёные)</li>';
                    echo '<li>Проверьте, что база данных <code>boat_rental_system</code> создана</li>';
                    echo '<li>Проверьте логин/пароль в файле index.php</li>';
                    echo '</ol>';
                    echo '</div>';
                }
                ?>
            </div>
            
            <div class="buttons">
                <a href="http://localhost/phpmyadmin" target="_blank" class="btn btn-primary">
                    📊 Открыть phpMyAdmin
                </a>
                <button onclick="location.reload()" class="btn btn-secondary">
                    🔄 Обновить страницу
                </button>
                <a href="#api" class="btn btn-primary">
                    📡 Перейти к API
                </a>
            </div>
            
        </div>
    </div>
    
    <script>
        // Простой скрипт для плавной прокрутки
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>
