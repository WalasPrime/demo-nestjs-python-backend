FROM node:26 AS base

FROM base AS dependencies-all
WORKDIR /app

COPY package*.json ./
RUN npm install

FROM dependencies-all AS development
COPY . .

CMD npm run start:dev