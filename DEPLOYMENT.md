# 🚀 FusionMarkt Production Deployment Guide

## Ubuntu 22.04 + FastPanel + Cloudflare + Resend

---

## 📋 Pre-Deployment Checklist

- [ ] Domain DNS configured in Cloudflare
- [ ] SSL certificates will be provided by Cloudflare (Proxy enabled)
- [ ] PostgreSQL database ready
- [ ] AWS S3 bucket created and configured
- [ ] Resend account created and domain verified
- [ ] Google OAuth credentials created (optional)

---

## 🔧 Server Preparation

### 1. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Should be v20.x.x
```

### 2. Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

### 3. Install PostgreSQL (if not using external DB)

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE fusionmarkt;
CREATE USER fusionuser WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE fusionmarkt TO fusionuser;
\q
```

---

## 📁 Project Structure

```
/var/www/fusionmarkt/
├── fusionmarkt/           # Frontend (port 3003)
├── nextadmin-nextjs-pro/  # Admin Panel (port 3001)
└── packages/
    └── db/                # Shared Prisma schema
```

---

## 🔐 Environment Setup

### Frontend (.env)
```bash
cd /var/www/fusionmarkt/fusionmarkt
cp .env.example .env
nano .env
```

### Admin Panel (.env)
```bash
cd /var/www/fusionmarkt/nextadmin-nextjs-pro-v2-main
cp .env.example .env
nano .env
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/fusionmarkt` |
| `NEXTAUTH_SECRET` | Random 32+ char string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL | `https://fusionmarkt.com` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxx` |
| `EMAIL_FROM` | Verified sender | `FusionMarkt <noreply@fusionmarkt.com>` |
| `REVALIDATE_SECRET` | Cache sync secret | `openssl rand -base64 32` |
| `AWS_*` | S3 credentials | See .env.example |

---

## 🛠️ Build & Deploy

### 1. Clone and Install

```bash
cd /var/www
git clone your-repo fusionmarkt
cd fusionmarkt

# Install root dependencies
npm install

# Install and build packages/db
cd packages/db
npm install
npx prisma generate

# Deploy database migrations
npx prisma migrate deploy
```

### 2. Build Frontend

```bash
cd /var/www/fusionmarkt/fusionmarkt
npm install
npm run build
```

### 3. Build Admin Panel

```bash
cd /var/www/fusionmarkt/nextadmin-nextjs-pro-v2-main
npm install
npm run build
```

### 4. Start with PM2

```bash
# Start Frontend
cd /var/www/fusionmarkt/fusionmarkt
pm2 start npm --name "fusionmarkt" -- start

# Start Admin Panel
cd /var/www/fusionmarkt/nextadmin-nextjs-pro-v2-main
pm2 start npm --name "fusionmarkt-admin" -- start

# Save PM2 config
pm2 save
pm2 startup
```

---

## 🌐 FastPanel / Nginx Configuration

### Main Site (fusionmarkt.com)

```nginx
server {
    listen 80;
    server_name fusionmarkt.com www.fusionmarkt.com;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Admin Panel (admin.fusionmarkt.com)

```nginx
server {
    listen 80;
    server_name admin.fusionmarkt.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ☁️ Cloudflare Configuration

### DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | YOUR_SERVER_IP | ✅ Proxied |
| A | www | YOUR_SERVER_IP | ✅ Proxied |
| A | admin | YOUR_SERVER_IP | ✅ Proxied |

### SSL/TLS Settings

- **SSL Mode:** Full (strict) - if you have origin certificate
- **SSL Mode:** Flexible - if no origin certificate
- **Always Use HTTPS:** ✅ Enabled
- **Automatic HTTPS Rewrites:** ✅ Enabled

### Security Settings

- **Security Level:** Medium
- **Bot Fight Mode:** ✅ Enabled
- **Browser Integrity Check:** ✅ Enabled

### Caching Settings

- **Caching Level:** Standard
- **Browser Cache TTL:** 4 hours
- **Always Online:** ✅ Enabled

---

## 📧 Resend Email Setup

1. Go to https://resend.com
2. Add and verify your domain (fusionmarkt.com)
3. Add DNS records (DKIM, SPF, DMARC)
4. Create API key
5. Set `RESEND_API_KEY` in both .env files

---

## 🔍 Health Checks

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs fusionmarkt
pm2 logs fusionmarkt-admin

# Restart if needed
pm2 restart fusionmarkt
pm2 restart fusionmarkt-admin

# Check ports
sudo netstat -tlnp | grep -E '3001|3003'
```

---

## 🔄 Update Deployment

```bash
cd /var/www/fusionmarkt

# Pull latest changes
git pull origin main

# Rebuild
cd fusionmarkt && npm run build
cd ../nextadmin-nextjs-pro-v2-main && npm run build

# Restart
pm2 restart all
```

---

## 🛡️ Security Notes

1. **Never commit .env files** - They contain secrets
2. **UFW Firewall:**
   ```bash
   sudo ufw enable
   sudo ufw allow OpenSSH
   sudo ufw allow 80
   sudo ufw allow 443
   ```
3. **Block direct port access:**
   ```bash
   sudo ufw deny 3001
   sudo ufw deny 3003
   ```
4. **Regular backups:**
   ```bash
   pg_dump fusionmarkt > backup_$(date +%Y%m%d).sql
   ```

---

## 📞 Support

For issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/error.log`
3. System logs: `journalctl -xe`
