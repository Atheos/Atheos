FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache oniguruma-dev libzip-dev && \
	docker-php-ext-install mbstring zip && \
	apk add --no-cache nginx git && \
	mkdir -p /etc/nginx/conf.d/ && \
	echo "daemon off;" >> /etc/nginx/conf.d/60-no-daemon.conf && \
	echo "error_log /dev/stdout info;" >> /etc/nginx/conf.d/60-no-daemon.conf

COPY . /var/www/html
COPY docker/default.conf /etc/nginx/http.d/default.conf

RUN mkdir cache && \
	chown -R www-data:www-data cache data workspace public plugins

EXPOSE 8080/tcp
