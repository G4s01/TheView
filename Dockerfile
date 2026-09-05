# Build stage
FROM node:24-slim AS builder

WORKDIR /app

# Dipendenze per compilare better-sqlite3 (Debian/Ubuntu)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copia solo i file essenziali per scaricare le dipendenze
COPY package.json package-lock.json ./
RUN npm ci

# Copia il resto dei file
COPY . .

# Esegui la build del frontend e del backend Node
RUN npm run build
# Rimuove le dipendenze dev per tenere l'immagine finale leggera
RUN npm prune --omit=dev

# Run stage
FROM node:24-slim

WORKDIR /app

# sqlite.db sarà salvato nella directory /app/data tramite volume docker-compose
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV BODY_SIZE_LIMIT=5242880

EXPOSE 3001

CMD ["node", "build"]

