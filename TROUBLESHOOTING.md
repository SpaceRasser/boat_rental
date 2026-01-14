# Решение проблем подключения к базе данных

## Ошибка: SQLSTATE[HY000] [2002] No such file or directory

Эта ошибка возникает когда PHP не может подключиться к MySQL. Вот как её исправить:

### Если используете Docker:

1. **Проверьте, что контейнеры запущены:**
   ```bash
   docker-compose ps
   ```
   
   Все сервисы должны быть в статусе "Up"

2. **Проверьте логи MySQL:**
   ```bash
   docker-compose logs db
   ```
   
   Убедитесь, что MySQL успешно запустился

3. **Проверьте, что PHP контейнер видит MySQL:**
   ```bash
   docker-compose exec php ping db
   ```
   
   Должен быть ответ от контейнера db

4. **Перезапустите контейнеры:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **Проверьте переменные окружения в PHP контейнере:**
   ```bash
   docker-compose exec php env | grep DB
   ```
   
   Должны быть:
   - DB_HOST=db
   - DB_NAME=boat_rental_system
   - DB_USER=boat_user
   - DB_PASSWORD=boat_password

### Если используете локальный XAMPP:

1. **Убедитесь, что MySQL запущен** в панели управления XAMPP

2. **Проверьте настройки в `api/config.php`:**
   ```php
   $host = 'localhost';  // или '127.0.0.1'
   $dbname = 'boat_rental_system';
   $username = 'root';
   $password = '';  // обычно пустой для XAMPP
   ```

3. **Создайте базу данных:**
   ```sql
   CREATE DATABASE boat_rental_system;
   ```

4. **Выполните SQL скрипт** из файла `init.sql` для создания таблиц

### Альтернативное решение для Docker:

Если проблема сохраняется, попробуйте использовать IP адрес вместо имени хоста:

1. Найдите IP адрес контейнера MySQL:
   ```bash
   docker inspect boat_rental_db | grep IPAddress
   ```

2. Временно измените в `docker-compose.yml`:
   ```yaml
   environment:
     - DB_HOST=172.17.0.2  # замените на реальный IP
   ```

### Проверка подключения вручную:

Выполните в PHP контейнере:
```bash
docker-compose exec php php -r "
try {
    \$pdo = new PDO('mysql:host=db;port=3306;dbname=boat_rental_system', 'boat_user', 'boat_password');
    echo 'Подключение успешно!';
} catch(PDOException \$e) {
    echo 'Ошибка: ' . \$e->getMessage();
}
"
```

### Частые причины ошибки:

1. **MySQL контейнер еще не готов** - подождите 10-20 секунд после запуска
2. **Неправильное имя хоста** - в Docker должно быть `db`, не `localhost`
3. **Проблемы с сетью Docker** - пересоздайте сеть: `docker network prune`
4. **Порт занят** - проверьте, не запущен ли локальный MySQL на порту 3306
