import type { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/AppError.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : '';
  if (type === 'entity.parse.failed') {
    response
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
    return;
  }
  if (type === 'entity.too.large') {
    response.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds the 16 KB limit.' },
    });
    return;
  }
  console.error('Unhandled API error:', error instanceof Error ? error.name : 'UnknownError');
  response
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
};
