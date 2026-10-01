/*
 * The portfolio assistant: a small intent model trained in the browser (see ./chatbot).
 * It answers only from this site's own content and sends nothing to any server.
 */
export { answer, ChatSession } from './chatbot';
export type { Answer, OverlayId } from './chatbot';
