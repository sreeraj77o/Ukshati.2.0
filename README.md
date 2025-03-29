# Ukshati

```markdown
# Next.js + MySQL Docker Project

This is a full-stack project with a Next.js frontend and a MySQL database, containerized using Docker. It is designed for easy setup and collaboration among team members.

---

## Features
- **Frontend**: Next.js with API routes for backend logic
- **Database**: MySQL with pre-configured schema and initialization
- **Docker**: Containerized setup for seamless development
- **Environment Variables**: Secure configuration using `.env` files

---

## Prerequisites
- Docker ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose ([Install Docker Compose](https://docs.docker.com/compose/install/))
- Node.js (optional, for local development)

---

## Project Structure
```bash
Ukshati/
├── frontend/ # Next.js application
│ ├── pages/ # Next.js pages
│ ├── public/ # Static assets
│ ├── styles/ # CSS files
│ ├── package.json # Frontend dependencies
│ └── .enc.local and ... # Other Next.js files
├── db/ # Database initialization scripts
│ └── company_db.sql # SQL schema and data
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile # Dockerfile for Next.js
├── .env.example # Environment variables template
└── README.md # Project documentation
```

---

## Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Ukshati
```

### 2. Set Up Environment Variables
- Copy `1st snippet` to `.env.local`:
  ```bash
  cp .env.local 
  ```
- Update the `.env` file with your credentials.

### 3. Start the Project
```bash
docker-compose up --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Database**: Accessible via `db:3306` from the Next.js container

---

## Environment Variables
Create a `.env` file in the root directory using the `.env.example` template:

```env.local
DB_HOST=db
DB_USER=company
DB_PASSWORD=Ukshati@123
DB_NAME=company_db
JWT_SECRET=HiUkshati123
DB_SSL=false
```

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=company_db
MYSQL_USER=company
MYSQL_PASSWORD=Ukshati@123
```

---

## Development Workflow

### Run the Project
```bash
docker-compose up
```

### Rebuild Containers
```bash
docker-compose up --build
```

### Stop the Project
```bash
docker-compose down
```

### Remove Volumes and Containers
```bash
docker-compose down -v
```

### Access MySQL Database
```bash
docker exec -it <mysql-container-id> mysql -u company -pUkshati@123 company_db
```

---

## Database Initialization
The database is initialized using `db/company_db.sql`. This script:
- Creates the `employee` table
- Inserts sample data

To reinitialize the database:
1. Stop the containers:
   ```bash
   docker-compose down -v
   ```
2. Restart the project:
   ```bash
   docker-compose up --build
   ```

---

## Troubleshooting

### 1. npm Install Fails
- Ensure you have a stable internet connection.
- If behind a proxy, configure proxy settings in the Dockerfile:
  ```frontend
    npm install <package name>
  ```

### 2. Database Connection Issues
- Verify the database is running:
  ```bash
  docker ps
  ```
- Check MySQL logs:
  ```bash
  docker logs <mysql-container-id>
  ```

### 3. Hot-Reload Not Working
- Ensure the `volumes` section in `docker-compose.yml` is correctly configured:
  ```yaml
  volumes:
    - ./frontend:/app
    - /app/node_modules
  ```

---

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

#jaideepn3590@duck.com
