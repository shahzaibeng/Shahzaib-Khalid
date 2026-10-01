# Phase 1 — Foundation

The portfolio now has a working frontend shell, shared theme, original SK identity, responsive navigation, and footer. The backend workspace is reserved for Phase 4.

## Run it

From the project root:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. No database or environment values are needed yet.

For verification:

```sh
npm run check
npx playwright install chromium
npm run check:browser
```

The browser check uses the built app and must run after `npm run check` or `npm run build`. An installed Chrome can be selected with the `PORTFOLIO_BROWSER_CHANNEL=chrome` environment variable; see the root README for PowerShell instructions.

## What each file does

Paths below are relative to the project root.

### Workspace and tooling

| File                           | Plain-English purpose                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `package.json`                 | Connects the client/server workspaces and provides root commands.                                |
| `package-lock.json`            | Records the exact dependency versions for repeatable installation.                               |
| `.gitignore`                   | Keeps dependencies, builds, secrets, and local artifacts out of Git.                             |
| `.gitattributes`               | Keeps text line endings consistent across Windows and other systems.                             |
| `.editorconfig`                | Gives editors consistent indentation and line-ending settings.                                   |
| `.nvmrc`                       | Records Node.js 24 as the project’s preferred runtime.                                           |
| `.prettierrc.json`             | Defines the automatic formatting style.                                                          |
| `.prettierignore`              | Excludes generated files from formatting.                                                        |
| `eslint.config.js`             | Checks JavaScript, TypeScript, and React code for common mistakes.                               |
| `tsconfig.base.json`           | Shares strict TypeScript options between applications.                                           |
| `README.md`                    | Explains setup, commands, configuration, progress, and deployment plans.                         |
| `docs/phase-1.md`              | This phase’s learning guide and file inventory.                                                  |
| `docs/screenshots/.gitkeep`    | Keeps a place for future documentation screenshots in Git.                                       |
| `scripts/check-foundation.mjs` | Starts a preview, checks real browser interactions, captures screenshots, and stops the preview. |

### Client configuration and public assets

| File                          | Plain-English purpose                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| `client/package.json`         | Lists frontend dependencies and client commands.                       |
| `client/.env.example`         | Documents the future public API address without storing secrets.       |
| `client/index.html`           | Supplies the HTML shell, initial title, description, and favicon link. |
| `client/tsconfig.json`        | Checks TypeScript used by the browser.                                 |
| `client/tsconfig.node.json`   | Checks TypeScript used by the build configuration.                     |
| `client/vite.config.ts`       | Enables React and defines predictable dev/preview ports.               |
| `client/tailwind.config.ts`   | Maps the color variables and font families to Tailwind classes.        |
| `client/postcss.config.js`    | Runs Tailwind and browser-prefix processing for CSS.                   |
| `client/public/favicon.svg`   | Uses the SK monogram as a browser icon that follows the device theme.  |
| `client/public/theme-init.js` | Applies the initial theme before the page paints.                      |

### React application

| File                                     | Plain-English purpose                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `client/src/main.tsx`                    | Loads fonts/styles and mounts the React application.                                                         |
| `client/src/App.tsx`                     | Defines the home route and the unknown-page fallback.                                                        |
| `client/src/vite-env.d.ts`               | Adds Vite’s browser/build types to TypeScript.                                                               |
| `client/src/config/site.ts`              | Holds your personal content, navigation labels, account URLs, and resume availability.                       |
| `client/src/styles/globals.css`          | Defines both exact palettes, responsive layouts, shared controls, focus states, and reduced-motion behavior. |
| `client/src/lib/theme.ts`                | Reads theme preferences and updates the page’s colors.                                                       |
| `client/src/providers/theme-context.ts`  | Defines the shared theme values that React components can access.                                            |
| `client/src/providers/ThemeProvider.tsx` | Handles system changes, saved choices, storage failures, and synchronization between tabs.                   |
| `client/src/providers/AppProviders.tsx`  | Wraps the app with routing and theme support.                                                                |
| `client/src/hooks/useTheme.ts`           | Lets components read or change the shared theme.                                                             |
| `client/src/components/Logo.tsx`         | Draws the original SK monogram using the active theme color.                                                 |
| `client/src/components/Layout.tsx`       | Places the navbar/footer around pages and handles section scrolling/focus.                                   |
| `client/src/components/Navbar.tsx`       | Provides sticky desktop navigation and an accessible mobile disclosure menu.                                 |
| `client/src/components/Footer.tsx`       | Shows the brand, account icons, current copyright year, and device-theme reset.                              |
| `client/src/components/ThemeToggle.tsx`  | Switches between light and dark with an accessible button.                                                   |
| `client/src/components/ResumeLink.tsx`   | Activates the resume link after your PDF is supplied and enabled.                                            |
| `client/src/components/SocialLinks.tsx`  | Displays all ten brand icons and safely activates configured account links.                                  |
| `client/src/pages/HomePage.tsx`          | Displays the initial introduction, static identity artwork, and honest section placeholders.                 |
| `client/src/pages/NotFoundPage.tsx`      | Gives unknown URLs a styled explanation and a route home.                                                    |

### Server workspace

| File                  | Plain-English purpose                                        |
| --------------------- | ------------------------------------------------------------ |
| `server/package.json` | Reserves the API as an npm workspace.                        |
| `server/.env.example` | Documents initial server/database configuration for Phase 4. |
| `server/README.md`    | Explains that the API is planned and not running yet.        |

Generated `node_modules/`, `client/dist/`, and `.artifacts/` are local installation/build/check outputs, not application source.

## Deliberate phase boundaries

- The identity artwork is a lightweight static SVG. The lazy-loaded 3D scene arrives in Phase 3.
- About, Skills, Projects, Blog, and Contact currently have labeled placeholders with working anchors. Full sections arrive in Phase 2.
- Profile destinations and email are not invented. Replace bracketed values in `site.ts` to activate them.
- Add `client/public/resume.pdf`, then set `site.resume.available = true`.
- A small fallback page is present already so unknown routes do not produce a blank screen.
- Backend features, automated unit/API suites, CI, and production deployment remain in their scheduled phases.

## Browser acceptance checks

The reproducible browser script checks:

1. Desktop rendering, local fonts, exact light colors, and safe placeholder destinations.
2. System-theme changes, explicit preferences, reload persistence, and exact dark colors.
3. Cross-tab theme updates and returning to the device theme.
4. Keyboard skip navigation and focus after section-link activation.
5. Mobile keyboard navigation, Escape, link selection, and desktop/mobile resizing.
6. No horizontal overflow at 320, 375, 768, 1024, or 1440 pixels.
7. Reduced-motion scrolling and unknown-route recovery.
8. Continued operation when browser storage is blocked.
9. Absence of console errors, uncaught browser errors, and failed HTTP responses.

Lighthouse scoring and the complete accessibility audit remain in Phase 8; these checks are not a Lighthouse certification.

## Verified result

Lint, strict TypeScript checks, formatting, and the production build pass. All nine browser checks pass in headless Chrome. Desktop light, desktop dark, and mobile screenshots are included under `docs/screenshots/`; these PNG files document the verified layouts.

## Suggested commit

```text
feat: scaffold portfolio and themed layout
```

Stop here before starting Phase 2, as requested in the project brief.
