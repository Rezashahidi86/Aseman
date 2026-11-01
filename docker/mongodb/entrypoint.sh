#!/bin/bash
set -Eeuo pipefail

: "${MONGO_REPLICA_SET_KEY:?MONGO_REPLICA_SET_KEY must be set}"

key_file="$(mktemp /tmp/aseman-mongodb-keyfile.XXXXXX)"
printf '%s' "$MONGO_REPLICA_SET_KEY" > "$key_file"
chmod 400 "$key_file"
chown mongodb:mongodb "$key_file"

exec /usr/local/bin/docker-entrypoint.sh mongod \
  --replSet rs0 \
  --bind_ip_all \
  --keyFile "$key_file"
