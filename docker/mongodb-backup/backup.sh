#!/usr/bin/env bash
set -Eeuo pipefail

: "${MONGO_ROOT_USERNAME:?MONGO_ROOT_USERNAME must be set}"
: "${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD must be set}"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

create_backup() {
  local timestamp
  local backup_file
  local temporary_file

  timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
  backup_file="$BACKUP_DIR/aseman-$timestamp.archive.gz"
  temporary_file="$backup_file.partial"

  printf '[%s] Starting MongoDB backup\n' "$(date -u +'%FT%TZ')"

  if mongodump \
    --host mongodb \
    --port 27017 \
    --username "$MONGO_ROOT_USERNAME" \
    --password "$MONGO_ROOT_PASSWORD" \
    --authenticationDatabase admin \
    --db aseman \
    --gzip \
    --archive="$temporary_file"; then
    mv "$temporary_file" "$backup_file"
    printf '[%s] Backup completed: %s\n' "$(date -u +'%FT%TZ')" "$backup_file"
    find "$BACKUP_DIR" -maxdepth 1 -type f -name 'aseman-*.archive.gz' -mtime "+$BACKUP_RETENTION_DAYS" -delete
  else
    rm -f "$temporary_file"
    printf '[%s] ERROR: MongoDB backup failed\n' "$(date -u +'%FT%TZ')" >&2
    return 1
  fi
}

while true; do
  create_backup || true
  sleep "$BACKUP_INTERVAL_SECONDS"
done
