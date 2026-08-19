# CESIZen - Frontend (React/Vite, servi par Nginx, sert aussi de reverse
# proxy vers le backend pour que tout passe par le port 80)
# À placer dans frontend/Dockerfile

# ---------- Étape 1 : build de l'application React ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL de l'API injectée au moment du build (Vite intègre les variables
# VITE_* dans le bundle statique, il n'y a pas de variable d'environnement
# "runtime" possible côté navigateur). Fournie par docker-compose (build.args)
# ou par --build-arg lors d'un build manuel / dans la CI.
ARG VITE_API_URL=http://localhost
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Étape 2 : image finale, juste Nginx + fichiers statiques ----------
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
