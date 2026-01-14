# Быстрое решение проблем

## Проблема 1: Ошибка компиляции в PaymantsManager.js

Файл уже исправлен. Если ошибка все еще появляется:

1. **Остановите dev server** (Ctrl+C)
2. **Очистите кэш:**
   ```bash
   cd react-admin
   rm -rf node_modules/.cache
   ```
3. **Перезапустите:**
   ```bash
   npm start
   ```

Или просто перезапустите dev server - часто помогает.

## Проблема 2: Не получается добавить услугу (таблица boats не существует)

### Решение для Docker:

1. **Проверьте, что контейнеры запущены:**
   ```bash
   docker-compose ps
   ```

2. **Проверьте логи MySQL:**
   ```bash
   docker-compose logs db | grep -i "init\|error\|table"
   ```

3. **Если таблицы не созданы, выполните миграции вручную:**

   **Вариант A: Через PHP скрипт**
   ```bash
   php check_tables.php
   ```
   или
   ```bash
   php migrate.php
   ```

   **Вариант B: Через Docker exec**
   ```bash
   docker-compose exec db mysql -u boat_user -pboat_password boat_rental_system < init.sql
   ```

   **Вариант C: Пересоздать базу данных**
   ```bash
   docker-compose down -v
   docker-compose up -d db
   ```
   Подождите 20-30 секунд, пока MySQL полностью запустится и выполнит init.sql

4. **Проверьте наличие таблиц:**
   ```bash
   docker-compose exec db mysql -u boat_user -pboat_password boat_rental_system -e "SHOW TABLES;"
   ```

### Решение для локального XAMPP:

1. **Откройте phpMyAdmin** (http://localhost/phpmyadmin)

2. **Выберите базу данных** `boat_rental_system`

3. **Перейдите на вкладку "SQL"**

4. **Скопируйте и выполните содержимое файла `init.sql`**

5. **Или выполните через командную строку:**
   ```bash
   mysql -u root -p boat_rental_system < init.sql
   ```

## Проверка после исправления

После применения миграций проверьте:

1. **Все таблицы созданы:**
   - users
   - owners
   - boats
   - products
   - bookings
   - booking_items
   - payments

2. **Попробуйте добавить услугу снова** - должно работать!

3. **Если все еще не работает**, проверьте логи PHP:
   ```bash
   docker-compose logs php | tail -20
   ```

## Быстрая проверка через браузер

Откройте: http://localhost:8080/index.php (или http://localhost/boat_rental/index.php)

Там должна отображаться информация о всех таблицах базы данных.
