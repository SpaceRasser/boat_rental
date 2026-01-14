# Docker Setup для Boat Rental System

## Требования
- Docker
- Docker Compose

## Запуск проекта

1. Клонируйте репозиторий (если еще не сделано)

2. Запустите контейнеры:
```bash
docker-compose up -d
```

3. Дождитесь запуска всех сервисов (MySQL, PHP, React)

4. Откройте в браузере:
   - React приложение: http://localhost:3000
   - PHP API: http://localhost:8080
   - База данных: localhost:3306

## Остановка проекта

```bash
docker-compose down
```

## Остановка с удалением данных

```bash
docker-compose down -v
```

## Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f php
docker-compose logs -f react
docker-compose logs -f db
```

## Пересборка контейнеров

```bash
docker-compose up -d --build
```

## Доступ к базе данных

- Host: localhost
- Port: 3306
- Database: boat_rental_system
- User: boat_user
- Password: boat_password
- Root Password: rootpassword

## Структура проекта

- `api/` - PHP API сервер
- `react-admin/` - React фронтенд
- `docker-compose.yml` - Конфигурация Docker Compose
- `Dockerfile.php` - Dockerfile для PHP
- `react-admin/Dockerfile` - Dockerfile для React
- `init.sql` - SQL скрипт для инициализации базы данных

## Переменные окружения

Переменные окружения для подключения к БД настраиваются в `docker-compose.yml`:
- DB_HOST=db
- DB_NAME=boat_rental_system
- DB_USER=boat_user
- DB_PASSWORD=boat_password

## Примечания

- При первом запуске база данных будет автоматически инициализирована скриптом `init.sql`
- Поле `role` будет добавлено в таблицу `users` автоматически
- React приложение будет доступно на порту 3000
- PHP API будет доступен на порту 8080
