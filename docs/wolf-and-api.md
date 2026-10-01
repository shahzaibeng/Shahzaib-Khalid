# Wolf, full-width layout, and API update

This update follows the request to redesign the logo, replace the hero object with a sitting wolf, fill the browser width, and run the backend. It does not complete the remaining portfolio content or database phases.

## Run

From the root, use `npm run dev`. It starts missing services and reuses this portfolio’s already-running services.

- Frontend: http://127.0.0.1:5173
- API health: http://127.0.0.1:3001/api/health

## What changed

| File                                                   | Purpose                                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `client/src/components/Logo.tsx`                       | New interlocking SK mark with a clay accent.                                                                                |
| `client/public/favicon.svg`                            | Matching icon for browser tabs.                                                                                             |
| `client/src/components/hero/HeroObject.tsx`            | Cursor tracking, click reactions, accessible buttons, lazy loading, and pause/visibility handling.                          |
| `client/src/components/hero/HeroScene.tsx`             | Builds the sitting 3D wolf from native meshes and animates its head, eyes, and tail.                                        |
| `client/src/components/hero/HeroSceneFallback.tsx`     | Lightweight SVG wolf for small screens, reduced motion, low-power devices, and unavailable WebGL.                           |
| `client/src/components/hero/SceneErrorBoundary.tsx`    | Keeps a scene error from breaking the portfolio.                                                                            |
| `client/src/components/hero/wolf.ts`                   | Shared expression names for the 3D and SVG versions.                                                                        |
| `client/src/hooks/useSceneCapability.ts`               | Reads screen size, device hints, data-saving preference, reduced motion, and tab visibility.                                |
| `client/src/pages/HomePage.tsx`                        | Places the interactive wolf in the hero.                                                                                    |
| `client/src/styles/globals.css`                        | Removes the fixed page-width cap and styles the wolf, controls, and mobile layout.                                          |
| `client/index.html`                                    | Adds an invisible application identifier so the launcher can recognize this app.                                            |
| `client/vite.config.ts`                                | Proxies local API requests to the server.                                                                                   |
| `client/.env.example`                                  | Documents the local API proxy URL.                                                                                          |
| `scripts/dev.mjs`                                      | Starts both apps without duplicating verified existing portfolio processes.                                                 |
| `scripts/check-enhancements.mjs`                       | Verifies visible movement, head tracking, click reactions, full-width layout, fallbacks, and API connectivity in a browser. |
| `server/src/app.ts`                                    | Creates the Express app, health route, CORS policy, and security middleware.                                                |
| `server/src/index.ts`                                  | Starts the API and shuts it down cleanly.                                                                                   |
| `server/src/config/env.ts`                             | Loads and validates server environment settings without printing secrets.                                                   |
| `server/src/lib/AppError.ts`                           | Represents deliberate API errors.                                                                                           |
| `server/src/middleware/errorHandler.ts`                | Produces safe, consistent JSON errors.                                                                                      |
| `server/tests/api.test.ts`                             | Checks health, honest database reporting, CORS, malformed/oversized requests, and error privacy.                            |
| `server/tsconfig.json`                                 | Type-checks the server and tests.                                                                                           |
| `server/tsconfig.build.json`                           | Compiles only server source into `server/dist/`.                                                                            |
| `server/vitest.config.ts`                              | Configures API tests.                                                                                                       |
| `server/.env.example`                                  | Documents local API defaults and future database configuration.                                                             |
| `server/README.md`                                     | Explains API commands and current endpoint scope.                                                                           |
| Root/client/server `package.json`, `package-lock.json` | Record dependencies and development/check commands.                                                                         |
| `eslint.config.js`                                     | Allows browser globals in browser-verification callbacks.                                                                   |
| `README.md`                                            | Describes current setup, interactions, environment variables, and roadmap.                                                  |
| `docs/screenshots/wolf-*.png`                          | Show the updated desktop and mobile layouts.                                                                                |

## Wolf appearance

The wolf is a cute anime pup with chibi proportions, cream-and-blue fur, rosy cheeks, sparkling golden eyes, a small muzzle, tiny paws, and a curled wagging tail. `HeroScene.tsx` uses a three-step cel-shading texture and subtle outlines for the anime appearance; `wolfGeometry.ts` shares the tail profile. The mobile SVG follows the same character design. `Fireflies.tsx` adds 22 softly glowing jugnu with independent drift and flicker against a moonlit backdrop. All continuous motion pauses with the control, when offscreen, or when the tab is hidden. Reduced-motion mode keeps the lights static.

## Interaction details

The wolf looks toward the pointer while its body stays seated. Single-click produces a happy expression, double-click a curious tilt, and right-click a surprised expression. Buttons provide the same actions for keyboard and touch. Reactions return to calm after five seconds.

Pause stops head tracking and continuous animation. Reduced-motion mode avoids WebGL and continuous animation. Explicit expression changes still work. The renderer also stops when the figure leaves view or the browser tab is hidden.

## Backend scope

The Express API is real and running. Its health response intentionally reports `database.connected: false`: PostgreSQL tables, migrations, project data, contact persistence, and admin features have not been implemented yet. A configured connection string alone is never presented as a successful database connection.

## Checks

Run `npm run check` for lint, type checking, formatting, eight API tests, and both production builds.

Run `npm run check:enhancements` while the apps are running for twelve browser checks. The existing `npm run check:browser` covers navigation and theme behavior against the production preview.

Suggested commit:

```text
feat: add cute anime wolf with glowing fireflies
```
