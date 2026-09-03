# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Dipendenze per compilare better-sqlite3
RUN apk add --no-cache python3 make g++ 

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
FROM node:24-alpine

WORKDIR /app

# sqlite.db sarà salvato nella directory /app
# ma possiamo montare un volume da Docker Compose per persisterlo.

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Drizzle configs/migrations/schema might be needed if we want to run migrations on startup,
# but for now we assume the DB is initialized or we just use it.
# better-sqlite3 is compiled inside node_modules so it's copied safely.

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "build"]

