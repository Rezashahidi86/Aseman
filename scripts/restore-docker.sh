#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-directory>" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Root .env file not found." >&2
  exit 1
fi

set -a
source .env
set +a

: "${MONGO_ROOT_USERNAME:?MONGO_ROOT_USERNAME is required}"
: "${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD is required}"

BACKUP_DIR="$(realpath "$1")"
DUMP_DIR="$BACKUP_DIR/mongo/aseman"
UPLOADS_ARCHIVE="$BACKUP_DIR/uploads.tar.gz"

[[ -d "$DUMP_DIR" ]] || { echo "MongoDB dump directory not found: $DUMP_DIR" >&2; exit 1; }
[[ -f "$UPLOADS_ARCHIVE" ]] || { echo "Uploads archive not found: $UPLOADS_ARCHIVE" >&2; exit 1; }

if [[ -f "$BACKUP_DIR/SHA256SUMS" ]]; then
  (cd "$BACKUP_DIR" && sha256sum --check SHA256SUMS)
else
  echo "Backup checksum file is missing." >&2
  exit 1
fi

echo "WARNING: this restores documents into the current Docker database without dropping existing collections."
echo "For a full restore, use a separately reviewed empty destination and verify the uploads volume first."
read -r -p "Type RESTORE to continue: " confirmation
[[ "$confirmation" == "RESTORE" ]] || { echo "Restore cancelled."; exit 1; }

MONGO_PORT="${MONGO_HOST_PORT:-27018}"
MONGO_URI="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@127.0.0.1:${MONGO_PORT}/aseman?authSource=admin&directConnection=true"

mongorestore --uri="$MONGO_URI" --nsInclude='aseman.*' "$DUMP_DIR"
docker compose exec -T backend sh -c 'tar -xzf - -C /app/uploads' < "$UPLOADS_ARCHIVE"

echo "Restore commands completed. Verify collections, indexes, and uploaded files before reopening writes."
