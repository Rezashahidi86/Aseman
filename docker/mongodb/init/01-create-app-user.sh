#!/bin/bash
set -Eeuo pipefail

: "${MONGO_INITDB_ROOT_USERNAME:?MongoDB root username is required}"
: "${MONGO_INITDB_ROOT_PASSWORD:?MongoDB root password is required}"
: "${MONGO_APP_USERNAME:?MongoDB application username is required}"
: "${MONGO_APP_PASSWORD:?MongoDB application password is required}"
: "${MONGO_INITDB_DATABASE:?MongoDB initialization database is required}"

mongosh --quiet \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  "$MONGO_INITDB_DATABASE" \
  --eval "
db.createUser({
  user: '$MONGO_APP_USERNAME',
  pwd: '$MONGO_APP_PASSWORD',
  roles: [{ role: 'readWrite', db: '$MONGO_INITDB_DATABASE' }]
});
"
