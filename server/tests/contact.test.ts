import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { parseConfig } from '../src/config/env.js';

const valid = {
  name: 'Ada Recruiter',
  email: 'ada@example.com',
  message: 'Hi Shahzaib, I would like to talk about a role.',
};

afterEach(() => vi.unstubAllGlobals());

describe('POST /api/contact', () => {
  it('rejects invalid input with a clear message', async () => {
    const app = createApp(parseConfig({ NODE_ENV: 'test', RESEND_API_KEY: 'test-key' }));
    const response = await request(app)
      .post('/api/contact')
      .send({ ...valid, email: 'nope' });
    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe('Please enter a valid email address.');
  });

  it('reports when email delivery is not configured', async () => {
    const app = createApp(parseConfig({ NODE_ENV: 'test' }));
    const response = await request(app).post('/api/contact').send(valid);
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('NOT_CONFIGURED');
  });

  it('delivers through Resend to the configured inbox with reply-to set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const app = createApp(parseConfig({ NODE_ENV: 'test', RESEND_API_KEY: 'test-key' }));
    const response = await request(app).post('/api/contact').send(valid);
    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['shahzaibkhalid.eng@gmail.com']);
    expect(body.reply_to).toBe('ada@example.com');
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });

  it('silently accepts honeypot submissions without sending', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const app = createApp(parseConfig({ NODE_ENV: 'test', RESEND_API_KEY: 'test-key' }));
    const response = await request(app)
      .post('/api/contact')
      .send({ ...valid, company: 'bot' });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('limits repeated submissions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
    const app = createApp(parseConfig({ NODE_ENV: 'test', RESEND_API_KEY: 'test-key' }));
    for (let i = 0; i < 5; i++) await request(app).post('/api/contact').send(valid);
    const response = await request(app).post('/api/contact').send(valid);
    expect(response.status).toBe(429);
  });
});
