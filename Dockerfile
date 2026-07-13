# 1. Usamos una imagen basada en Debian, recomendada oficialmente por Prisma
FROM node:20-slim

# 2. Instalamos OpenSSL (esencial para que Prisma se comunique con Supabase)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# 3. Instalamos dependencias ignorando scripts temporales
RUN npm ci --ignore-scripts

COPY prisma ./prisma

# 4. Generamos el cliente de Prisma de manera segura
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]