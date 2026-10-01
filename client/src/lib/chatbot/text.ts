// Text preparation shared by training and prediction.

const contractions: [RegExp, string][] = [
  [/\bwhat's\b/g, 'what is'],
  [/\bwho's\b/g, 'who is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bhow's\b/g, 'how is'],
  [/\bhe's\b/g, 'he is'],
  [/\bcan't\b/g, 'can not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bisn't\b/g, 'is not'],
  [/\bi'm\b/g, 'i am'],
  [/\bu\b/g, 'you'],
  [/\bur\b/g, 'your'],
  [/\bpls\b|\bplz\b/g, 'please'],
];

// Words that carry no topic. Question words (who, where, how, when, why) are kept on purpose.
const stopwords = new Set(
  (
    'a an the is are was were be been am do does did has have had he his him himself she her ' +
    'it its this that these those of to for in on at by with from as and or but if then so ' +
    'me my i we our us they them their shahzaib khalid sir mr please can could would ' +
    'should will shall may might must tell know let give any some just really very also there ' +
    'here what which'
  ).split(' '),
);

/** Lower-cases, expands contractions, and keeps letters, digits, and a few tech symbols. */
export function normalize(text: string) {
  let value = text.toLowerCase().replace(/[’‘]/g, "'");
  for (const [pattern, replacement] of contractions) value = value.replace(pattern, replacement);
  return value
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/(^|\s)[.-]+|[.-]+(\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A light suffix stemmer: "building", "builds", and "built" meet at "build". */
export function stem(word: string) {
  if (word.length <= 3) return word;
  const irregular: Record<string, string> = {
    built: 'build',
    worked: 'work',
    studied: 'study',
    ran: 'run',
    wrote: 'write',
    written: 'write',
    known: 'know',
    knows: 'know',
  };
  if (irregular[word]) return irregular[word];
  return word
    .replace(/ies$/, 'y')
    .replace(/(ss)es$/, '$1')
    .replace(/([^s])s$/, '$1')
    .replace(/ing$/, '')
    .replace(/ed$/, '')
    .replace(/ly$/, '');
}

/** Topic-bearing word stems for a sentence. */
export function tokens(text: string) {
  return normalize(text)
    .split(' ')
    .filter((word) => word && !stopwords.has(word))
    .map(stem);
}

/** Word unigrams and bigrams: "tech stack" also yields "tech_stack". */
export function wordFeatures(text: string) {
  const words = tokens(text);
  const features = [...words];
  for (let i = 0; i < words.length - 1; i++) features.push(`${words[i]}_${words[i + 1]}`);
  return features;
}

/** Character trigrams, which keep matching through typos ("expirience", "avalable"). */
export function charFeatures(text: string) {
  const features: string[] = [];
  for (const word of tokens(text)) {
    const padded = ` ${word} `;
    for (let i = 0; i < padded.length - 2; i++) features.push(padded.slice(i, i + 3));
  }
  return features;
}
