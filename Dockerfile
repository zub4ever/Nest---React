FROM node:20-bullseye

WORKDIR /app

# Dependências primeiro (cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Código
COPY . .

# Nest em dev não precisa build, mas garante permissões
RUN chmod -R 755 /app

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
