import { availability, skillGroups } from '../../config/content';
import { accounts } from '../../config/site';
import type { AccountId } from '../../config/site';
import { normalize } from './text';

export interface Skill {
  name: string;
  group: string;
}

// Extra spellings people type for listed skills.
const aliases: Record<string, string[]> = {
  Python: ['py', 'python3'],
  JavaScript: ['js', 'javascript', 'es6', 'ecmascript'],
  SQL: ['sql', 'sql queries'],
  'C#': ['c#', 'csharp', 'c sharp'],
  'AI Agents': ['agent', 'agents', 'ai agent', 'agentic', 'tool calling', 'function calling'],
  'Large Language Models (LLMs)': [
    'llm',
    'llms',
    'large language model',
    'large language models',
    'gpt',
    'openai',
    'claude',
    'gemini',
  ],
  'LLM API Integration': ['llm api', 'llm apis', 'openai api', 'ai api'],
  'Prompt Engineering': ['prompting', 'prompts', 'prompt', 'prompt engineering'],
  'Web Scraping': [
    'scraping',
    'scraper',
    'scrapers',
    'web scraper',
    'web scrapers',
    'crawling',
    'crawler',
    'beautifulsoup',
    'selenium',
    'scrapy',
  ],
  'Data Extraction': ['data extraction', 'extraction', 'data pipeline', 'data pipelines', 'etl'],
  FastAPI: ['fast api', 'fastapi'],
  'Node.js': ['node', 'nodejs', 'node js'],
  '.NET': ['net', 'dotnet', 'asp.net', 'asp.net core'],
  'RESTful APIs': ['rest api', 'rest apis', 'api', 'apis', 'restful'],
  React: ['reactjs', 'react js', 'react.js'],
  'Tailwind CSS': ['tailwind', 'tailwindcss'],
  HTML: ['html5'],
  CSS: ['css3'],
  PostgreSQL: ['postgres', 'postgre', 'psql', 'pg', 'pgvector'],
  NoSQL: ['nosql', 'no sql', 'document database'],
  Docker: ['docker', 'dockerfile', 'docker compose', 'containerization', 'containerized'],
  Git: ['git', 'version control'],
  GitHub: ['github', 'pull requests', 'code review'],
  'Next.js': ['nextjs', 'next js', 'next.js 14'],
  'Local LLMs': ['ollama', 'local llm', 'llama', 'mistral'],
  'Vector DBs': [
    'vector db',
    'vector database',
    'vector databases',
    'embeddings',
    'rag',
    'semantic search',
  ],
};

export const skills: Skill[] = skillGroups.flatMap((group) =>
  group.skills.map((name) => ({ name, group: group.title })),
);
for (const name of availability.stack) {
  if (!skills.some((skill) => normalize(skill.name).includes(normalize(name)))) {
    skills.push({ name, group: 'Preferred stack' });
  }
}

// Common technologies that are not on the portfolio, so a question about them gets an honest
// "not listed" instead of a guess.
const commonTech = [
  'java',
  'c#',
  'c++',
  'golang',
  'go lang',
  'rust',
  'ruby',
  'rails',
  'php',
  'laravel',
  'swift',
  'kotlin',
  'flutter',
  'react native',
  'angular',
  'vue',
  'svelte',
  'django',
  'flask',
  'spring',
  'spring boot',
  '.net',
  'dotnet',
  'aws',
  'azure',
  'gcp',
  'google cloud',
  'kubernetes',
  'k8s',
  'terraform',
  'tensorflow',
  'pytorch',
  'keras',
  'scikit-learn',
  'sklearn',
  'pandas',
  'numpy',
  'langchain',
  'llamaindex',
  'hugging face transformers',
  'mongodb',
  'mongo',
  'mysql',
  'redis',
  'graphql',
  'firebase',
  'supabase',
  'elasticsearch',
  'kafka',
  'rabbitmq',
  'jenkins',
  'figma',
  'wordpress',
  'shopify',
  'unity',
  'blockchain',
  'solidity',
  'web3',
  'matlab',
  'r language',
];

const listedTerms = new Set(
  skills.flatMap((skill) => [skill.name, ...(aliases[skill.name] ?? [])].map(normalize)),
);
const unlisted = commonTech.filter((term) => !listedTerms.has(normalize(term)));

const skillIndex = skills.flatMap((skill) =>
  [skill.name, ...(aliases[skill.name] ?? [])].map((term) => ({ term: normalize(term), skill })),
);

function mentions(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[\\s])${escaped}($|[\\s?!,])`).test(text);
}

/** Skills named in a question, plus technologies that are not on the portfolio. */
export function findTech(question: string) {
  const text = ` ${normalize(question)} `;
  const found = new Map<string, Skill>();
  // Longer terms first so "react native" is not read as "react".
  const unknown = unlisted
    .filter((term) => mentions(text, normalize(term)))
    .sort((a, b) => b.length - a.length);
  let remaining = text;
  for (const term of unknown) remaining = remaining.replace(normalize(term), ' ');
  for (const { term, skill } of [...skillIndex].sort((a, b) => b.term.length - a.term.length)) {
    if (term.length > 1 && mentions(remaining, term)) found.set(skill.name, skill);
  }
  return { known: [...found.values()], unknown };
}

const platformWords: Record<string, AccountId> = {
  github: 'github',
  git: 'github',
  linkedin: 'linkedin',
  leetcode: 'leetcode',
  kaggle: 'kaggle',
  huggingface: 'huggingface',
  'hugging face': 'huggingface',
  instagram: 'instagram',
  insta: 'instagram',
  twitter: 'x',
  x: 'x',
  hashnode: 'hashnode',
  orcid: 'orcid',
  pypi: 'pypi',
};

/** A social platform named in a question, if any. */
export function findPlatform(question: string) {
  const text = ` ${normalize(question)} `;
  for (const [word, id] of Object.entries(platformWords)) {
    if (mentions(text, word)) return accounts.find((account) => account.id === id);
  }
  return undefined;
}
