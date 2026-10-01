import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { parseConfig } from '../src/config/env.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const config = parseConfig({ NODE_ENV: 'test' });
const app = createApp(config);

describe('API foundation', () => {
  it('reports a running API without pretending the database is connected', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'portfolio-api',
      database: { configured: false, connected: false, status: 'not_configured' },
    });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
  it('does not expose the database URL or claim a configured database is connected', async () => {
    const configuredApp = createApp(
      parseConfig({ DATABASE_URL: 'postgresql://private:secret@localhost/portfolio' }),
    );
    const response = await request(configuredApp).get('/api/health').expect(200);
    expect(response.body.database).toEqual({
      configured: true,
      connected: false,
      status: 'not_connected',
    });
    expect(response.text).not.toContain('secret');
  });
  it('allows only the configured browser origin', async () => {
    const allowed = await request(app)
      .get('/api/health')
      .set('Origin', config.FRONTEND_ORIGIN)
      .expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe(config.FRONTEND_ORIGIN);
    const denied = await request(app)
      .get('/api/health')
      .set('Origin', 'https://unrelated.example')
      .expect(403);
    expect(denied.body.error.code).toBe('ORIGIN_NOT_ALLOWED');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
  it('handles preflight requests from the configured origin', async () => {
    await request(app)
      .options('/api/health')
      .set('Origin', config.FRONTEND_ORIGIN)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
  });
  it('returns consistent JSON errors for unknown routes and malformed bodies', async () => {
    const missing = await request(app).get('/api/missing').expect(404);
    expect(missing.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
    const malformed = await request(app)
      .post('/api/missing')
      .set('Content-Type', 'application/json')
      .send('{broken')
      .expect(400);
    expect(malformed.body.error.code).toBe('INVALID_JSON');
  });
  it('rejects oversized JSON bodies', async () => {
    const response = await request(app)
      .post('/api/missing')
      .send({ value: 'x'.repeat(17000) })
      .expect(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
  it('never exposes internal stack traces in JSON errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = express();
    failing.get('/failure', () => {
      throw new Error('private database password');
    });
    failing.use(errorHandler);
    const response = await request(failing).get('/failure').expect(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
    expect(response.text).not.toContain('password');
  });
  it('validates ports and origins before startup', () => {
    expect(() => parseConfig({ PORT: 'not-a-port' })).toThrow('PORT');
    expect(() => parseConfig({ FRONTEND_ORIGIN: 'https://example.com/path' })).toThrow(
      'FRONTEND_ORIGIN',
    );
  });
});
