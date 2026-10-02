import { config as loadDotEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('127.0.0.1'),
  FRONTEND_ORIGIN: z
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        url.pathname === '/' &&
        !url.search &&
        !url.hash
      );
    }, 'Use a frontend origin without a path, query, or credentials.')
    .default('http://127.0.0.1:5173')
    .transform((value) => new URL(value).origin),
  RESEND_API_KEY: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  CONTACT_TO: z.email().default('shahzaibkhalid.eng@gmail.com'),
  CONTACT_FROM: z.string().min(3).default('Portfolio <onboarding@resend.dev>'),
  DATABASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

export type ServerConfig = z.infer<typeof schema>;

export function parseConfig(values: Record<string, string | undefined>): ServerConfig {
  const result = schema.safeParse(values);
  if (!result.success) {
    // Show the field names and validation reasons, never the supplied secret values.
    throw new Error(
      'Invalid server configuration: ' +
        result.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message).join('; '),
    );
  }
  return result.data;
}

export function loadConfig(): ServerConfig {
  loadDotEnv({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
  return parseConfig(process.env);
}
