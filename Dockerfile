FROM node:20-alpine

# Install MariaDB client and jq for debugging and testing
RUN apk add --no-cache mysql-client jq

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

CMD ["npm", "run", "dev"]
EXPOSE 3000