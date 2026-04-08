#!/usr/bin/env bash
# scripts/migrate.sh
# Run Prisma migration in production environment
# Use in: CI/CD pipeline BEFORE deploying app, NOT in Dockerfile
set -euo pipefail

ENV_FILE="${1:-.env.docker}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Không tìm tìm file env: $ENV_FILE"
  exit 1
fi

echo "Loading env from $ENV_FILE..."
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Migration completed"
