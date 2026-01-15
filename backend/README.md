# Boat Rental Laravel API

Backend API для системы аренды лодок, переписанный на Laravel.

## Установка

1. Установите зависимости:
```bash
composer install
```

2. Создайте `.env` файл:
```bash
cp .env.example .env
```

3. Сгенерируйте ключ приложения:
```bash
php artisan key:generate
```

4. Запустите миграции:
```bash
php artisan migrate
```

## Docker

Используется Docker Compose. Backend работает на порту 8080.

## API Endpoints

Все endpoints соответствуют предыдущей PHP версии:
- `/api/auth/login.php` - Вход
- `/api/users/get.php` - Список пользователей
- `/api/boats/get.php` - Список лодок
- И другие...
