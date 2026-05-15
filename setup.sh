#!/usr/bin/env bash
set -e

echo "=== College App Setup ==="

# Start infrastructure
echo "▶ Starting PostgreSQL and Redis…"
docker compose up -d

# Backend
echo "▶ Installing backend dependencies…"
cd backend
cp -n .env.example .env 2>/dev/null || true
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
cd ..

# Frontend
echo "▶ Installing frontend dependencies…"
cd frontend
cp -n .env.local.example .env.local 2>/dev/null || true
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Run the app:"
echo "  Terminal 1: cd backend && npm run start:dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Demo logins:"
echo "  admin@demo.edu      / Admin@123    (Super Admin)"
echo "  head.cse@demo.edu   / Head@123     (Dept Head)"
echo "  prof.smith@demo.edu / Teacher@123  (Teacher)"
echo "  alice@demo.edu      / Student@123  (Student)"
