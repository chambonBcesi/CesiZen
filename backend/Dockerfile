# CESIZen - Backend (API Express)
# À placer dans backend/Dockerfile
#
# Base "slim" (Debian/glibc) plutôt que "alpine" : le paquet "bcrypt" utilisé
# par l'API ne fournit pas de binaire précompilé pour musl libc (Alpine), ce
# qui obligerait à recompiler depuis les sources (python3/make/g++) à chaque
# build. En glibc, le binaire précompilé est téléchargé directement — build
# plus rapide et plus fiable.
FROM node:26-slim

WORKDIR /app

# Dépendances d'abord (meilleur cache Docker : ne se réinstalle que si
# package.json / package-lock.json changent)
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3001

# Exécution en utilisateur non-root (principe de moindre privilège) —
# l'image node officielle fournit déjà un utilisateur "node" non privilégié.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
