# syntax=docker/dockerfile:1

# Production image
FROM dunglas/frankenphp:1-php8.4 AS frankenphp_upstream

# Development image
FROM frankenphp_upstream AS frankenphp_dev
RUN install-php-extensions intl xdebug
COPY --link frankenphp/Caddyfile /etc/caddy/Caddyfile

# Production image
FROM frankenphp_upstream AS frankenphp_prod

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

RUN set -eux; \
    install-php-extensions \
        @composer \
        intl \
        opcache \
    ;

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1

# Prevent the reinstallation of vendors at every changes in the source code
COPY --link composer.* symfony.* ./
RUN set -eux; \
    composer install --no-cache --prefer-dist --no-dev --no-autoloader --no-scripts --no-progress

# Copy sources
COPY --link . ./
RUN rm -Rf frankenphp/

RUN set -eux; \
    mkdir -p var/cache var/log; \
    composer dump-autoload --classmap-authoritative --no-dev; \
    chmod +x apps/docs/bin/console; sync;

COPY --link apps/docs/frankenphp/Caddyfile /etc/caddy/Caddyfile

HEALTHCHECK --start-period=60s CMD curl -f http://localhost:2019/metrics || exit 1
