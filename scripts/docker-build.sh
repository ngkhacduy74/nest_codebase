#!/usr/bin/env bash
# scripts/docker-build.sh
set -euo pipefail

REGISTRY="${REGISTRY:-ghcr.io/your-org/saas-backend}"
TAG="${1:-$(git rev-parse --short HEAD)}"

echo "Building image: $REGISTRY:$TAG"

docker build \
  --tag "$REGISTRY:$TAG" \
  --tag "$REGISTRY:latest" \
  --file Dockerfile \
  --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --build-arg GIT_SHA="$TAG" \
  .

echo "Build completed: $REGISTRY:$TAG"
echo "To push: docker push $REGISTRY:$TAG"
