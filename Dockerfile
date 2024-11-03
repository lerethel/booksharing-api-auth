FROM node:22.7-slim
WORKDIR /auth
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3003
