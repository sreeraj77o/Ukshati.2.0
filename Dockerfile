FROM node:20-alpine

# Install mysql-client for debugging
RUN apk add --no-cache mysql-client

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

CMD ["npm", "run", "dev"]
EXPOSE 3000