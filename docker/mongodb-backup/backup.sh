#!/usr/bin/env bash
set -Eeuo pipefail

: "${MONGO_ROOT_USERNAME:?MONGO_ROOT_USERNAME must be set}"
: "${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD must be set}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY must be set}"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

create_backup() {
  local timestamp
  local encrypted_file
  local raw_file
  local encrypted_temporary_file
  local uploads_encrypted_file
  local uploads_raw_file
  local uploads_encrypted_temporary_file

  timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
  encrypted_file="$BACKUP_DIR/aseman-$timestamp.archive.gz.enc"
  raw_file="/tmp/aseman-$timestamp.archive.gz"
  encrypted_temporary_file="$encrypted_file.partial"
  uploads_encrypted_file="$BACKUP_DIR/uploads-$timestamp.tar.gz.enc"
  uploads_raw_file="/tmp/uploads-$timestamp.tar.gz"
  uploads_encrypted_temporary_file="$uploads_encrypted_file.partial"

  printf '[%s] Starting MongoDB backup\n' "$(date -u +'%FT%TZ')"

  if mongodump \
    --host mongodb \
    --port 27017 \
    --username "$MONGO_ROOT_USERNAME" \
    --password "$MONGO_ROOT_PASSWORD" \
    --authenticationDatabase admin \
    --db aseman \
    --gzip \
    --archive="$raw_file"; then
    if openssl enc -aes-256-cbc -pbkdf2 -salt \
      -in "$raw_file" \
      -out "$encrypted_temporary_file" \
      -pass env:BACKUP_ENCRYPTION_KEY; then
      rm -f "$raw_file"
      mv "$encrypted_temporary_file" "$encrypted_file"
      printf '[%s] Encrypted MongoDB backup completed: %s\n' "$(date -u +'%FT%TZ')" "$encrypted_file"
    else
      rm -f "$raw_file" "$encrypted_temporary_file"
      printf '[%s] ERROR: MongoDB backup encryption failed\n' "$(date -u +'%FT%TZ')" >&2
      return 1
    fi
  else
    rm -f "$raw_file" "$encrypted_temporary_file"
    printf '[%s] ERROR: MongoDB backup failed\n' "$(date -u +'%FT%TZ')" >&2
    return 1
  fi

  printf '[%s] Starting uploads backup\n' "$(date -u +'%FT%TZ')"

  if tar -czf "$uploads_raw_file" -C /uploads .; then
    if openssl enc -aes-256-cbc -pbkdf2 -salt \
      -in "$uploads_raw_file" \
      -out "$uploads_encrypted_temporary_file" \
      -pass env:BACKUP_ENCRYPTION_KEY; then
      rm -f "$uploads_raw_file"
      mv "$uploads_encrypted_temporary_file" "$uploads_encrypted_file"
      printf '[%s] Encrypted uploads backup completed: %s\n' "$(date -u +'%FT%TZ')" "$uploads_encrypted_file"
    else
      rm -f "$uploads_raw_file" "$uploads_encrypted_temporary_file"
      printf '[%s] ERROR: Uploads backup encryption failed\n' "$(date -u +'%FT%TZ')" >&2
      return 1
    fi
  else
    rm -f "$uploads_raw_file" "$uploads_encrypted_temporary_file"
    printf '[%s] ERROR: Uploads archive creation failed\n' "$(date -u +'%FT%TZ')" >&2
    return 1
  fi

  find "$BACKUP_DIR" -maxdepth 1 -type f \
    \( -name 'aseman-*.archive.gz.enc' -o -name 'uploads-*.tar.gz.enc' \) \
    -mtime "+$BACKUP_RETENTION_DAYS" -delete
}

while true; do
  create_backup || true
  sleep "$BACKUP_INTERVAL_SECONDS"
done
