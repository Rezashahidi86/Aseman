# Aseman

Aseman is a multi-branch business management application built to help teams manage products, inventory, customers, sales, reference pricing, documents, and operational reports from one place.

The application is designed around branch-level data access: sellers work within their own branch, while administrators can manage branches and view consolidated information.

## Overview

Aseman consists of a React frontend, an Express API, and a MongoDB database. The repository includes a Docker Compose setup for running the complete application and its supporting services.

### Main capabilities

- **Multi-branch management** — branch-aware access and operations.
- **Role-based access control** — administrator and seller roles, with server-side branch restrictions.
- **Product and inventory management** — product catalog, stock quantities, barcode support, and branch-scoped product records.
- **Reference price catalog** — an independent catalog for reference purchase and sale prices; it does not automatically synchronize with branch products.
- **Sales workflow** — basket-based sales, price handling, saved purchase-price data for profit calculations, and printable receipts.
- **Customer management** — branch-scoped customer records and SMS communication.
- **Manual documents** — document records with optional image attachments; supported images are optimized to WebP when uploaded.
- **Reports** — branch and sales reporting with Persian/Jalali date support.
- **Authentication and account management** — JWT-based authentication, profile and credential management, and password recovery.
- **Automated backups** — scheduled, encrypted MongoDB and uploaded-file backups with configurable retention.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4 |
| Backend | Node.js (22.12+), Express 5, Mongoose 9 |
| Database | MongoDB 9 with Replica Set |
| Validation | Zod |
| Authentication | JWT, bcryptjs |
| Upload processing | Multer, Sharp |
| Charts and notifications | Recharts, Sonner |
| Testing | Vitest |
| Infrastructure | Docker, Docker Compose, Nginx |

## Repository structure

```text
.
├── backend/             # Express API, models, controllers, middleware and tests
├── frontend/            # React application
├── docker/              # Dockerfiles and MongoDB/backup initialization scripts
├── scripts/             # Project utility scripts
├── uploads/             # Local upload storage (runtime data; not source code)
├── backups/              # Local backup output (runtime data; not source code)
├── docker-compose.yml    # Multi-service Docker Compose configuration
├── DOCKER.md             # Detailed Docker setup and operations guide
└── .env.example          # Environment variable template
```

## Getting started with Docker

Docker Compose is the recommended way to run the complete stack. The Docker setup starts MongoDB, its one-time Replica Set initializer, the API, the frontend served by Nginx, and the backup worker.

### Requirements

- Docker Engine
- Docker Compose plugin
- Git

Node.js and MongoDB do not need to be installed separately on the host when using the Docker setup.

### 1. Clone the repository

```bash
git clone https://github.com/Rezashahidi86/Aseman.git
cd Aseman
```

### 2. Configure environment variables

Copy the example file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS**
```bash
cp .env.example .env
```

Edit `.env` and set strong, unique values for all required secrets and credentials. In particular, configure the JWT secret, MongoDB root and application credentials, Replica Set key, initial administrator credentials, and backup encryption key.

Never commit the real `.env` file or share its contents. Keep the backup encryption key safe and separate: encrypted backups cannot be restored without it.

### 3. Validate and start

```bash
docker compose config --quiet
docker compose up -d --build
```

Check service status:

```bash
docker compose ps -a
```

The MongoDB initializer is a one-time service and is expected to exit successfully after initialization. MongoDB, backend, and frontend should become healthy; the backup worker should remain running.

### 4. Create the initial administrator

The Docker database starts empty. Configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your local `.env` file, then follow the **Create the initial administrator** instructions in [DOCKER.md](DOCKER.md).

### 5. Open the application

By default, the frontend is available at:

`http://localhost:8080`

For detailed setup, administrator seeding, environment variables, service operations, backup handling, and troubleshooting, see **[DOCKER.md](DOCKER.md)**.

## Development

The frontend and backend have separate package manifests and lockfiles.

### Backend

```bash
cd backend
npm ci
npm run dev
```

The backend requires a reachable MongoDB instance and the environment variables described in the root `.env.example`. The backend package requires Node.js 22.12 or newer.

Run backend tests:

```bash
npm test
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

The frontend uses Vite. Configure its API base URL according to the development environment before running it.

## Data persistence and backups

Docker Compose uses persistent volumes for MongoDB data, MongoDB configuration, and uploaded files:

- `mongodb_data`
- `mongodb_config`
- `uploads_data`

The backup worker creates encrypted MongoDB and uploaded-file archives. The default interval is 24 hours and the default retention period is 14 days. These values can be changed with `BACKUP_INTERVAL_SECONDS` and `BACKUP_RETENTION_DAYS`.

Backups stored only on the same VPS do not protect against loss of that VPS. Copy important backup archives to separate, access-controlled storage and retain the encryption key securely.

**Destructive operation warning:** Do not use `docker compose down -v` as a routine stop or update command. It removes Docker volumes and can permanently delete the database and uploaded files.

## Security notes

- Keep secrets in an untracked `.env` file; use `.env.example` only as a template.
- Use strong, unique credentials for MongoDB, JWT signing, the Replica Set, and backup encryption.
- Do not expose MongoDB directly to the public internet. The Compose configuration binds its host port to loopback by default.
- Use HTTPS in public deployments and configure the production frontend URL and allowed CORS origins.
- Restrict server access, keep the operating system and Docker updated, and store off-server backups.
- Test the restore process periodically; a backup is only useful if it can be restored.

## Deployment

The repository includes a Docker Compose deployment suitable as a foundation for a VPS installation. A public production deployment additionally requires domain and DNS configuration, HTTPS, firewall rules, secure environment configuration, and off-server backup storage.

See [DOCKER.md](DOCKER.md) for the current Compose architecture and operational commands.

## License

No license has been specified for this repository. All rights are reserved unless a license is added by the project owner.
