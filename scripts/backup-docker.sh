#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ ! -f .env ]]; then
  echo "Root .env file not found." >&2
  exit 1
fi

set -a
source .env
set +a

: "${MONGO_ROOT_USERNAME:?MONGO_ROOT_USERNAME is required}"
: "${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD is required}"

command -v mongodump >/dev/null 2>&1 || {
  echo "mongodump is required on the host. Install MongoDB Database Tools." >&2
  exit 1
}

BACKUP_ROOT="${BACKUP_ROOT:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$BACKUP_ROOT/aseman-$TIMESTAMP"
MONGO_PORT="${MONGO_HOST_PORT:-27018}"
MONGO_URI="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@127.0.0.1:${MONGO_PORT}/aseman?authSource=admin&directConnection=true"

mkdir -p "$BACKUP_DIR"

echo "Creating MongoDB backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo"

echo "Creating uploads backup..."
docker compose exec -T backend sh -c 'tar -czf - -C /app/uploads .' > "$BACKUP_DIR/uploads.tar.gz"

(
  cd "$BACKUP_DIR"
  sha256sum mongo/aseman/*.bson mongo/aseman/*.metadata.json uploads.tar.gz > SHA256SUMS
)

echo "Backup created: $BACKUP_DIR"

if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] && (( RETENTION_DAYS > 0 )); then
  find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d \
    -name 'aseman-*' -mtime "+$RETENTION_DAYS" -exec rm -rf -- {} +
fi

echo "Backup completed successfully."
