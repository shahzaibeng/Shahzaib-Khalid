/*
 * Training data and grounded replies. Every reply is built from config/site.ts and
 * config/content.ts at answer time, so editing those files updates the chatbot too.
 * To teach it a new kind of question, add an intent with a few example phrasings.
 */
import {
  about as aboutContent,
  availability,
  credentials,
  education,
  experience,
  heroMetrics,
  posts,
  projects,
  skillGroups,
  yearsOfExperience,
} from '../../config/content';
import { accounts, site } from '../../config/site';
import { isConfigured } from '../placeholder';
import type { Skill } from './knowledge';
import type { Answer } from './types';

export interface Context {
  question: string;
  known: Skill[];
  unknown: string[];
  platform?: (typeof accounts)[number];
}

interface Intent {
  examples: readonly string[];
  respond: (context: Context) => Answer;
}

const first = site.name.split(' ')[0];

function list(items: readonly string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function lower(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Resume highlights from the current role that match a topic. */
const highlights = (pattern: RegExp) =>
  experience[0]?.highlights.filter((item) => pattern.test(item)) ?? [];

const profiles = () =>
  accounts.filter((account) => account.id !== 'email' && isConfigured(account.href));

const group = (title: string) => skillGroups.find((entry) => entry.title === title)?.skills ?? [];

const notListed = (topic: string): Answer => ({
  summary: `${topic} isn't on the portfolio yet, so I won't guess.`,
  points: [
    isConfigured(site.email)
      ? `You can ask ${first} directly at ${site.email}.`
      : `You can ask ${first} directly through the contact form.`,
  ],
  sources: [],
  action: { label: 'Open Contact', overlay: 'contact' },
  followUps: ['What is his tech stack?', 'Is he available for hire?'],
});

export const intents: Record<string, Intent> = {
  greeting: {
    examples: [
      'hi',
      'hello',
      'hey',
      'hey there',
      'hello there',
      'hi there',
      'good morning',
      'good afternoon',
      'good evening',
      'salam',
      'assalamualaikum',
      'yo',
      'hiya',
      'greetings',
      'howdy',
      'hi how are you',
      'hello how are you doing',
      'assalam alaikum',
      'salam alaikum',
      'aoa',
      'salaam',
    ],
    respond: () => ({
      summary: `Hello! I can answer questions about ${first}'s skills, projects, experience, and availability.`,
      points: [],
      sources: [],
      followUps: ['What is his tech stack?', 'Is he available for hire?', 'Show top AI projects'],
    }),
  },
  thanks: {
    examples: [
      'thanks',
      'thank you',
      'thanks a lot',
      'thank you so much',
      'appreciate it',
      'great thanks',
      'cool thanks',
      'thx',
      'ty',
      'that was helpful',
      'nice, thanks',
      'awesome thank you',
      'cheers',
      'very helpful',
      'that helped a lot',
    ],
    respond: () => ({
      summary: `You're welcome. Anything else you'd like to know?`,
      points: [],
      sources: [],
      followUps: ['How can I contact him?', 'Show top AI projects'],
    }),
  },
  goodbye: {
    examples: [
      'bye',
      'goodbye',
      'see you',
      'see ya',
      'that is all',
      'that is it',
      'nothing else',
      'good night',
      'take care',
      'catch you later',
    ],
    respond: () => ({
      summary: `Thanks for stopping by. ${first} would be glad to hear from you.`,
      points: isConfigured(site.email) ? [`Email: ${site.email}`] : [],
      sources: ['Contact'],
      action: { label: 'Open Contact', overlay: 'contact' },
      followUps: [],
    }),
  },
  bot: {
    examples: [
      'who are you',
      'what are you',
      'are you a bot',
      'are you ai',
      'are you a real person',
      'are you chatgpt',
      'what model are you',
      'how do you work',
      'what can you do',
      'what can i ask you',
      'are you human',
      'how were you trained',
      'is this ai',
      'help',
      'what questions can you answer',
      'how does this chatbot work',
    ],
    respond: () => ({
      summary: `I'm a small assistant built into this portfolio. I run entirely in your browser — no external AI service — and I answer only from the portfolio's own content.`,
      points: [
        'I was trained on example questions for about thirty topics, and I match yours to the closest one.',
        `Ask about ${first}'s skills, a specific technology, projects, experience, availability, or how to get in touch.`,
      ],
      sources: [],
      followUps: ['What is his tech stack?', 'Does he know Python?', 'Is he available for hire?'],
    }),
  },
  about: {
    examples: [
      'who is shahzaib',
      'who is he',
      'tell me about him',
      'tell me about shahzaib',
      'introduce him',
      'introduce yourself',
      'summary of shahzaib',
      'describe him',
      'give me an overview',
      'what does he do',
      'who am i talking about',
      'about him',
      'what is his story',
      'bio',
      'short introduction',
      'what is his profession',
      'what does he do professionally',
      'what does he do for work',
    ],
    respond: () => ({
      summary: `${site.name} is a ${site.title} — ${lower(site.tagline)}`,
      points: [
        ...[site.bio].filter(isConfigured),
        ...aboutContent.paragraphs,
        `Focus: ${list(availability.stack)}.`,
      ],
      sources: ['Architecture'],
      action: { label: 'Open Architecture', overlay: 'about' },
      followUps: ['What is his tech stack?', 'Show top AI projects'],
    }),
  },
  role: {
    examples: [
      'what is his role',
      'what is his job title',
      'what position',
      'what kind of engineer is he',
      'is he a frontend or backend developer',
      'is he full stack',
      'what is his title',
      'what does he specialise in',
      'what is his specialty',
      'is he a developer',
      'what type of developer',
      'is he an ai engineer',
      'is he a software engineer',
      'what is his occupation',
      'what job does he do',
      'his job title',
    ],
    respond: () => ({
      summary: `${first} is a ${site.title}: he works across frontend, backend, and AI.`,
      points: aboutContent.focus.map((item) => `${item}.`),
      sources: ['Architecture'],
      action: { label: 'Open Architecture', overlay: 'about' },
      followUps: ['What is his tech stack?', 'What is his AI experience?'],
    }),
  },
  stack: {
    examples: [
      'what is his tech stack',
      'tech stack',
      'what technologies does he use',
      'what are his skills',
      'skills',
      'what languages does he code in',
      'programming languages',
      'what tools does he use',
      'what frameworks does he know',
      'what does he work with',
      'technical skills',
      'list his skills',
      'stack',
      'what is he good at technically',
      'what can he build with',
      'technology',
      'toolkit',
    ],
    respond: () => ({
      summary: `${first} works across the full stack, with a focus on ${list(availability.stack)}.`,
      points: skillGroups.map((entry) => `${entry.title}: ${entry.skills.join(', ')}`),
      sources: ['Skills', 'Status'],
      action: { label: 'Open Skills', overlay: 'skills' },
      followUps: ['Does he know Docker?', 'What is his AI experience?', 'Show top AI projects'],
    }),
  },
  skillCheck: {
    examples: [
      'does he know python',
      'is he good at react',
      'has he used docker',
      'can he work with fastapi',
      'experience with postgres',
      'is he familiar with nextjs',
      'proficient in typescript',
      'does he use tailwind',
      'can he code in python',
      'has he worked with llms',
      'does he have experience in node',
      'how good is he with react',
      'does he know java',
      'can he do kubernetes',
      'is he skilled in aws',
      'what about docker',
      'and fastapi',
    ],
    respond: ({ known, unknown }) => {
      if (known.length === 0 && unknown.length > 0) {
        return {
          summary: `${list(unknown.map((term) => (term.toUpperCase() === term ? term : term.replace(/^\w/, (c) => c.toUpperCase()))))} ${unknown.length > 1 ? "aren't" : "isn't"} listed in ${first}'s skills.`,
          points: [
            `His listed stack is ${list(availability.stack)}.`,
            'The portfolio only states what he has listed, so it may be worth asking him directly.',
          ],
          sources: ['Skills'],
          action: { label: 'Open Contact', overlay: 'contact' },
          followUps: ['What is his tech stack?', 'How can I contact him?'],
        };
      }
      if (known.length === 0) return intents.stack.respond({ known, unknown, question: '' });
      const points = known.map((skill) => `${skill.name} — listed under ${skill.group}.`);
      for (const term of unknown) points.push(`${term} isn't listed.`);
      return {
        summary: `Yes — ${list(known.map((skill) => skill.name))} ${known.length > 1 ? 'are' : 'is'} part of ${first}'s stack.`,
        points,
        sources: ['Skills'],
        action: { label: 'Open Skills', overlay: 'skills' },
        followUps: ['Show top AI projects', 'What is his tech stack?'],
      };
    },
  },
  frontend: {
    examples: [
      'frontend skills',
      'front end experience',
      'ui development',
      'what frontend frameworks',
      'can he build user interfaces',
      'css skills',
      'web design',
      'does he do ui',
      'react skills',
      'is he good at frontend',
      'client side development',
      'responsive design',
    ],
    respond: () => ({
      summary: `On the frontend, ${first} works with ${list(group('Frontend'))}.`,
      points: [
        'This portfolio itself is an example: React and TypeScript, with an accessible, responsive layout and light and dark themes.',
      ],
      sources: ['Skills', 'Systems'],
      action: { label: 'Open Skills', overlay: 'skills' },
      followUps: ['What about backend?', 'Show top AI projects'],
    }),
  },
  backend: {
    examples: [
      'backend skills',
      'back end experience',
      'what about backend',
      'server side development',
      'can he build apis',
      'what database does he use',
      'databases',
      'api development',
      'what backend languages',
      'does he do backend',
      'server experience',
      'microservices',
      'what databases does he know',
      'backend technologies',
      'backend stack',
      'backend tools he uses',
    ],
    respond: () => ({
      summary: `On the backend, ${first} works with ${list(group('Backend'))}, on ${list(group('Databases'))}.`,
      points: highlights(/backend|API|schema|NoSQL|\.NET/i),
      sources: ['Skills'],
      action: { label: 'Open Skills', overlay: 'skills' },
      followUps: ['What is his AI experience?', 'Does he know Docker?'],
    }),
  },
  ai: {
    examples: [
      'what is his ai experience',
      'ai skills',
      'machine learning',
      'does he do ml',
      'generative ai',
      'llm experience',
      'has he built ai agents',
      'rag',
      'nlp',
      'what ai tools does he use',
      'can he build a chatbot',
      'artificial intelligence',
      'ai engineering',
      'does he work with language models',
      'local llms',
      'deep learning',
    ],
    respond: () => ({
      summary: `${first}'s AI work centres on ${list(group('AI & LLMs'))}.`,
      points: highlights(/LLM|AI agents|scraper/i),
      sources: ['Experience', 'Skills'],
      action: { label: 'Open Systems', overlay: 'projects' },
      followUps: ['Show top AI projects', 'Is he available for hire?'],
    }),
  },
  devops: {
    examples: [
      'devops',
      'does he use docker',
      'deployment',
      'how does he deploy',
      'cloud experience',
      'ci cd',
      'containers',
      'testing',
      'does he write tests',
      'quality',
      'tooling',
      'infrastructure',
      'code quality',
      'version control',
    ],
    respond: () => ({
      summary: `For shipping and collaboration, ${first} uses ${list(group('DevOps & Tools'))}.`,
      points: [
        'This portfolio runs linting, type checks, formatting, API tests, and browser checks before every build.',
      ],
      sources: ['Skills', 'Systems'],
      action: { label: 'Open Skills', overlay: 'skills' },
      followUps: ['What is his tech stack?', 'Show top AI projects'],
    }),
  },
  projects: {
    examples: [
      'show top ai projects',
      'show projects',
      'what projects has he built',
      'portfolio projects',
      'what has he built',
      'examples of his work',
      'case studies',
      'his work',
      'show me his work',
      'best projects',
      'recent projects',
      'github projects',
      'what is he working on',
      'any demos',
      'side projects',
      'top projects',
      'show systems',
      'what has he made',
      'things he has created',
      'what has he shipped',
    ],
    respond: () => {
      const ai = /\b(ai|llm|agent|model|ml|rag)\b/i;
      const ranked = [...projects].sort(
        (a, b) =>
          Number(ai.test(b.summary + b.tags.join(' '))) -
          Number(ai.test(a.summary + a.tags.join(' '))),
      );
      return {
        summary:
          projects.length === 1
            ? 'The portfolio currently lists one project; more, including AI work, are being added.'
            : `Here are ${first}'s listed projects, AI work first.`,
        points: ranked.map((project) => `${project.title} (${project.status}): ${project.summary}`),
        sources: ['Systems'],
        action: { label: 'Open Systems', overlay: 'projects' },
        followUps: ['How was this site built?', 'What is his AI experience?'],
      };
    },
  },
  thisSite: {
    examples: [
      'how was this site built',
      'what is this portfolio made with',
      'tech behind this website',
      'is this site open source',
      'how did he make this website',
      'what framework is this site',
      'how does this portfolio work',
      'who made this website',
      'is this react',
      'what was this website built with',
      'what powers this site',
      'website tech stack',
      'what is this site built on',
    ],
    respond: () => ({
      summary: `${first} built this portfolio with React, TypeScript, and Vite, with an Express API behind it.`,
      points: [
        'Canvas effects and Framer Motion for the interactions, and Tailwind CSS for styling.',
        'This assistant runs in the browser: a small intent model trained on example questions, answering only from the site content.',
        'Checked with ESLint, strict TypeScript, Vitest, and Playwright browser tests.',
      ],
      sources: ['Systems'],
      action: { label: 'Open Systems', overlay: 'projects' },
      followUps: ['What is his tech stack?', 'Is he available for hire?'],
    }),
  },
  experience: {
    examples: [
      'what is his experience',
      'work experience',
      'work history',
      'how many years of experience',
      'where has he worked',
      'previous jobs',
      'career',
      'professional background',
      'is he senior',
      'how experienced is he',
      'employment history',
      'what companies',
      'current job',
      'where does he work',
      'background',
    ],
    respond: () => {
      const current = experience[0];
      return {
        summary: current
          ? `${first} has ${yearsOfExperience} years of experience and is currently ${current.title} at ${current.company} (${current.start} – ${current.end}).`
          : `${first} is a ${lower(site.title)}.`,
        points: current ? current.highlights.slice(0, 6) : [],
        sources: ['Experience'],
        action: { label: 'Open Experience', overlay: 'experience' },
        followUps: ['What is his tech stack?', 'Is he available for hire?'],
      };
    },
  },
  education: {
    examples: [
      'education',
      'what degree does he have',
      'which university',
      'where did he study',
      'academic background',
      'did he go to college',
      'qualifications',
      'what did he study',
      'is he a graduate',
      'his degree',
      'major',
      'field of study',
      'what subject did he study',
    ],
    respond: () =>
      education.length > 0
        ? {
            summary: `${first} is studying for a ${education[0].degree} at ${education[0].school} (${education[0].period}).`,
            points: [`Location: ${education[0].location}.`],
            sources: ['Experience'],
            action: { label: 'Open Experience', overlay: 'experience' },
            followUps: ['What is his experience?', 'What is his AI experience?'],
          }
        : notListed('His education'),
  },
  credentials: {
    examples: [
      'certifications',
      'does he have certifications',
      'certificates',
      'credentials',
      'courses',
      'verified badges',
      'any certificates',
      'professional certifications',
      'has he done courses',
      'licenses',
    ],
    respond: () => ({
      summary:
        credentials.length > 0
          ? `${first} holds ${credentials.length} credential${credentials.length === 1 ? '' : 's'}, each with a verification link.`
          : 'Certifications are being added to the portfolio, each with a link to verify it with the issuer.',
      points: credentials.map((item) => `${item.title} — ${item.issuer}, ${item.issued}`),
      sources: ['Credentials'],
      action: { label: 'Open Credentials', overlay: 'credentials' },
      followUps: ['What is his experience?', 'What is his tech stack?'],
    }),
  },
  availability: {
    examples: [
      'is he available for hire',
      'available for work',
      'is he open to work',
      'can we hire him',
      'is he looking for a job',
      'hire',
      'freelance',
      'is he taking contracts',
      'full time role',
      'is he open to opportunities',
      'can he join our team',
      'availability',
      'open for roles',
      'is he free for a project',
      'job offer',
      'is he free',
      'we want to hire',
      'looking to hire a developer',
      'hire a developer',
    ],
    respond: () => ({
      summary: site.availableForWork
        ? `Yes — ${first} is ${lower(availability.status)}.`
        : `${first} isn't taking new work at the moment.`,
      points: [
        `Notice period: ${availability.notice}.`,
        `Location: ${availability.location}.`,
        `Preferred stack: ${list(availability.stack)}.`,
      ],
      sources: ['Status'],
      action: { label: 'Open Status', overlay: 'status' },
      followUps: ['How can I contact him?', 'What is his tech stack?'],
    }),
  },
  notice: {
    examples: [
      'notice period',
      'when can he start',
      'how soon can he join',
      'start date',
      'can he start immediately',
      'how quickly can he begin',
      'when is he available',
      'joining time',
    ],
    respond: () => ({
      summary: `Notice period: ${availability.notice}.`,
      points: [`Open to: ${availability.status}.`],
      sources: ['Status'],
      action: { label: 'Open Status', overlay: 'status' },
      followUps: ['Where is he based?', 'How can I contact him?'],
    }),
  },
  location: {
    examples: [
      'where is he based',
      'location',
      'where does he live',
      'is he remote',
      'can he work remotely',
      'will he relocate',
      'onsite',
      'what country',
      'what city',
      'timezone',
      'where is he from',
      'can he work from office',
      'hybrid',
    ],
    respond: () => ({
      summary: `Preferred location: ${availability.location}.`,
      points: isConfigured(site.location) ? [`Based in ${site.location}.`] : [],
      sources: ['Status'],
      action: { label: 'Open Status', overlay: 'status' },
      followUps: ['When can he start?', 'Is he available for hire?'],
    }),
  },
  rates: {
    examples: [
      'salary expectations',
      'hourly rate',
      'how much does he charge',
      'pricing',
      'compensation',
      'what is his rate',
      'budget',
      'cost',
      'expected salary',
      'how much for a website',
    ],
    respond: () => ({
      summary: `Rates depend on the scope, so ${first} discusses them directly.`,
      points: [
        isConfigured(site.email)
          ? `Email ${site.email} with a short brief.`
          : 'Use the contact form with a short brief.',
      ],
      sources: ['Contact'],
      action: { label: 'Open Contact', overlay: 'contact' },
      followUps: ['Is he available for hire?', 'When can he start?'],
    }),
  },
  contact: {
    examples: [
      'how can i contact him',
      'contact',
      'email',
      'what is his email',
      'how to reach him',
      'get in touch',
      'phone number',
      'how do i message him',
      'send him a message',
      'can i call him',
      'contact details',
      'reach out',
      'email address',
    ],
    respond: () => ({
      summary: isConfigured(site.email)
        ? `The quickest way is email: ${site.email}.`
        : 'Use the contact form or one of the profiles below.',
      points: profiles().map((account) => `${account.label}: ${account.href}`),
      sources: ['Contact', 'Profiles'],
      action: { label: 'Open Contact', overlay: 'contact' },
      followUps: ['Is he available for hire?'],
    }),
  },
  socials: {
    examples: [
      'github',
      'linkedin',
      'what is his github',
      'linkedin profile',
      'social media',
      'where can i find him online',
      'leetcode',
      'kaggle',
      'hugging face',
      'instagram',
      'social links',
      'online profiles',
      'twitter',
      'show his github',
    ],
    respond: ({ platform }) => {
      if (platform && isConfigured(platform.href)) {
        return {
          summary: `${first}'s ${platform.label}: ${platform.href}`,
          points: [],
          sources: ['Profiles'],
          followUps: ['Show top AI projects', 'How can I contact him?'],
        };
      }
      if (platform) return notListed(`A ${platform.label} profile`);
      return {
        summary: `You can find ${first} here:`,
        points: profiles().map((account) => `${account.label}: ${account.href}`),
        sources: ['Profiles'],
        followUps: ['How can I contact him?'],
      };
    },
  },
  resume: {
    examples: [
      'resume',
      'cv',
      'download resume',
      'can i see his cv',
      'send resume',
      'curriculum vitae',
      'where is his resume',
      'pdf resume',
    ],
    respond: () =>
      site.resume.available
        ? {
            summary: `${first}'s resume is available as a PDF: ${site.resume.href}`,
            points: [],
            sources: ['Resume'],
            followUps: ['Is he available for hire?'],
          }
        : notListed('A downloadable resume'),
  },
  blog: {
    examples: [
      'blog',
      'articles',
      'does he write',
      'blog posts',
      'writing',
      'hashnode',
      'tutorials',
      'has he published anything',
      'technical writing',
    ],
    respond: () => ({
      summary:
        posts.length > 0
          ? `${first} has published ${posts.length} article${posts.length === 1 ? '' : 's'}.`
          : 'The first articles are being written; they will cover lessons from full stack and AI projects.',
      points: posts.map((post) => `${post.title}: ${post.href}`),
      sources: ['Blog'],
      action: { label: 'Open Systems', overlay: 'projects' },
      followUps: ['Show top AI projects'],
    }),
  },
  whyHire: {
    examples: [
      'why should we hire him',
      'what are his strengths',
      'what makes him different',
      'why him',
      'what value does he bring',
      'strengths',
      'what is he best at',
      'convince me',
      'unique selling point',
      'why choose him',
    ],
    respond: () => ({
      summary: `${first} takes products from idea to production on his own — interface, API, data, and the AI layer.`,
      points: [
        `End to end across ${list(availability.stack)}.`,
        'He cares about accessible, fast, typed, and tested software.',
        ...heroMetrics.map(
          (metric) =>
            `${'value' in metric ? `${metric.value}${metric.suffix}` : metric.text} ${lower(metric.label)}.`,
        ),
      ],
      sources: ['Architecture', 'Hero metrics'],
      action: { label: 'Open Status', overlay: 'status' },
      followUps: ['Is he available for hire?', 'Show top AI projects'],
    }),
  },
  workStyle: {
    examples: [
      'how does he work',
      'work style',
      'is he a team player',
      'communication skills',
      'what is his process',
      'agile',
      'how does he approach problems',
      'does he work in teams',
      'work ethic',
      'how does he collaborate',
    ],
    respond: () => ({
      summary: `${first} works from the whole problem: shaping the interface, designing the API behind it, and adding AI where it genuinely helps.`,
      points: aboutContent.paragraphs.slice(1),
      sources: ['Architecture'],
      action: { label: 'Open Architecture', overlay: 'about' },
      followUps: ['What are his strengths?', 'Is he available for hire?'],
    }),
  },
  hobbies: {
    examples: [
      'hobbies',
      'interests',
      'what does he do for fun',
      'outside of work',
      'free time',
      'life beyond code',
      'personal interests',
      'what does he like',
    ],
    respond: () => notListed('Hobbies and interests'),
  },
  metrics: {
    examples: [
      'how many systems has he built',
      'achievements',
      'stats',
      'numbers',
      'reliability',
      'accomplishments',
      'track record',
      'how many projects',
    ],
    respond: () => ({
      summary: `The portfolio highlights:`,
      points: heroMetrics.map(
        (metric) =>
          `${'value' in metric ? `${metric.value}${metric.suffix}` : metric.text} ${lower(metric.label)}.`,
      ),
      sources: ['Hero metrics'],
      action: { label: 'Open Systems', overlay: 'projects' },
      followUps: ['Show top AI projects'],
    }),
  },
  spokenLanguages: {
    examples: [
      'what languages does he speak',
      'does he speak english',
      'spoken languages',
      'native language',
      'can he speak urdu',
      'fluent in english',
    ],
    respond: () => notListed('Spoken languages'),
  },
  personal: {
    examples: [
      'how old is he',
      'age',
      'is he married',
      'religion',
      'date of birth',
      'his family',
      'personal life',
      'girlfriend',
      'where does he live exactly',
      'home address',
    ],
    respond: () => ({
      summary: `I keep to ${first}'s professional profile, so I can't share personal details.`,
      points: [],
      sources: [],
      followUps: ['What is his experience?', 'Is he available for hire?'],
    }),
  },
};
