# Миграции базы данных

Все миграции созданы и готовы к использованию.

## Структура

```
migrations/
├── 001_create_users_table.sql      - Пользователи
├── 002_create_owners_table.sql    - Арендодатели
├── 003_create_boats_table.sql      - Лодки
├── 004_create_products_table.sql   - Товары
├── 005_create_bookings_table.sql   - Заказы/бронирования
├── 006_create_booking_items_table.sql - Товары в заказах
└── 007_create_payments_table.sql   - Платежи
```

## Способы применения миграций

### 1. Автоматически (Docker)

При первом запуске Docker контейнера MySQL, файл `init.sql` автоматически создаст все таблицы:

```bash
docker-compose up -d db
```

Подождите 10-20 секунд, пока MySQL полностью запустится и выполнит миграции.

### 2. Через PHP скрипт

```bash
php migrate.php
```

Этот скрипт выполнит все миграции по порядку.

### 3. Через MySQL CLI

```bash
mysql -u root -p boat_rental_system < init.sql
```

Или для Docker:

```bash
docker-compose exec db mysql -u boat_user -pboat_password boat_rental_system < init.sql
```

### 4. Через phpMyAdmin

1. Откройте phpMyAdmin (http://localhost/phpmyadmin или через Docker)
2. Выберите базу данных `boat_rental_system`
3. Перейдите на вкладку "SQL"
4. Скопируйте содержимое файла `init.sql`
5. Нажмите "Выполнить"

### 5. Отдельные миграции

Если нужно выполнить миграции по отдельности:

```bash
mysql -u root -p boat_rental_system < migrations/001_create_users_table.sql
mysql -u root -p boat_rental_system < migrations/002_create_owners_table.sql
# и т.д.
```

## Проверка

После выполнения миграций проверьте наличие всех таблиц:

```sql
SHOW TABLES;
```

Должны быть следующие таблицы:
- users
- owners
- boats
- products
- bookings
- booking_items
- payments

## Описание таблиц

### users
Пользователи системы (клиенты, арендодатели, администраторы)
- `id_user` - ID пользователя
- `name` - Имя
- `email` - Email (уникальный)
- `password` - Пароль (MD5)
- `birth_date` - Дата рождения
- `role` - Роль: 'client', 'owner', 'admin'
- `created_at` - Дата регистрации

### owners
Арендодатели (отдельная таблица для совместимости)
- `id_owner` - ID арендодателя
- `name` - Имя
- `email` - Email (уникальный)
- `password` - Пароль
- `created_at` - Дата создания

### boats
Лодки и услуги для аренды
- `id_boat` - ID лодки
- `name` - Название
- `description` - Описание
- `image_url` - URL изображения
- `available` - Доступность
- `quantity` - Количество
- `price` - Цена
- `price_discount` - Цена со скидкой
- `available_days` - Доступные дни недели
- `available_time_start` - Время начала работы
- `available_time_end` - Время окончания работы
- `owner_id` - ID арендодателя (FK)
- `created_at` - Дата создания

### products
Товары и оборудование
- `id_product` - ID товара
- `name` - Название
- `description` - Описание
- `category` - Категория
- `image_url` - URL изображения
- `available` - Доступность
- `quantity` - Количество
- `price` - Цена
- `price_discount` - Цена со скидкой
- `created_at` - Дата создания

### bookings
Заказы/бронирования
- `id_booking` - ID бронирования
- `user_id` - ID пользователя (FK)
- `boat_id` - ID лодки (FK)
- `start_time` - Время начала
- `end_time` - Время окончания
- `booking_date` - Дата бронирования
- `status` - Статус бронирования
- `amount` - Сумма заказа
- `created_at` - Дата создания

### booking_items
Товары заказа
- `id_booking_item` - ID позиции заказа
- `booking_id` - ID бронирования (FK)
- `product_id` - ID товара (FK, опционально)
- `quantity` - Количество
- `price` - Базовая цена
- `price_discount` - Цена со скидкой
- `created_at` - Дата создания

### payments
Платежи
- `id_payment` - ID платежа
- `booking_id` - ID бронирования (FK, опционально)
- `user_id` - ID пользователя (FK)
- `amount` - Сумма платежа
- `payment_method` - Способ оплаты
- `status` - Статус платежа
- `transaction_id` - ID транзакции
- `payment_date` - Дата платежа
- `created_at` - Дата создания

## Откат миграций

Для удаления всех таблиц (осторожно - удалит все данные!):

```sql
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS booking_items;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS boats;
DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS users;
```

## Решение проблем

### Ошибка: Table already exists
Это нормально, если таблицы уже созданы. Миграции используют `CREATE TABLE IF NOT EXISTS`, поэтому безопасны для повторного выполнения.

### Ошибка: Foreign key constraint fails
Убедитесь, что миграции выполняются в правильном порядке (1-7).

### Ошибка: Cannot connect to database
Проверьте настройки подключения в переменных окружения или в файлах конфигурации.
