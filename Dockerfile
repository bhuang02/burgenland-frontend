FROM node:22-alpine AS build

WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CYPRESS_INSTALL_BINARY=0

RUN corepack enable

COPY . .

RUN yarn install --immutable
RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist/spa /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
