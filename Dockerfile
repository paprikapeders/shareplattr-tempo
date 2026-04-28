FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files if they exist (for caching)
# COPY composer.json composer.lock ./

# Install PHP dependencies (if composer files exist)
# RUN composer install --no-dev --optimize-autoloader

# Copy the rest of the application
COPY . .

# Create temp directory and set permissions
RUN mkdir -p /var/www/storage/temp \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/storage/temp \
    && echo 'env[TMPDIR] = /var/www/storage/temp' >> /usr/local/etc/php-fpm.d/www.conf

# Set TMPDIR environment variable
ENV TMPDIR=/var/www/storage/temp

# Expose port 9000 for php-fpm
EXPOSE 9000

# Start php-fpm
CMD ["php-fpm"]