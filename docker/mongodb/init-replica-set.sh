#!/bin/bash
set -Eeuo pipefail

: "${MONGO_INITDB_ROOT_USERNAME:?MongoDB root username is required}"
: "${MONGO_INITDB_ROOT_PASSWORD:?MongoDB root password is required}"

mongo_args=(
  --host mongodb:27017
  --username "$MONGO_INITDB_ROOT_USERNAME"
  --password "$MONGO_INITDB_ROOT_PASSWORD"
  --authenticationDatabase admin
  --quiet
)

until mongosh "${mongo_args[@]}" --eval 'db.adminCommand({ ping: 1 }).ok' 2>/dev/null | grep -q 1; do
  sleep 2
done

mongosh "${mongo_args[@]}" --eval '
try {
  rs.status();
} catch (error) {
  if (error.code === 94 || error.codeName === "NotYetInitialized") {
    rs.initiate({
      _id: "rs0",
      members: [{ _id: 0, host: "mongodb:27017" }]
    });
  } else {
    throw error;
  }
}

while (!db.hello().isWritablePrimary) {
  sleep(1000);
}
'
