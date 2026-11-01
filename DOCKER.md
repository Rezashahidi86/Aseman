# Aseman Docker Guide

## Architecture

The production Compose stack contains:

- **frontend**: Vite production build served by Nginx.
- **backend**: Express API running on Node.js 24.
- **mongodb**: MongoDB 9.0.4 with authentication and a single-member replica set named `rs0`.
- **mongodb-init**: one-shot initialization service that creates the replica set before the API starts.

Only Nginx is published to the host, on `127.0.0.1:8080` by default. MongoDB is published only to the host loopback interface on port `27018` by default so MongoDB Compass can connect without exposing the database to the LAN or internet. The API is not published directly.

Persistent data is kept in three named volumes:

- `mongodb_data`: MongoDB database files.
- `mongodb_config`: MongoDB configuration database files.
- `uploads_data`: uploaded manual-document images under `/app/uploads`.

The local Windows MongoDB service and its data directory are not mounted into Docker and are not modified by this Compose stack.

## Prerequisites

- Docker Desktop with Docker Compose v2.
- A root `.env` file.
- MongoDB Database Tools on the host for backup and restore operations.

## Environment setup

Do not overwrite an existing `.env` file. If the project does not have one yet, copy the example:

```powershell
Copy-Item .env.example .env
```

Add the following variables to the root `.env` file and replace the example values. Keep passwords URL-safe (hexadecimal characters are suitable) because the backend MongoDB URI is assembled from the username and password.

```env
MONGO_ROOT_USERNAME=aseman_root
MONGO_ROOT_PASSWORD=REPLACE_WITH_LONG_RANDOM_HEX
MONGO_APP_USERNAME=aseman_app
MONGO_APP_PASSWORD=REPLACE_WITH_LONG_RANDOM_HEX
MONGO_REPLICA_SET_KEY=REPLACE_WITH_A_DIFFERENT_RANDOM_SECRET
MONGO_HOST_PORT=27018
APP_HOST_PORT=8080
DOCKER_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

Generate independent secrets in PowerShell:

```powershell
function New-HexSecret([int]$ByteCount = 32) {
  $bytes = New-Object byte[] $ByteCount
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  return ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
}

New-HexSecret
New-HexSecret
New-HexSecret
```

Use the three outputs for the root password, application password, and replica-set key respectively. Do not commit `.env` or share its contents.

The existing `DATABASE_URL` in `.env` may continue to point to the local Windows MongoDB for local development. Compose overrides it inside the backend container with the internal Docker hostname and the application database user.

## Validate and start

From the repository root:

```powershell
docker compose config
docker compose up -d --build
docker compose ps
```

Open the application at:

- http://localhost:8080

Useful diagnostics:

```powershell
docker compose logs -f mongodb
docker compose logs -f mongodb-init
docker compose logs -f backend
docker compose logs -f frontend
docker compose ps
```

The backend starts only after the MongoDB replica-set initialization service completes successfully and the API health check reports ready.

## MongoDB Compass

Connect to the Docker database using the root account:

```text
mongodb://aseman_root:YOUR_ROOT_PASSWORD@127.0.0.1:27018/?authSource=admin&directConnection=true
```

Replace the username/password with the values in your local `.env`. Keep `directConnection=true`: the replica set advertises the internal Docker hostname `mongodb:27017`, which is resolvable by containers but not by Windows applications.

The backend uses a separate least-privilege account with `readWrite` access only to the `aseman` database.

## Database migration: local MongoDB to Docker

**Migration is intentionally manual. No database import, drop, or migration runs during container startup.**

Before moving data:

1. Stop application writes or schedule a maintenance window.
2. Create a fresh, verified dump of the local `aseman` database.
3. Keep the original local MongoDB service and its data untouched.
4. Confirm the Docker MongoDB volume is the intended empty destination.
5. Restore only after reviewing the backup and explicitly approving the migration.

Example local backup from PowerShell:

```powershell
New-Item -ItemType Directory -Force .\backups | Out-Null
mongodump --uri="mongodb://127.0.0.1:27017/aseman?directConnection=true" --out ".\backups\aseman"
```

The dump should contain an `aseman` directory with BSON and metadata files. Check that it exists and is non-empty before considering it a usable backup.

After Docker is running, restore the dump to the Docker MongoDB using the application account or an appropriately authorized migration account. For example, with a URL-safe application password:

```powershell
mongorestore --uri="mongodb://aseman_app:YOUR_APP_PASSWORD@127.0.0.1:27018/aseman?authSource=aseman&directConnection=true" --nsInclude="aseman.*" ".\backups\aseman\aseman"
```

Do not add `--drop` unless a separately reviewed migration procedure explicitly requires it. Never run `docker compose down -v`; that removes named volumes and can permanently delete the Docker database and uploaded files.

After restore, compare every collection's document count and index definitions with the source. The current local database baseline observed during preparation was 9 collections, 35 documents, and 24 indexes. Counts can change as the application is used, so take a new source snapshot immediately before the actual migration.

## Uploaded files

Manual-document image binaries are stored on disk, while MongoDB stores their relative paths. The backend volume `uploads_data` persists the files independently of the backend container lifecycle.

Back up the MongoDB database and `uploads_data` together. A database dump alone does not contain the image files. Do not delete or recreate the uploads volume during deployment.

## Backups and restore

Backups must be created outside the application containers and stored outside the Docker volumes (preferably on a separate disk or remote backup destination). Back up:

- The `aseman` MongoDB database, including collection metadata and indexes.
- The `uploads_data` volume.
- The protected `.env` file separately, using secure secret storage.

Use a daily schedule and retain multiple generations (for example, 14 daily backups). Periodically perform a restore test into a separate, disposable environment. Do not treat a backup as verified until a restore test succeeds.

## VPS and HTTPS

For a VPS deployment, keep the Compose-published Nginx and MongoDB ports bound to loopback. Put a host-level reverse proxy (for example, Nginx or Caddy) in front of the frontend and terminate HTTPS there. Do not expose MongoDB port 27017 or the backend port 3000 publicly. Configure the production domain in `DOCKER_CORS_ORIGINS` and the TLS reverse proxy before public launch.

## Safe lifecycle commands

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose restart backend
docker compose stop
docker compose start
```

The following command is destructive and must not be used as routine cleanup:

```text
docker compose down -v
```
