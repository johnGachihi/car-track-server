FROM node:lts-alpine
ENV FRONTEND_URL http://localhost:8080
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 3000
CMD [ "node", "app.js" ]