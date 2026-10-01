import { createApp } from './app.js';
import { loadConfig } from './config/env.js';

const config = loadConfig();
const app = createApp(config);
const server = app.listen(config.PORT, config.HOST, () => {
  console.log('Portfolio API ready at http://' + config.HOST + ':' + config.PORT + '/api/health');
  if (!config.DATABASE_URL)
    console.log(
      'Database is not configured; database features will be added in the next backend phase.',
    );
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'Port ' +
          config.PORT +
          ' is already in use. Run npm run dev from the root to reuse the portfolio API.'
      : 'API startup failed: ' + error.message,
  );
  process.exitCode = 1;
});
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
  setTimeout(() => {
    server.closeAllConnections();
  }, 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
