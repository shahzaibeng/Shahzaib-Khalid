import { Router } from 'express';
import { z } from 'zod';
import type { ServerConfig } from '../config/env.js';
import { AppError } from '../lib/AppError.js';

// Mirrors client/api/contact.ts (the Vercel function) so the form works under `npm run dev`.
const message = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Please enter a valid email address.').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Please write a message of 10 to 2000 characters.')
    .max(2000, 'Please write a message of 10 to 2000 characters.'),
  company: z.string().optional(), // honeypot
});

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function contactRouter(config: ServerConfig) {
  const router = Router();
  const recent = new Map<string, number[]>();

  router.post('/api/contact', async (request, response, next) => {
    try {
      const parsed = message.safeParse(request.body);
      if (!parsed.success) {
        throw new AppError(
          422,
          'INVALID_INPUT',
          parsed.error.issues[0]?.message ?? 'Invalid input.',
        );
      }
      const { name, email, message: text, company } = parsed.data;
      if (company) {
        response.json({ ok: true });
        return;
      }

      const now = Date.now();
      const key = request.ip ?? 'unknown';
      const hits = (recent.get(key) ?? []).filter((time) => now - time < 10 * 60_000);
      hits.push(now);
      recent.set(key, hits);
      // Enforced in production and tests; local development is not throttled.
      if (config.NODE_ENV !== 'development' && hits.length > 5) {
        throw new AppError(429, 'RATE_LIMITED', 'Too many messages — please try again later.');
      }

      if (!config.RESEND_API_KEY) {
        throw new AppError(503, 'NOT_CONFIGURED', 'Email delivery is not configured yet.');
      }
      const delivery = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.CONTACT_FROM,
          to: [config.CONTACT_TO],
          reply_to: email,
          subject: `Portfolio message from ${name}`,
          text: `${text}\n\n— ${name} <${email}>`,
          html: `<p>${escape(text).replace(/\n/g, '<br>')}</p><p>— ${escape(name)} &lt;${escape(email)}&gt;</p>`,
        }),
      });
      if (!delivery.ok) {
        throw new AppError(502, 'DELIVERY_FAILED', 'The message could not be delivered.');
      }
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
