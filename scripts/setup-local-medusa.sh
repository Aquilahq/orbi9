#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
command -v docker >/dev/null || { echo 'Docker is required. Install Docker Desktop with WSL integration.'; exit 1; }
docker compose version >/dev/null || { echo 'Docker Compose is required.'; exit 1; }

npm install
npm --prefix medusa-backend install
ENV_FILE="$ROOT/medusa-backend/apps/backend/.env"
cp "$ROOT/medusa-backend/apps/backend/.env.template" "$ENV_FILE" 2>/dev/null || true
sed -i '/^DATABASE_URL=/d;/^REDIS_URL=/d' "$ENV_FILE"
printf '\nDATABASE_URL=postgres://medusa:medusa_local@localhost:5433/medusa\nREDIS_URL=redis://localhost:6380\n' >> "$ENV_FILE"
docker compose -f medusa-backend/docker-compose.yml up -d
(cd medusa-backend/apps/backend && npx medusa db:migrate)
echo
echo 'Setup complete. Start the backend with:'
echo '  cd medusa-backend && npm run backend:dev'
echo 'Then open http://localhost:9000/app'
