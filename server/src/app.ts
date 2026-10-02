import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { ServerConfig } from './config/env.js';
import { AppError } from './lib/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { contactRouter } from './routes/contact.js';

export function createApp(config: ServerConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin proxies and server-to-server probes may have no Origin header.
        if (!origin || origin === config.FRONTEND_ORIGIN) callback(null, true);
        else callback(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '16kb' }));
  app.get('/', (_request, response) => {
    response.redirect('/api/health');
  });
  app.get('/api/health', (_request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.json({
      status: 'ok',
      service: 'portfolio-api',
      uptime: Math.floor(process.uptime()),
      database: {
        configured: Boolean(config.DATABASE_URL),
        connected: false,
        status: config.DATABASE_URL ? 'not_connected' : 'not_configured',
      },
    });
  });
  app.use(contactRouter(config));
  app.use((_request, _response, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found.')));
  app.use(errorHandler);
  return app;
}
