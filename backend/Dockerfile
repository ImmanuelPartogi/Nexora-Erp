FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production || npm ci

COPY prisma ./prisma/
COPY tsconfig.json ./
COPY src ./src/

RUN npm install -g tsx typescript
RUN npx prisma generate
RUN npm run build

EXPOSE 8080

RUN npx prisma migrate deploy

CMD ["npm", "run", "start"]