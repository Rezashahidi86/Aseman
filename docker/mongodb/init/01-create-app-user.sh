#!/bin/bash
set -Eeuo pipefail

: "${MONGO_APP_USERNAME:?MongoDB application username is required}"
: "${MONGO_APP_PASSWORD:?MongoDB application password is required}"
: "${MONGO_INITDB_DATABASE:?MongoDB initialization database is required}"

mongosh --quiet --eval '
const databaseName = process.env.MONGO_INITDB_DATABASE;
const username = process.env.MONGO_APP_USERNAME;
const password = process.env.MONGO_APP_PASSWORD;

const appDb = db.getSiblingDB(databaseName);
const roles = [{ role: "readWrite", db: databaseName }];

if (appDb.getUser(username)) {
  appDb.updateUser(username, { pwd: password, roles });
} else {
  appDb.createUser({
    user: username,
    pwd: password,
    roles
  });
}
'