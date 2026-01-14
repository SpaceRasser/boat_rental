FROM php:8.1-apache

# Установка необходимых расширений PHP
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Включение mod_rewrite для Apache
RUN a2enmod rewrite

# Копирование конфигурации Apache
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# Копирование PHP файлов
COPY api/ /var/www/html/api/

# Установка прав
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

EXPOSE 80
