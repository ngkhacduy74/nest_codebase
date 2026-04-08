#!/usr/bin/env bash
# scripts/setup-dev.sh
set -euo pipefail

echo "Setting up development environment..."

# 1. Check tools
command -v node >/dev/null || { echo "Node.js not installed"; exit 1; }
command -v pnpm >/dev/null || npm install -g pnpm

# 2. Copy env files if not exist
[[ -f .env ]] || { cp .env.example .env; echo "Copied .env.example -> .env (update values)"; }
[[ -f .env.docker ]] || { cp .env.docker.example .env.docker 2>/dev/null || echo "Create .env.docker.example first"; }

# 3. Install dependencies
echo "Installing dependencies..."
pnpm install

# 4. Start infra
echo "Starting Docker services..."
docker compose up -d postgres redis

# 5. Wait for postgres
echo "Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U "${DATABASE_USER:-user}" >/dev/null 2>&1; do
  sleep 1
done

# 6. Generate Prisma client + run migration
echo "Running migrations..."
pnpm exec prisma generate
pnpm exec prisma migrate dev

echo ""
echo "Setup completed!"
echo "Run app: pnpm start:dev"
echo "Swagger: http://localhost:3000/api/v1/docs"
