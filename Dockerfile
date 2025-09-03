# ---------------------------------------
# Composer (DEV)
# ---------------------------------------
FROM composer:2 AS composer_dev
WORKDIR /app
COPY apps/docs/composer.json apps/docs/composer.lock apps/docs/
COPY packages ./packages
WORKDIR /app/apps/docs
RUN composer install --no-scripts --no-progress --prefer-dist \
 && rm -rf vendor/harmonyui/ui-bundle \
 && cp -r ../../packages/ui-bundle vendor/harmonyui/ \
 && composer dump-autoload --optimize

# ---------------------------------------
# Composer (PROD)
# ---------------------------------------
FROM composer:2 AS composer_prod
WORKDIR /app
COPY apps/docs/composer.json apps/docs/composer.lock apps/docs/
COPY packages ./packages
WORKDIR /app/apps/docs
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist \
 && rm -rf vendor/harmonyui/ui-bundle \
 && cp -r ../../packages/ui-bundle vendor/harmonyui/ \
 && composer dump-autoload --optimize

# ---------------------------------------
# ASSETS builder (Node)
# ---------------------------------------
FROM node:18-alpine AS assets
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY packages ./packages
COPY apps/docs ./apps/docs

COPY --from=composer_prod /app/apps/docs/vendor /app/apps/docs/vendor

RUN npm i -g pnpm \
 && pnpm install --frozen-lockfile

ENV NODE_ENV=production
WORKDIR /app/apps/docs
RUN pnpm run build

RUN ls -la ./public/build || true \
 && (ls -1 ./public/build | grep -E '\.(css|js)$' >/dev/null \
     || (echo "ERROR: No CSS/JS emitted. Check webpack entries." && exit 1))

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
COPY --from=assets /app/apps/docs/public/build /app/public/build
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

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
COPY --from=assets /app/apps/docs/public/build /app/public/build
RUN php bin/console cache:clear --env=prod --no-interaction || true \
 && php -v > /dev/null

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
