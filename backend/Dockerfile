FROM php:8.1-fpm

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx

# Очистка
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Установка PHP расширений
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Установка рабочей директории
WORKDIR /var/www

# Копируем composer файлы
COPY composer.json composer.lock ./

# Устанавливаем зависимости (без скриптов)
RUN composer install --no-dev --no-scripts --no-autoloader

# Копируем остальные файлы (включая artisan)
COPY . /var/www

# Генерируем autoloader
RUN composer dump-autoload --optimize --no-dev

# Установка прав
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www/storage

# Копирование конфигурации nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default

EXPOSE 80

CMD php-fpm -D && nginx -g 'daemon off;'
