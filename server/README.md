# Portfolio API

The Express/TypeScript API foundation is now implemented and can run independently of a database.

From the repository root:

```sh
npm run dev:server
```

Or use `npm run dev` to start/reuse both the client and API. Health: http://127.0.0.1:3001/api/health.

Available routes:

- `GET /`: redirects to the health endpoint.
- `GET /api/health`: reports service uptime and the honest database configuration/connection state.
- Unknown routes return a consistent JSON 404.

Security includes Helmet, an exact CORS frontend origin, a 16 KB JSON body limit, environment validation, and sanitized JSON errors. There are no public POST operations yet; rate limits arrive with those routes.

`server/.env` is loaded relative to this workspace regardless of the current working directory. No environment file is required for local defaults. Copy `.env.example` when changing the host, port, or allowed frontend origin.

**The database is not connected yet.** Projects, experience, migrations, contact storage, and admin authentication remain in the planned backend phases. The health endpoint never claims that a configured URL proves a working connection.

Production commands from the root:

```sh
npm run build --workspace @portfolio/server
npm run start --workspace @portfolio/server
```

Set `HOST=0.0.0.0` for a hosted deployment; keep server secrets out of the client. Run `npm test --workspace @portfolio/server` for the API tests.
