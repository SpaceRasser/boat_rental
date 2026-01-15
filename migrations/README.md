# Миграции базы данных

Этот каталог содержит SQL миграции для создания всех таблиц базы данных.

## Структура миграций

- `001_create_users_table.sql` - Таблица пользователей (клиенты, арендодатели, администраторы)
- `002_create_owners_table.sql` - Таблица арендодателей (отдельная таблица для совместимости)
- `003_create_boats_table.sql` - Таблица лодок/услуг
- `004_create_products_table.sql` - Таблица товаров/оборудования
- `005_create_boat_orders_table.sql` - Таблица заказов лодок
- `006_create_bookings_table.sql` - Таблица бронирований
- `007_create_payments_table.sql` - Таблица платежей

## Выполнение миграций

### Вариант 1: Автоматическое выполнение (Docker)

При первом запуске Docker контейнера MySQL, файл `init.sql` автоматически выполнит все миграции.

```bash
docker-compose up -d db
```

### Вариант 2: Ручное выполнение через MySQL

```bash
mysql -u root -p boat_rental_system < init.sql
```

### Вариант 3: Выполнение отдельных миграций

```bash
mysql -u root -p boat_rental_system < migrations/001_create_users_table.sql
mysql -u root -p boat_rental_system < migrations/002_create_owners_table.sql
# и т.д.
```

### Вариант 4: Через phpMyAdmin

1. Откройте phpMyAdmin
2. Выберите базу данных `boat_rental_system`
3. Перейдите на вкладку "SQL"
4. Скопируйте содержимое нужного файла миграции
5. Нажмите "Выполнить"

## Порядок выполнения

Миграции должны выполняться в следующем порядке из-за внешних ключей:

1. `001_create_users_table.sql` - базовая таблица пользователей
2. `002_create_owners_table.sql` - таблица арендодателей
3. `003_create_boats_table.sql` - ссылается на owners
4. `004_create_products_table.sql` - независимая таблица
5. `005_create_boat_orders_table.sql` - ссылается на boats и products
6. `006_create_bookings_table.sql` - ссылается на users и owners
7. `007_create_payments_table.sql` - ссылается на bookings и users

## Проверка выполнения

После выполнения миграций проверьте наличие всех таблиц:

```sql
SHOW TABLES;
```

Должны быть следующие таблицы:
- users
- owners
- boats
- products
- boat_orders
- bookings
- payments

## Откат миграций

Для отката всех миграций выполните:

```sql
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS boat_orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS boats;
DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS users;
```

**Внимание:** Это удалит все данные из базы!
