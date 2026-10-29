# Frontend production deployment

## Build

From the repository root:

```bash
npm install
npm run build:frontend
```

Vite writes the production bundle to `frontend/dist`. Deploy the contents of that directory to the static hosting provider.

## Required environment variable

Set `VITE_API_BASE_URL` in the hosting provider's **build-time environment variables** to the public API base URL, including the API prefix. Example:

```text
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Replace the example with the actual HTTPS URL of this application's backend. Vite embeds this value in the generated frontend bundle, so rebuild after changing it. Do not put secrets in `VITE_*` variables; they are public in the browser.

The local fallback in `src/api/http.js` is intended for local development only. A production deployment must set `VITE_API_BASE_URL` explicitly.

## Hosting requirements

- Configure the static host to serve `index.html` as the fallback for unknown paths (SPA rewrite), so refreshing routes such as `/sales` or `/reports` does not return a host-level 404.
- Serve the frontend over HTTPS.
- Configure the backend CORS allowlist with the exact deployed frontend origin.
- Since the API client uses `withCredentials: true`, the backend must allow credentials and use a specific allowed origin, not `*`. Production cookie settings must be compatible with the frontend/API domains and HTTPS.
- Verify login, refresh, logout, branch selection, product search, barcode entry, sale confirmation, reports, and image/document upload on the deployed environment.
- Keep the backend API reachable from the browser; a private network address such as `127.0.0.1` is not a production API host.

## Verification

A GitHub Actions workflow builds the frontend when frontend files change. A successful build verifies bundling, not the production API configuration or the backend's CORS/cookie behavior; those require deployment-level checks.
