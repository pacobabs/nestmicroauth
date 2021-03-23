FROM node:lts-alpine as build

RUN mkdir -p /var/www/gateway
RUN mkdir -p /var/www/user

WORKDIR /var/www
COPY gateway/package*.json ./gateway/
COPY user/package*.json ./user/

WORKDIR /var/www/gateway
RUN npm install
COPY gateway/tsconfig*.json ./
COPY gateway/src .
RUN npm run build

WORKDIR /var/www/user
RUN npm install
COPY user/tsconfig*.json ./
COPY user/src .
RUN npm run build


FROM node:lts-alpine as production
ENV NODE_ENV production

WORKDIR /var/www
COPY gateway/package*.json ./gateway/
COPY user/package*.json ./user/

WORKDIR /var/www/gateway
RUN npm ci --only=production
COPY gateway/src .
COPY --from=build /var/www/gateway/dist ./dist

WORKDIR /var/www/user
RUN npm ci --only=production
COPY user/src .
COPY --from=build /var/www/user/dist ./dist

WORKDIR /var/www
RUN npm install -g pm2
COPY pm2.config.js .
CMD ["pm2-runtime", "pm2.config.js"]