# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Demo Basic Auth credentials are compiled into the bundle; must match the backend.
ARG VITE_AUTH_USERNAME=admin
ARG VITE_AUTH_PASSWORD=password123
ENV VITE_AUTH_USERNAME=$VITE_AUTH_USERNAME VITE_AUTH_PASSWORD=$VITE_AUTH_PASSWORD
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.31-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
