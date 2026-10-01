import { intents } from './intents';
import { findPlatform, findTech } from './knowledge';
import { IntentModel } from './model';
import { tokens } from './text';
import type { Answer } from './types';

export type { Answer, OverlayId } from './types';

// Trained once, when this module first loads (a few milliseconds).
const model = new IntentModel().train(
  Object.fromEntries(Object.entries(intents).map(([name, intent]) => [name, intent.examples])),
);

/** Below this similarity the bot says it doesn't know rather than guessing. */
const CONFIDENCE = 0.24;

// Phrasings that ask whether he knows a specific technology.
const skillPhrasing =
  /\b(know|knows|use|uses|used|using|familiar|proficient|experience (with|in)|worked with|work with|good at|skilled|expert|can he|does he|has he|is he|what about|how about|and)\b/;
const topicIntents = new Set(['stack', 'skillCheck', 'frontend', 'backend', 'ai', 'devops']);
const followUpCue = /^(and|also|what about|how about|what else|plus)\b/;
const profileWords = /\b(link|links|profile|url|account|page|handle|find him|on)\b/;
const morePhrasing = /^(more|tell me more|go on|elaborate|details|more details|continue|and\??)$/;

export interface Classification {
  intent: string;
  score: number;
}

/** Decides which intent answers a question, combining the model with entity lookups. */
export function classify(question: string, previous?: string): Classification {
  const prediction = model.predict(question);
  const tech = findTech(question);
  const mentionsTech = tech.known.length > 0 || tech.unknown.length > 0;
  const shortFollowUp = tokens(question).length <= 3;

  const platform = findPlatform(question);
  if (platform && (profileWords.test(question.toLowerCase()) || prediction.intent === 'socials')) {
    return { intent: 'socials', score: Math.max(prediction.score, CONFIDENCE) };
  }
  if (mentionsTech) {
    // "Does he know Rust?", "Docker?", or "and FastAPI?" after a skills answer.
    if (
      prediction.intent === 'skillCheck' ||
      (shortFollowUp && !(topicIntents.has(prediction.intent) && prediction.score >= 0.45)) ||
      // A clear topic question ("can he build RAG pipelines?") keeps its topic answer.
      (skillPhrasing.test(question.toLowerCase()) &&
        topicIntents.has(prediction.intent) &&
        (prediction.intent === 'stack' || prediction.score < 0.45)) ||
      prediction.score < CONFIDENCE
    ) {
      return { intent: 'skillCheck', score: Math.max(prediction.score, CONFIDENCE) };
    }
  }
  if (platform && prediction.intent !== 'contact' && prediction.score < 0.5) {
    return { intent: 'socials', score: Math.max(prediction.score, CONFIDENCE) };
  }
  // Only phrasings that sound like a follow-up ("and…?", "what about…?") inherit the topic.
  if (
    previous &&
    shortFollowUp &&
    prediction.score < CONFIDENCE &&
    followUpCue.test(question.toLowerCase().trim())
  ) {
    return { intent: previous, score: prediction.score };
  }
  return prediction.score >= CONFIDENCE
    ? { intent: prediction.intent, score: prediction.score }
    : { intent: 'unknown', score: prediction.score };
}

const unknownAnswer: Answer = {
  summary: `I can only answer from what's on this portfolio, and I didn't find that here.`,
  points: [
    'Try asking about his tech stack, a specific technology, projects, experience, availability, or how to get in touch.',
  ],
  sources: [],
  followUps: ['What is his tech stack?', 'Does he know Python?', 'Is he available for hire?'],
};

/** A conversation that remembers its last topic, so short follow-ups make sense. */
export class ChatSession {
  private last?: string;

  ask(question: string): Answer {
    const cleaned = question.trim().toLowerCase();
    if (this.last && morePhrasing.test(cleaned)) {
      return intents[this.last].respond({ question, known: [], unknown: [] });
    }
    const { intent } = classify(question, this.last);
    if (intent === 'unknown') return unknownAnswer;
    this.last = intent;
    const { known, unknown } = findTech(question);
    return intents[intent].respond({ question, known, unknown, platform: findPlatform(question) });
  }
}

/** One-off answer without conversation memory. */
export function answer(question: string): Answer {
  return new ChatSession().ask(question);
}
