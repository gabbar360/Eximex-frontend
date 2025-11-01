# 🚀 Frontend CI/CD Setup Guide

## Overview

Ye project mein automated CI/CD pipeline setup hai jo GitHub Actions use karta hai.

## Workflows

### 1. Production Deployment (`frontend-production.yml`)

**Trigger:** `main` branch pe push
**Steps:**

- Quality checks (TypeScript, linting, formatting, security audit)
- Production build
- Server pe deployment
- Health checks
- Email notifications

### 2. Development CI (`frontend-development.yml`)

**Trigger:** Feature branches aur pull requests
**Steps:**

- Code quality checks
- Build validation
- PR comments with build info

## Required GitHub Secrets

Repository Settings > Secrets and variables > Actions mein ye secrets add karni hongi:

### Server Deployment

```
PROD_FTP_HOST=your-server-ip
PROD_FTP_USER=your-username
PROD_FTP_PASS=your-password
PROD_URL=https://your-domain.com
PROD_API_URL=https://api.your-domain.com
```

### Email Notifications

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Optional (Staging)

```
STAGING_API_URL=https://staging-api.your-domain.com
```

## Server Setup Requirements

### 1. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/Eximex-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Directory Permissions

```bash
sudo mkdir -p /var/www/Eximex-frontend
sudo chown -R $USER:$USER /var/www/Eximex-frontend
sudo chmod -R 755 /var/www/Eximex-frontend
```

## Local Development

### Setup

```bash
npm install
npm run dev
```

### Code Quality

```bash
npm run lint          # Check linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run format:check  # Check formatting
```

### Build

```bash
npm run build         # Production build
npm run preview       # Preview build locally
```

## Deployment Process

### Automatic (Recommended)

1. Code push karo `main` branch pe
2. GitHub Actions automatically deploy karega
3. Email notification milegi

### Manual Deployment

```bash
# GitHub Actions tab mein jao
# "Frontend Production Deployment" workflow select karo
# "Run workflow" button click karo
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - TypeScript errors check karo
   - Linting issues fix karo
   - Dependencies update karo

2. **Deployment Fails**
   - Server credentials check karo
   - Server permissions verify karo
   - Nginx configuration check karo

3. **Health Check Fails**
   - Server status check karo
   - URL accessibility verify karo
   - Network connectivity check karo

### Debug Commands

```bash
# Local build test
npm run build

# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint

# Check formatting
npm run format:check
```

## Monitoring

### GitHub Actions

- Repository > Actions tab mein workflow status dekh sakte hain
- Failed builds ki detailed logs available hain

### Email Notifications

- Success/failure notifications automatically send hoti hain
- jaydeep.flexa@gmail.com pe notifications jaengi

## Best Practices

1. **Feature Development**
   - Feature branches use karo
   - Pull requests create karo
   - Code review process follow karo

2. **Code Quality**
   - Commit se pehle linting fix karo
   - TypeScript errors resolve karo
   - Proper commit messages likho

3. **Deployment**
   - Main branch pe direct push avoid karo
   - Pull request merge karo deployment ke liye
   - Staging environment test karo pehle

## Next Steps

1. **Testing Setup**
   - Jest/Vitest add karo
   - Unit tests likho
   - E2E tests setup karo

2. **Advanced Features**
   - Staging environment setup
   - Blue-green deployment
   - Rollback mechanism
   - Performance monitoring

3. **Security**
   - Dependency scanning
   - SAST tools integration
   - Security headers check
