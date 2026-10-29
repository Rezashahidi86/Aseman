# Backend pre-deployment checklist

## Required environment

Copy `.env.example` to `.env` for local work and provide production values through the hosting provider's secret/environment settings. Never commit `.env`.

Required variables:
- `NODE_ENV=production`
- `PORT` (provided by the host when applicable)
- `DATABASE_URL`
- `CORS_ORIGINS` (comma-separated exact frontend origins; no trailing slash unless the origin itself requires it)
- `JWT_SECRET` (random secret with at least 32 characters)
- `JWT_EXPIRES_IN`

Configure SMS credentials only when SMS is enabled.

## Checks before deployment

1. Install dependencies and generate/commit the lockfile with the project's supported Node.js version.
2. Run `npm test` and `npm run lint`; fix all failures before deploying.
3. Confirm MongoDB supports transactions. Sales registration uses MongoDB transactions, so use MongoDB Atlas or a replica-set deployment, not a standalone MongoDB server.
4. Back up the database before rebuilding sales statistics.
5. If sales already exist, run `npm run rebuild:sales-stats` once before opening the new version to users. It rebuilds daily and monthly derived statistics from the sale records using the Tehran business timezone. It refuses to run when no sales exist.
6. Ensure `uploads/manual-documents` is on persistent storage. Uploaded accounting documents are stored on the server filesystem; ephemeral container filesystems can lose them after restart or redeployment.
7. Set `CORS_ORIGINS` to the deployed frontend origin and verify login, logout, seller branch isolation, product stock, sale idempotency, and reports using production-like data.

## Current deployment blockers to close

- The repository did not contain a package lockfile at the time of this audit; reproducible dependency installation is not yet guaranteed.
- Automated test and lint commands have not been executed in this environment.
- Persistent storage for manual-document images depends on the selected hosting provider and must be confirmed before launch.
