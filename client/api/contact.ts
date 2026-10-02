/*
 * Vercel serverless function: POST /api/contact
 * Validates the form and delivers it to the inbox through Resend (https://resend.com).
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY  required — from resend.com/api-keys
 *   CONTACT_TO      optional — defaults to shahzaibkhalid.eng@gmail.com
 *   CONTACT_FROM    optional — a sender on a domain verified in Resend; defaults to Resend's
 *                   test sender, which delivers only to the Resend account's own email address
 */

const TO = process.env.CONTACT_TO || 'shahzaibkhalid.eng@gmail.com';
const FROM = process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort limit per warm instance: 5 messages per address per 10 minutes.
const recent = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((time) => now - time < 10 * 60_000);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > 5;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, {
      error: { code: 'INVALID_JSON', message: 'The request body must be JSON.' },
    });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  // Bots fill every field; people never see this one.
  if (String(body.company ?? '')) return json(200, { ok: true });

  if (name.length < 2 || name.length > 100) {
    return json(422, { error: { code: 'INVALID_NAME', message: 'Please enter your name.' } });
  }
  if (!EMAIL.test(email) || email.length > 200) {
    return json(422, {
      error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address.' },
    });
  }
  if (message.length < 10 || message.length > 2000) {
    return json(422, {
      error: {
        code: 'INVALID_MESSAGE',
        message: 'Please write a message of 10 to 2000 characters.',
      },
    });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) {
    return json(429, {
      error: { code: 'RATE_LIMITED', message: 'Too many messages — please try again later.' },
    });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return json(503, {
      error: { code: 'NOT_CONFIGURED', message: 'Email delivery is not configured yet.' },
    });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `<p>${escape(message).replace(/\n/g, '<br>')}</p><p>— ${escape(name)} &lt;${escape(email)}&gt;</p>`,
    }),
  });
  if (!response.ok) {
    return json(502, {
      error: { code: 'DELIVERY_FAILED', message: 'The message could not be delivered.' },
    });
  }
  return json(200, { ok: true });
}
