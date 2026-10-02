export const site = {
  name: 'Shahzaib Khalid',
  title: 'Full Stack & AI Engineer',
  tagline: 'Building complex scalable systems & AI-powered solutions.',
  bio: 'Full Stack and AI Software Engineer with 2+ years of experience building production web applications and AI-powered systems. I build LLM-based AI agents, automated web scrapers and data pipelines, and REST APIs with FastAPI, Node.js and .NET, with a background in Data Science and a focus on clean, maintainable code that moves from prototype to production.',
  email: 'shahzaibkhalid.eng@gmail.com',
  location: 'Islamabad, Pakistan',
  university: 'International Islamic University Islamabad',
  company: 'Cloudtek',
  // Set to true to show a green "Available for work" badge in the hero.
  availableForWork: true,
  resume: {
    href: '/resume.pdf',
    available: true,
  },
  // Shown in the navbar as "01. // ARCHITECTURE" and so on; each id is a section on the page.
  navigation: [
    { id: 'about', label: 'Architecture' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Systems' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'status', label: 'Status' },
  ],
} as const;

// Profiles shown in the footer, the left dock, and the contact section.
export const accounts = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/shahzaibeng' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shahzaib-khalid-603556285',
  },
  { id: 'leetcode', label: 'LeetCode', href: 'https://leetcode.com/u/shahzaibeng/' },
  { id: 'kaggle', label: 'Kaggle', href: 'https://www.kaggle.com/shahzaibeng' },
  { id: 'huggingface', label: 'Hugging Face', href: 'https://huggingface.co/shahzaibeng' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/shahzai_b_khalid/' },
  { id: 'email', label: 'Email', href: `mailto:${site.email}` },
] as const;

export type AccountId = (typeof accounts)[number]['id'];
