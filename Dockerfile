FROM php:8.3-apache

# Activer mod_rewrite pour Symfony
RUN a2enmod rewrite

# Extensions PHP nécessaires + Node.js
RUN apt-get update && apt-get install -y \
    git curl libzip-dev libicu-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip intl opcache \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier le projet
COPY . .

# Installer les dépendances PHP
RUN APP_ENV=prod composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Builder React
RUN cd assets/react/build && npm install && npm run build

# Config Apache : pointer vers public/
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        FallbackResource /index.php\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-enabled/000-default.conf

# Permissions
RUN mkdir -p /var/www/html/var && \
    chown -R www-data:www-data /var/www/html/var && \
    chmod -R 775 /var/www/html/var

EXPOSE 80

CMD bash -c "php bin/console doctrine:migrations:migrate --no-interaction --env=prod && \
             php bin/console importmap:install && \
             php bin/console tailwind:build --env=prod && \
             php bin/console asset-map:compile --env=prod && \
             php bin/console cache:warmup --env=prod && \
             chown -R www-data:www-data /var/www/html/var && \
             apache2-foreground"
