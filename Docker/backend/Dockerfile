FROM php:8.3-fpm-alpine

RUN apk add --no-cache bash git curl zip unzip icu-dev oniguruma-dev libzip-dev \
  && docker-php-ext-install pdo_mysql mbstring zip intl opcache \
  && curl -sS https://getcomposer.org/installer | php -- \
      --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html
