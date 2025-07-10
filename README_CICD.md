# 🧪 CI/CD Testing Setup for Ukshati 2.0

## 📁 What We Have (Only 2 Files!)

1. **`.github/workflows/ci.yml`** - Main CI/CD Pipeline
2. **`.github/workflows/cd.yml`** - Auto Deployment

## 🧪 **TESTING MODE - SAFE FOR TESTING**

**✅ ONLY runs on `github-actions` branch**
**✅ Will NOT affect other branches (main, purchase-order, etc.)**
**✅ Deployment steps are SIMULATED (no real deployment)**

## 🔧 Testing Setup (Optional - for full testing)

### 1. Add These Secrets to GitHub Repository Settings (Optional):

```
SERVER_HOST=test-server-ip (optional for testing)
SERVER_USER=deploy (optional for testing)
SERVER_SSH_KEY=your-ssh-private-key (optional for testing)
```

**Note:** Even without these secrets, the pipeline will run and test everything except the actual deployment step.

## 🎯 What It Does (TESTING MODE)

### CI Pipeline (ci.yml):
- ✅ Tests code on push/PR to `github-actions` branch ONLY
- ✅ Runs linting (ESLint)
- ✅ Builds the application
- ✅ Security audit
- ✅ Builds Docker images
- ✅ **SIMULATES** deployment (no real deployment)

### CD Pipeline (cd.yml):
- ✅ Triggers after successful CI
- ✅ **SIMULATES** server deployment
- ✅ Shows what would happen in real deployment

## 🌟 Branch Strategy (TESTING)

- **`github-actions`** → **TESTING ONLY** - Safe to test pipeline
- **Other branches** → **NOT AFFECTED** - Pipeline won't run

## 🧪 How to Test

1. **Make changes** in your code on `github-actions` branch
2. **Push to github-actions branch** → CI runs automatically
3. **Check GitHub Actions tab** for pipeline status
4. **See simulated deployment** in the logs
5. **Other branches remain untouched** ✅

## 🔍 Monitoring

- Check **GitHub Actions** tab for pipeline status
- Server logs: `docker-compose logs -f`
- Application: Visit your server IP:3000

## 🛠️ Troubleshooting

**Pipeline fails?**
- Check GitHub Actions logs
- Verify secrets are set correctly

**Deployment fails?**
- Check server has Docker installed
- Verify SSH key has access
- Check server disk space

**Application not working?**
- Check `docker-compose logs`
- Verify database is running
- Check environment variables

That's it! Simple and effective! 🎉
