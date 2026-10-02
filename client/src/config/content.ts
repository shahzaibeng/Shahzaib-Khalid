// Section content for the home page. Bracketed values stay hidden until replaced.

// Hero copy.
export const heroHud = {
  tag: 'Full Stack & AI Engineer',
  askPlaceholder: 'Ask AI about Shahzaib...',
  prompts: [
    'What is his tech stack?',
    'Show top AI projects',
    'What is his experience?',
    'Is he available for hire?',
  ],
} as const;

// "04. // STATUS" section.
export const availability = {
  status: 'Open for Full-Time Roles & High-Impact Contracts',
  notice: 'Immediate Start',
  stack: ['Next.js', 'FastAPI', 'Python', 'Local LLMs', 'Vector DBs'],
  location: 'Remote / On-site',
} as const;

export type CredentialCategory = 'ai' | 'cloud' | 'data' | 'dev';

export interface Credential {
  /** Short id used by the verifier terminal, e.g. `verify cloudtek-fsai`. */
  id: string;
  title: string;
  issuer: string;
  issued: string;
  category: CredentialCategory;
  focus: readonly string[];
  /** Public verification URL from the issuer; leave empty until one exists. */
  verifyUrl: string;
  credentialId?: string;
}

// "04 Credentials". Add the issuer's verification link to each when it is available.
export const credentials: readonly Credential[] = [
  {
    id: 'cloudtek-fsai',
    title: 'Certified Full Stack & AI Engineer',
    issuer: 'Cloudtek',
    issued: '2025',
    category: 'ai',
    focus: ['Production web apps', 'LLM agent workflows', 'FastAPI', 'React', 'Vector DBs'],
    verifyUrl: '',
  },
  {
    id: 'cloudtek-pse',
    title: 'Professional Software Engineer',
    issuer: 'Cloudtek',
    issued: '2026',
    category: 'dev',
    focus: ['System architecture', 'High-throughput APIs', 'Relational schemas', 'Docker', 'CI/CD'],
    verifyUrl: '',
  },
];

// Drafted into the contact form when a visitor presses "Verify Credential".
export const verifyRequestMessage =
  "Hi Shahzaib, I came across your portfolio and reviewed your verified certifications (Cloudtek 2025/2026). I'm interested in discussing your experience and proceeding further with an opportunity. Could you share the verification details?";

// Engineering milestones shown under the credentials.
export const milestones = [
  {
    title: 'Code Quality & Reliability',
    detail:
      'High test coverage suites, robust REST API architectures, error-handling middleware, and end-to-end integration testing.',
    tags: ['Vitest', 'Playwright', 'FastAPI', 'Error handling'],
  },
  {
    title: 'Open-Source & Local AI Contributions',
    detail:
      'Community developer tools, performance benchmarks for local LLMs across the Ollama and Hugging Face ecosystem, and optimized scraping pipelines.',
    tags: ['Ollama', 'Hugging Face', 'Python', 'Web scraping'],
  },
] as const;

// The hero proof bar. Numeric values count up on load; keep them accurate to your work.
export const heroMetrics = [
  { value: 10, suffix: '+', label: 'Scalable Systems Built' },
  { text: 'End-to-End', label: 'AI Integration' },
  { value: 99.9, decimals: 1, suffix: '%', label: 'Code Reliability' },
] as const;

// "The layers I work across" in About: each layer lists the skill group it uses.
export const workLayers = [
  {
    name: 'Interface',
    group: 'Frontend',
    detail:
      'Responsive React and Tailwind CSS interfaces, wired to backend APIs for end-to-end features.',
  },
  {
    name: 'Intelligence',
    group: 'AI & LLMs',
    detail:
      'LLM agents with tool calling, structured outputs and prompt workflows — fed by scrapers that turn websites into clean data.',
  },
  {
    name: 'Services',
    group: 'Backend',
    detail:
      'REST APIs in FastAPI, Node.js and .NET, with routing, validation, authentication and error handling.',
  },
  {
    name: 'Data',
    group: 'Databases',
    detail:
      'Relational schemas and SQL in PostgreSQL, and NoSQL stores for flexible, unstructured data.',
  },
] as const;

export const delivery = {
  group: 'DevOps & Tools',
  detail:
    'Containerized with Docker and shipped through Git and GitHub — branches, pull requests and code reviews.',
} as const;

export const about = {
  // Short paragraphs shown in the About section. The bio in site.ts is shown first.
  paragraphs: [
    'I develop responsive frontends in React and Tailwind CSS, design SQL and NoSQL data models on PostgreSQL, and ship containerized services with Docker — delivering features end to end, from requirements through deployment.',
  ],
  focus: [
    'LLM-based AI agents',
    'Web scrapers and data pipelines',
    'REST APIs and full stack features',
  ],
};

export interface Role {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  highlights: readonly string[];
}

// Work history, newest first.
export const experience: readonly Role[] = [
  {
    title: 'Software Engineer (Full Stack & AI)',
    company: 'Cloudtek',
    location: 'Islamabad, Pakistan',
    start: 'Feb 2025',
    end: 'Present',
    highlights: [
      'Built AI agents on large language models (LLMs) that automate multi-step tasks through tool calling, structured outputs and prompt workflows.',
      'Integrated LLM APIs into production applications, handling prompt design, context management and response validation.',
      'Engineered web scrapers in Python to extract, clean and structure data from websites for downstream processing and AI use cases.',
      'Developed backend services and RESTful APIs with FastAPI and Node.js, covering routing, request validation, authentication and error handling.',
      'Built backend modules with .NET to support application features and service integrations.',
      'Designed relational schemas and wrote SQL queries in PostgreSQL, and modeled NoSQL data stores for flexible and unstructured data.',
      'Developed responsive frontend interfaces with React and Tailwind CSS, connecting them to backend APIs for end-to-end features.',
      'Containerized applications and services with Docker to keep development and deployment environments consistent.',
      'Managed source code with Git and GitHub using branching, pull requests and code reviews for team collaboration.',
      'Delivered full stack features from requirements through deployment, working across the database, backend, AI and frontend layers.',
    ],
  },
];

export const education = [
  {
    degree: 'Bachelor of Science in Data Science',
    school: 'International Islamic University Islamabad',
    location: 'Islamabad, Pakistan',
    period: '2025 – 2029 (expected)',
  },
] as const;

export const yearsOfExperience = '2+';

// Technical skills, as listed on the resume.
export const skillGroups = [
  { title: 'Languages', skills: ['Python', 'JavaScript', 'SQL', 'C#'] },
  {
    title: 'AI & LLMs',
    skills: [
      'AI Agents',
      'Large Language Models (LLMs)',
      'LLM API Integration',
      'Prompt Engineering',
      'Web Scraping',
      'Data Extraction',
    ],
  },
  { title: 'Backend', skills: ['FastAPI', 'Node.js', '.NET', 'RESTful APIs'] },
  { title: 'Frontend', skills: ['React', 'Tailwind CSS', 'HTML', 'CSS'] },
  { title: 'Databases', skills: ['PostgreSQL', 'SQL', 'NoSQL'] },
  { title: 'DevOps & Tools', skills: ['Docker', 'Git', 'GitHub'] },
] as const;

export interface Project {
  title: string;
  summary: string;
  tags: readonly string[];
  status: 'Live' | 'In progress' | 'Archived';
  repo?: string;
  live?: string;
}

// Add your projects here. Links containing brackets are not shown.
export const projects: readonly Project[] = [
  {
    title: 'Personal Portfolio',
    summary:
      'This site: a React and TypeScript portfolio with an interactive canvas hero and live code window, light and dark themes, accessible navigation, and an Express API with validated configuration and automated tests.',
    tags: ['React', 'TypeScript', 'Canvas', 'Framer Motion', 'Express'],
    status: 'In progress',
    repo: 'https://github.com/[username]/portfolio',
  },
  // {
  //   title: 'Project name',
  //   summary: 'One or two sentences about the problem and your solution.',
  //   tags: ['Python', 'FastAPI'],
  //   status: 'Live',
  //   repo: 'https://github.com/you/project',
  //   live: 'https://project.example.com',
  // },
];

export interface BlogPost {
  title: string;
  summary: string;
  date: string; // ISO date, e.g. '2026-09-29'
  href: string;
}

// Add published articles here, newest first. Hashnode integration arrives in a later phase.
export const posts: readonly BlogPost[] = [];
