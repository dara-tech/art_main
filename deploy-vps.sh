#!/bin/bash
# Automatic direct deployment script for Backend & Frontend to VPS (107.175.91.211)
set -e

VPS_IP="107.175.91.211"
VPS_USER="root"

echo "=========================================="
echo "🚀 Starting Direct Deployment to $VPS_IP"
echo "=========================================="

# 1. Build Frontend
echo "📦 Building Frontend..."
cd frontend
npm run build
cd ..

# 2. Package Frontend Dist
echo "📦 Packaging Frontend dist..."
tar -czf /tmp/art_frontend_dist.tar.gz -C frontend/dist .

# 3. Package Backend
echo "📦 Packaging Backend..."
tar --exclude='node_modules' --exclude='.env' -czf /tmp/main_art_backend.tar.gz -C backend .

# 4. Upload to VPS
echo "📤 Uploading archives to VPS ($VPS_IP)..."
scp /tmp/art_frontend_dist.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/art_frontend_dist.tar.gz
scp /tmp/main_art_backend.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/main_art_backend.tar.gz

# 5. Extract and Reload Services on VPS
echo "⚙️ Updating Frontend & Backend on VPS..."
ssh ${VPS_USER}@${VPS_IP} "
  mkdir -p /var/www/art_frontend /root/art_backend
  rm -rf /var/www/art_frontend/*
  tar -xzf /tmp/art_frontend_dist.tar.gz -C /var/www/art_frontend
  rm -rf /root/art_backend/*
  tar -xzf /tmp/main_art_backend.tar.gz -C /root/art_backend
  
  cd /root/art_backend
  cat << 'EOF' > .env
DB_HOST=172.104.33.79
DB_PORT=3306
DB_NAME=main_dbs
DB_USER=mpi
DB_PASSWORD=Mpi@2025

PORT=3001
NODE_ENV=production

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

FRONTEND_URL=https://107-175-91-211.sslip.io

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

DB_POOL_MAX=25

WAREHOUSE_DB_HOST=172.104.33.79
WAREHOUSE_DB_PORT=3306
WAREHOUSE_DB_NAME=preart_sites_registry
WAREHOUSE_DB_USER=mpi
WAREHOUSE_DB_PASSWORD=Mpi@2025

GEMINI_API_KEY=AIzaSyBOXMIss_gfPCN5V5-ZXLCf1LS9xdkfY_U
GEMINI_MODEL=gemini-2.5-flash
EOF
  npm install --production --silent
  pm2 restart art-main-backend || pm2 start src/server.js --name 'art-main-backend'
  pm2 save
  systemctl reload nginx
"

echo "=========================================="
echo "✅ Direct Deployment Complete!"
echo "🌐 Site URL: https://107-175-91-211.sslip.io"
echo "=========================================="
