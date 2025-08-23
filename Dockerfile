# ---------------------------------------
# Composer (DEV)
# ---------------------------------------
FROM composer:2 AS composer_dev
WORKDIR /app
COPY apps/docs/composer.json apps/docs/composer.lock apps/docs/
COPY packages ./packages
WORKDIR /app/apps/docs
RUN composer install  --no-scripts --no-progress --prefer-dist && \
    rm -rf vendor/harmonyui/ui-bundle && \
    cp -r ../../packages/ui-bundle vendor/harmonyui/ && \
    composer dump-autoload --optimize

# ---------------------------------------
# Composer (PROD)
# ---------------------------------------
FROM composer:2 AS composer_prod
WORKDIR /app
COPY apps/docs/composer.json apps/docs/composer.lock apps/docs/
COPY packages ./packages
WORKDIR /app/apps/docs
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist && \
    rm -rf vendor/harmonyui/ui-bundle && \
    cp -r ../../packages/ui-bundle vendor/harmonyui/ && \
    composer dump-autoload --optimize

RUN composer install --no-dev --no-scripts --no-progress --prefer-dist && \
    rm -rf vendor/harmonyui/ui-bundle && \
    cp -r ../../packages/ui-bundle vendor/harmonyui/ && \
    composer dump-autoload --optimize

# ---------------------------------------
# Runtime DEV
# ---------------------------------------
FROM dunglas/frankenphp:latest AS frankenphp_dev
RUN install-php-extensions intl

RUN printf "opcache.enable=1\nopcache.validate_timestamps=1\nopcache.revalidate_freq=0\n" \
  > /usr/local/etc/php/conf.d/99-dev-opcache.ini \

WORKDIR /app

ENV APP_ENV=dev
ENV APP_DEBUG=1
ENV SERVER_NAME=:80
ENV APP_RUNTIME=Runtime\\FrankenPhpSymfony\\Runtime

#ENV FRANKENPHP_CONFIG="worker ./public/index.php"

COPY apps/docs /app/
COPY --from=composer_dev /app/apps/docs/vendor /app/vendor

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

# ---------------------------------------
# Node.js build stage
# ---------------------------------------
FROM node:18-alpine AS node_build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/docs ./apps/docs
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    cd apps/docs && \
    pnpm run build

# ---------------------------------------
# Runtime PROD
# ---------------------------------------
FROM dunglas/frankenphp:latest AS frankenphp_prod
RUN install-php-extensions intl
WORKDIR /app

ENV APP_ENV=prod
ENV APP_DEBUG=0
ENV SERVER_NAME=:80
ENV APP_RUNTIME=Runtime\\FrankenPhpSymfony\\Runtime

ENV FRANKENPHP_CONFIG="worker ./public/index.php 4"

COPY apps/docs /app/
COPY --from=composer_prod /app/apps/docs/vendor /app/vendor
COPY --from=node_build /app/apps/docs/public/build /app/public/build

RUN php bin/console cache:clear --env=prod --no-interaction || true \
 && php -v > /dev/null

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
