# Aseman deployment

## Requirements

- Node.js version supported by the installed dependencies (use the same major version in local development and hosting).
- A MongoDB deployment reachable by the backend, such as MongoDB Atlas.
- A frontend static host and a backend Node.js host. Configure both hosts independently; no specific hosting provider is assumed.

## Backend environment

Set these variables in the backend host's secret/environment settings. Do not commit `.env` files or production credentials.

- `NODE_ENV=production`
- `PORT` to the port supplied by the hosting platform (if applicable)
- `DATABASE_URL` to the MongoDB connection string
- `CORS_ORIGINS` to the exact comma-separated frontend origin(s), without trailing slashes
- `JWT_SECRET` to a random secret of at least 32 characters
- `JWT_EXPIRES_IN` to the desired token lifetime
- `SMS_API_KEY` and `SMS_SENDER` only when SMS delivery is configured

The application reads the root `.env` file in local environments. Production hosts should inject environment variables through their secure configuration interface.

## Initial data

Create branches using `npm run seed:branches` when the database has no branch records. Create the initial administrator using `npm run seed:admin` with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` set securely. The admin seed only creates a user when that email does not already exist; it does not reset an existing password. Run seed commands intentionally against the target database.

Run data/index migration scripts only when their purpose applies to the target database:

- `npm run migrate:drop-product-name-unique-index`
- `npm run migrate:reference-catalog-barcode-index`
- `npm run rebuild:sales-stats`

Back up production data before migrations or rebuild operations.

## Frontend environment and build

Set `VITE_API_BASE_URL` at build time to the full backend API prefix, for example `https://api.example.com/api/v1`. `VITE_*` values are embedded in the browser bundle and must never contain secrets.

From the repository root:

```sh
npm install
npm run lint
npm test
npm run build:frontend
```

Publish the generated `frontend/dist` directory on a static host. Configure the host to rewrite application routes to `index.html` so refreshes on routes such as `/products` and `/reports` reach the SPA entry point. Keep the API host separate from this fallback rule.

## Security and verification checklist

- Use HTTPS for the frontend and backend.
- Configure `CORS_ORIGINS` with only trusted frontend origins.
- Use a unique production `JWT_SECRET` and strong admin credentials.
- Restrict MongoDB network access and use a database user with only the required privileges.
- Verify cookie behavior against the actual frontend/backend domains and hosting topology; cross-site cookies may require `Secure` and `SameSite=None` configuration.
- Confirm uploaded manual documents are stored in persistent private/object storage in production. The local `uploads` directory is not guaranteed to persist on ephemeral hosts.
- Verify health, login, seller branch isolation, sale confirmation, reports, and file upload/download on the deployed environment before using real data.
- Configure backups, log retention, and monitoring at the hosting provider.

A successful local build does not by itself prove production deployment readiness. Test the actual hosting configuration and database connectivity separately.
