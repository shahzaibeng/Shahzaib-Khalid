import { charFeatures, wordFeatures } from './text';

/*
 * A small intent classifier trained in the browser from labelled example questions.
 *
 * Each example becomes two TF-IDF vectors: word stems (with bigrams) and character trigrams.
 * A question is scored against every example and against each intent's centroid; the word
 * view carries the meaning and the character view keeps working through typos.
 */

type Vector = Map<string, number>;

interface TrainedExample {
  intent: string;
  words: Vector;
  chars: Vector;
}

export interface Prediction {
  intent: string;
  score: number;
  /** The next-best intent, useful for spotting ambiguous questions. */
  runnerUp?: { intent: string; score: number };
}

function counts(features: string[]) {
  const vector: Vector = new Map();
  for (const feature of features) vector.set(feature, (vector.get(feature) ?? 0) + 1);
  return vector;
}

function weigh(vector: Vector, idf: Map<string, number>) {
  let norm = 0;
  const weighted: Vector = new Map();
  for (const [feature, count] of vector) {
    const weight = (1 + Math.log(count)) * (idf.get(feature) ?? 0);
    if (weight > 0) {
      weighted.set(feature, weight);
      norm += weight * weight;
    }
  }
  norm = Math.sqrt(norm) || 1;
  for (const [feature, weight] of weighted) weighted.set(feature, weight / norm);
  return weighted;
}

function cosine(a: Vector, b: Vector) {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [feature, weight] of small) dot += weight * (large.get(feature) ?? 0);
  return dot;
}

function inverseFrequencies(documents: Vector[]) {
  const seen = new Map<string, number>();
  for (const document of documents) {
    for (const feature of document.keys()) seen.set(feature, (seen.get(feature) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [feature, frequency] of seen) {
    idf.set(feature, Math.log((documents.length + 1) / (frequency + 0.5)));
  }
  return idf;
}

function centroid(vectors: Vector[]) {
  const sum: Vector = new Map();
  for (const vector of vectors) {
    for (const [feature, weight] of vector) sum.set(feature, (sum.get(feature) ?? 0) + weight);
  }
  let norm = 0;
  for (const weight of sum.values()) norm += weight * weight;
  norm = Math.sqrt(norm) || 1;
  for (const [feature, weight] of sum) sum.set(feature, weight / norm);
  return sum;
}

export class IntentModel {
  private examples: TrainedExample[] = [];
  private wordIdf = new Map<string, number>();
  private charIdf = new Map<string, number>();
  private centroids = new Map<string, { words: Vector; chars: Vector }>();

  /** Learns vocabulary weights and intent centroids from labelled examples. */
  train(data: Record<string, readonly string[]>) {
    const raw = Object.entries(data).flatMap(([intent, sentences]) =>
      sentences.map((sentence) => ({
        intent,
        words: counts(wordFeatures(sentence)),
        chars: counts(charFeatures(sentence)),
      })),
    );
    this.wordIdf = inverseFrequencies(raw.map((example) => example.words));
    this.charIdf = inverseFrequencies(raw.map((example) => example.chars));
    this.examples = raw.map((example) => ({
      intent: example.intent,
      words: weigh(example.words, this.wordIdf),
      chars: weigh(example.chars, this.charIdf),
    }));
    this.centroids.clear();
    for (const intent of Object.keys(data)) {
      const members = this.examples.filter((example) => example.intent === intent);
      this.centroids.set(intent, {
        words: centroid(members.map((example) => example.words)),
        chars: centroid(members.map((example) => example.chars)),
      });
    }
    return this;
  }

  predict(question: string): Prediction {
    const words = weigh(counts(wordFeatures(question)), this.wordIdf);
    const chars = weigh(counts(charFeatures(question)), this.charIdf);
    const similarity = (a: { words: Vector; chars: Vector }) =>
      0.72 * cosine(words, a.words) + 0.28 * cosine(chars, a.chars);

    // Best single example per intent, blended with how close the intent is overall.
    const best = new Map<string, number>();
    for (const example of this.examples) {
      best.set(example.intent, Math.max(best.get(example.intent) ?? 0, similarity(example)));
    }
    const ranked = [...best.entries()]
      .map(([intent, nearest]) => ({
        intent,
        score: 0.65 * nearest + 0.35 * similarity(this.centroids.get(intent)!),
      }))
      .sort((a, b) => b.score - a.score);
    return { ...ranked[0], runnerUp: ranked[1] };
  }
}
