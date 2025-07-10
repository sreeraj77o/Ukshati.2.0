# Docker Testing Guide for Ukshati 2.0

## 🐳 **Docker Setup & Testing Instructions**

### **Prerequisites**
- Docker and Docker Compose installed
- WSL2 (if on Windows)
- At least 4GB RAM available for containers

---

## 🚀 **Starting the Application**

### **1. Start with Docker Compose**
```bash
# From the project root directory
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### **2. Verify Services are Running**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs nextjs
docker-compose logs db
```

### **3. Access the Application**
- **Frontend**: http://localhost:3000
- **Database**: localhost:3306 (from host)

---

## 🧪 **Testing the Application**

### **API Testing (From Host)**
```bash
cd frontend

# Test APIs with external access
API_BASE=http://localhost:3000 npm run test:api

# Test performance
API_BASE=http://localhost:3000 npm run test:performance
```

### **Component Testing**
```bash
cd frontend

# Test component structure
npm run test:components

# Test all (APIs + Components)
npm run test:all
```

### **Docker Internal Testing**
```bash
# Execute commands inside the container
docker-compose exec nextjs npm run test:docker

# Or enter the container
docker-compose exec nextjs bash
# Then run: npm run test:api
```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "3001:3000"
```

#### **2. Database Connection Issues**
```bash
# Check database health
docker-compose exec db mysqladmin ping -u company -p

# Connect to database
docker-compose exec db mysql -u company -p company_db

# Check tables
SHOW TABLES;
```

#### **3. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER frontend/.next
sudo chmod -R 755 frontend/.next

# Or clean build
docker-compose down
docker-compose up --build
```

#### **4. API 500 Errors**
```bash
# Check container logs
docker-compose logs nextjs

# Check database logs
docker-compose logs db

# Restart services
docker-compose restart
```

---

## 📊 **Performance Monitoring**

### **Database Performance**
```sql
-- Connect to database
docker-compose exec db mysql -u company -p company_db

-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'company_db'
ORDER BY (data_length + index_length) DESC;

-- Check slow queries
SHOW PROCESSLIST;
```

### **Container Resource Usage**
```bash
# Monitor container resources
docker stats

# Check specific container
docker stats ukshati20_nextjs_1
```

---

## 🛠 **Development Workflow**

### **Making Changes**
1. **Code Changes**: Edit files in `frontend/` directory
2. **Hot Reload**: Changes should auto-reload in development mode
3. **Database Changes**: Update `db/company_db.sql` and rebuild

### **Rebuilding After Changes**
```bash
# Rebuild only if needed
docker-compose up --build

# Force rebuild
docker-compose build --no-cache
docker-compose up
```

### **Database Reset**
```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm ukshati20_mysql-data

# Restart (will recreate database)
docker-compose up --build
```

---

## ✅ **Testing Checklist**

### **Before Deployment**
- [ ] All APIs return 200 status
- [ ] Database connections working
- [ ] Frontend components load without errors
- [ ] Dashboard displays data correctly
- [ ] IMS (Inventory) module functional
- [ ] CRM features working
- [ ] No console errors in browser

### **API Endpoints to Test**
- [ ] `/api/stocks` - Inventory data
- [ ] `/api/customers` - Customer data  
- [ ] `/api/projects` - Project data
- [ ] `/api/employees` - Employee data
- [ ] `/api/expenses` - Expense data
- [ ] `/api/categories` - Category data

### **Frontend Pages to Test**
- [ ] `/dashboard` - Main dashboard
- [ ] `/ims/home` - Inventory management
- [ ] `/crm` - Customer relationship management
- [ ] `/login` - Authentication

---

## 🚨 **Emergency Commands**

### **Complete Reset**
```bash
# Stop everything
docker-compose down

# Remove all containers and volumes
docker-compose down -v --remove-orphans

# Remove images
docker rmi $(docker images -q)

# Start fresh
docker-compose up --build
```

### **Backup Database**
```bash
# Create backup
docker-compose exec db mysqldump -u company -p company_db > backup.sql

# Restore backup
docker-compose exec -T db mysql -u company -p company_db < backup.sql
```

---

## 📈 **Expected Performance Metrics**

### **API Response Times**
- **Fast**: < 200ms (Categories, simple queries)
- **Medium**: 200-500ms (Complex queries with JOINs)
- **Acceptable**: 500-1000ms (Large datasets)
- **Needs Optimization**: > 1000ms

### **Success Rates**
- **Production Ready**: 100% API success rate
- **Acceptable**: 95%+ success rate
- **Needs Attention**: < 95% success rate

---

## 🎯 **Next Steps After Testing**

1. **If All Tests Pass**: Ready for production deployment
2. **If Some Tests Fail**: Check logs and fix issues
3. **Performance Issues**: Optimize database queries
4. **Component Issues**: Fix import paths and component structure

---

**Happy Testing! 🚀**
