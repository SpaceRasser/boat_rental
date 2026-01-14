-- Скрипт для выполнения всех миграций
-- Использование: mysql -u root -p boat_rental_system < run_all_migrations.sql

-- Создание базы данных (если еще не создана)
CREATE DATABASE IF NOT EXISTS boat_rental_system;
USE boat_rental_system;

-- Миграция 001: Создание таблицы users
SOURCE migrations/001_create_users_table.sql;

-- Миграция 002: Создание таблицы owners
SOURCE migrations/002_create_owners_table.sql;

-- Миграция 003: Создание таблицы boats
SOURCE migrations/003_create_boats_table.sql;

-- Миграция 004: Создание таблицы products
SOURCE migrations/004_create_products_table.sql;

-- Миграция 005: Создание таблицы bookings
SOURCE migrations/005_create_bookings_table.sql;

-- Миграция 006: Создание таблицы booking_items
SOURCE migrations/006_create_booking_items_table.sql;

-- Миграция 007: Создание таблицы payments
SOURCE migrations/007_create_payments_table.sql;
