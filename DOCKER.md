# Running Aseman with Docker

This guide explains how to run the complete Aseman application on another computer using Docker Compose. You do not need to install Node.js or MongoDB separately on the host; the application services and database run in separate containers.

> Run all commands from the repository root, where `docker-compose.yml` is located. The examples in this guide use Windows PowerShell.

## 1. Prepare the environment file

If you do not have a `.env` file yet, copy the example file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure the values below. Never publish real passwords or secret keys on GitHub, in chats, or share them with other people.

### Required variables

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign authentication tokens; use at least 32 random, unpredictable characters |
| `MONGO_ROOT_USERNAME` | MongoDB administrative username |
| `MONGO_ROOT_PASSWORD` | MongoDB administrative password |
| `MONGO_APP_USERNAME` | Restricted MongoDB user used by the Backend to connect to the database |
| `MONGO_APP_PASSWORD` | Application database user's password |
| `MONGO_REPLICA_SET_KEY` | Secret key used for Replica Set member authentication |
| `ADMIN_NAME` | Initial administrator's name |
| `ADMIN_EMAIL` | Initial administrator's email address |
| `ADMIN_PASSWORD` | Initial administrator's password |

Generate independent random values for the MongoDB passwords and the Replica Set key. In PowerShell, run the following command separately for each value:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
```

Run this command three times and use a different output for each of these variables: `MONGO_ROOT_PASSWORD`, `MONGO_APP_PASSWORD`, and `MONGO_REPLICA_SET_KEY`.

Set `JWT_SECRET` to a separate random value of at least 32 characters. Choose a strong, unique administrator password.

### Optional variables and ports

- `APP_HOST_PORT=8080`: Port used to access the frontend on the host.
- `MONGO_HOST_PORT=27018`: Host port for local MongoDB connections.
- `DOCKER_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080`: Allowed frontend origins.
- `JWT_EXPIRES_IN=7d`: Token expiration period.
- `SMS_API_KEY` and `SMS_SENDER`: SMS provider credentials; configure valid values if you intend to use SMS functionality.\n- `BACKUP_INTERVAL_SECONDS=86400`: Time between automatic database backups (24 hours).\n- `BACKUP_RETENTION_DAYS=14`: Backup retention period.

Keep the default ports unless another application is already using them. If you change a port, use the new port when opening the frontend.

The example file may contain `NODE_ENV` and `DATABASE_URL` values intended for local development. In Docker, Compose supplies `NODE_ENV=production` and the internal Docker database URL to the Backend. The local Windows database URL is therefore not used by the Docker Backend.

## 2. Validate the configuration and start the application

Make sure your `.env` file is complete. From the repository root, run:

```powershell
docker compose config --quiet
```

If the command completes without errors, build the images and start the services:

```powershell
docker compose up -d --build
```

Check the service status:

```powershell
docker compose ps -a
```

The main services should reach the `healthy` state:

- `mongodb`: MongoDB database.
- `backend`: Application API.
- `frontend`: Web interface served by Nginx.

The `mongodb-backup` service should remain running. It creates its first backup shortly after MongoDB becomes healthy, then repeats every 24 hours by default.\n\nThe `mongodb-init` service runs only once. After successful execution, the `Exited (0)` status is expected. This service initializes the Replica Set.

When the services are healthy, open the application:

- http://localhost:8080

## 3. Create the initial administrator in the Docker database

The database starts empty, so you must create an initial administrator before signing in. The project already includes this script:

`backend/scripts/seedAdmin.js`

First, make sure MongoDB and the Backend are running:

```powershell
docker compose ps
```

Then run the following command in PowerShell from the repository root. It reads only the three administrator variables from your local `.env` file and passes them only to the temporary seed container. These values are not added to the permanent Backend service environment.

```powershell
$adminKeys = @('ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

foreach ($key in $adminKeys) {
    [Environment]::SetEnvironmentVariable($key, $null, 'Process')
}

Get-Content .env | ForEach-Object {
    if ($_ -match '^(ADMIN_NAME|ADMIN_EMAIL|ADMIN_PASSWORD)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2].Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

foreach ($key in $adminKeys) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key, 'Process'))) {
        throw "The $key variable is not configured in .env."
    }
}

docker compose run --rm --no-deps -e ADMIN_NAME -e ADMIN_EMAIL -e ADMIN_PASSWORD backend node backend/scripts/seedAdmin.js
```

On success, the following message is displayed:

```text
Admin seed completed successfully
```

You can now sign in to the application using the email address and password configured in `.env`.

**Important notes about administrator creation:**

- Run this for a fresh database, and normally only once.
- Use an email address that is not already assigned to another user in the database.
- If the email already exists, the script changes that existing user's role to ADMIN. Do not run it with the email address of an existing seller or other user.
- Running the script again does not change the password of an existing user; the password is stored only when a new record is created.
- After creating the administrator, sign in with the same email address and password configured in `.env`. Do not share your `.env` file.

## 4. Service access and communication

- Frontend URL: `http://localhost:8080`
- The Backend is accessible to the Frontend through the internal Docker network. Port 3000 is not published directly on the host.
- By default, MongoDB is published only on the host's `127.0.0.1:27018` interface. It is not accessible from the internet or other devices on the network.
- The Backend connects to the `aseman` database using a separate MongoDB account with `readWrite` access; it does not use the root account.

### Optional: connect with MongoDB Compass

To inspect the Docker database using Compass, use the following local connection string and replace the username and password with your actual root credentials from your own `.env` file:

```text
mongodb://MONGO_ROOT_USERNAME:MONGO_ROOT_PASSWORD@127.0.0.1:27018/?authSource=admin&directConnection=true
```

The `directConnection=true` option is required because the Replica Set advertises the internal hostname `mongodb:27017`, which cannot be resolved by applications running directly on the host.

## 5. Everyday commands

Check service status:

```powershell
docker compose ps
```

View logs from all services:

```powershell
docker compose logs --tail 100
```

View logs for an individual service:

```powershell
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend
docker compose logs --tail 100 mongodb
docker compose logs mongodb-init
```

Follow Backend logs in real time:

```powershell
docker compose logs -f backend
```

Restart a service:

```powershell
docker compose restart backend
```

Stop services without deleting containers or volumes:

```powershell
docker compose stop
```

Start stopped services again:

```powershell
docker compose start
```

Apply code changes and rebuild the images:

```powershell
docker compose up -d --build
```

To apply changes to `.env`, recreate the relevant containers:

```powershell
docker compose up -d --force-recreate backend frontend
```

If you change MongoDB credentials or the Replica Set key, first review the impact on the existing database. Changing values in `.env` alone does not necessarily update credentials already stored inside MongoDB.

## 6. Database and uploaded files

Persistent data is stored in Docker named volumes:

- `mongodb_data`: Main database files.
- `mongodb_config`: MongoDB configuration database files.
- `uploads_data`: Files uploaded by the application.

Rebuilding images or recreating containers with the normal commands above does not remove these volumes. The Docker database is independent of MongoDB installed on Windows or the host machine. No data is automatically copied from the host's local database into the Docker database.

**Important warning:** The following command removes the volumes, including the database and uploaded files. Do not use it for routine stopping, updating, or cleanup:

```powershell
docker compose down -v
```

If the application contains important data, create backups of both the database and the uploaded-files volume before maintenance or migration. Store backups outside the Docker volumes, preferably in a separate location.

## 7. Automatic MongoDB backups

The `mongodb-backup` service creates a compressed archive of the `aseman` database immediately after it starts, then repeats the backup every 24 hours by default.

Backups are written to the host directory:

```text
backups/mongodb/
```

The default retention period is 14 days. Older backup archives are removed after a successful backup. The backup worker uses the MongoDB root credentials only inside its own container; these credentials are not passed to the permanent Backend container.

Check the backup worker:

```powershell
docker compose ps mongodb-backup
docker compose logs --tail 100 mongodb-backup
Get-ChildItem .\\backups\\mongodb
```

The backup directory is excluded from Git. Keep it private and do not upload backup archives to GitHub or share them in chats. These archives contain application data and are not encrypted by this local backup worker. Protect the host account and disk, and copy important backups to a separate, access-controlled storage location. A backup stored only on the same computer does not protect against loss of that computer.

Do not consider the backup process production-ready until a restore test has been completed successfully. The restore verification procedure will be added alongside the restore-test task.

## 8. Troubleshooting

### Services do not become healthy

Check the status and logs of the affected services:

```powershell
docker compose ps -a
docker compose logs --tail 150 mongodb
docker compose logs --tail 150 mongodb-init
docker compose logs --tail 150 backend
docker compose logs --tail 150 frontend
```

### Missing environment variable or "Set variable" error

Check your `.env` file. Required values must be present. Do not leave example placeholders such as `replace-this` or empty passwords in place.

### A port is already in use

If port 8080 or 27018 is occupied, change `APP_HOST_PORT` or `MONGO_HOST_PORT` in `.env`, then recreate the relevant services.

### Administrator sign-in fails

- Make sure the seed script displayed its success message.
- Sign in using the same email address and password configured in `.env` when the seed script was run.
- Check the Backend logs:

```powershell
docker compose logs --tail 100 backend
```

### Code changes do not appear in the website

Files on the host are not automatically updated inside the Production images. After changing code, rebuild the images:

```powershell
docker compose up -d --build
```

## 9. Security notes when sharing the project for review

- Never commit your real `.env` file to GitHub or send it to the reviewer.
- Keep only `.env.example` in the repository. It must not contain real passwords or secret keys.
- Each person should create their own `.env` file on their own computer, with independent passwords and secrets.
- Each computer has its own independent Docker database, so the initial administrator must be created in that computer's database.
- Read access to the GitHub repository is sufficient for code review. Running the application locally does not require access to your GitHub account or your `.env` file.
- This Compose setup is prepared for local execution and testing with the application configured for Production mode. Public deployment on a VPS additionally requires a domain, HTTPS, firewall rules, and secure secret management.
