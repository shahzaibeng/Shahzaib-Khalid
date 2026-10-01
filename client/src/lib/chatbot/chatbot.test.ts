import { describe, expect, it } from 'vitest';
import { ChatSession, classify } from './index';

// Phrasings the model never saw in training, including typos and casual wording.
const heldOut: [string, string][] = [
  ['hey!', 'greeting'],
  ['assalam o alaikum', 'greeting'],
  ['cheers, that helps', 'thanks'],
  ['ok bye now', 'goodbye'],
  ['are you a chatbot?', 'bot'],
  ['what sort of things can I ask', 'bot'],
  ['Who exactly is Shahzaib Khalid?', 'about'],
  ['give me a quick intro about him', 'about'],
  ['what does he do for a living', 'about'],
  ['is he a full-stack engineer?', 'role'],
  ['what is his job?', 'role'],
  ['which technologies is he skilled in', 'stack'],
  ['what programming languages does he know', 'stack'],
  ['what is his tech stak', 'stack'],
  ['list the tools he uses', 'stack'],
  ['does he know Python?', 'skillCheck'],
  ['has he ever used Docker', 'skillCheck'],
  ['is he good with FastAPI', 'skillCheck'],
  ['can he write Rust', 'skillCheck'],
  ['any experience with Kubernetes?', 'skillCheck'],
  ['Next.js?', 'skillCheck'],
  ['is he comfortable building user interfaces', 'frontend'],
  ['how strong is his frontend', 'frontend'],
  ['what backend technologies does he use', 'backend'],
  ['which database does he prefer', 'backend'],
  ['can he build a REST backend', 'backend'],
  ['has he worked on generative ai', 'ai'],
  ['tell me about his machine learning work', 'ai'],
  ['can he build RAG pipelines', 'ai'],
  ['how does he test his code', 'devops'],
  ['what about deployment and containers', 'devops'],
  ['what has he made so far', 'projects'],
  ['show me some of his projects', 'projects'],
  ['top ai projects please', 'projects'],
  ['what was used to build this website', 'thisSite'],
  ['how many years has he been working', 'experience'],
  ['what is his professional experiance', 'experience'],
  ['where did he go to university', 'education'],
  ['what did he major in', 'education'],
  ['does he hold any certificates', 'credentials'],
  ['is he open to new opportunities', 'availability'],
  ['we want to hire a developer, is he free', 'availability'],
  ['is he avalable for freelance work', 'availability'],
  ['how long is his notice period', 'notice'],
  ['when could he start working', 'notice'],
  ['does he work remote', 'location'],
  ['which country is he in', 'location'],
  ['what are his rates', 'rates'],
  ['how much would he cost', 'rates'],
  ['how do I get in touch with him', 'contact'],
  ['whats his email address', 'contact'],
  ['link to his github', 'socials'],
  ['is he on linkedin', 'socials'],
  ['can I download his CV', 'resume'],
  ['does he have a blog', 'blog'],
  ['why is he a good hire', 'whyHire'],
  ['what are his biggest strengths', 'whyHire'],
  ['how does he like to work with a team', 'workStyle'],
  ['what does he enjoy outside work', 'hobbies'],
  ['what languages can he speak', 'spokenLanguages'],
  ['how old is shahzaib', 'personal'],
];

describe('portfolio chatbot', () => {
  it('classifies unseen questions accurately', () => {
    const misses = heldOut
      .map(([question, expected]) => ({ question, expected, got: classify(question).intent }))
      .filter(({ expected, got }) => expected !== got);
    const accuracy = 1 - misses.length / heldOut.length;
    console.info(
      `Held-out accuracy: ${(accuracy * 100).toFixed(1)}% (${heldOut.length - misses.length}/${heldOut.length})`,
      misses,
    );
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });

  it('answers yes for listed skills and says when something is not listed', () => {
    const chat = new ChatSession();
    expect(chat.ask('Does he know Docker?').summary).toMatch(/^Yes — Docker/);
    expect(chat.ask('Does he know Rust?').summary).toMatch(/Rust isn't listed/);
    expect(chat.ask('react native experience?').summary).toMatch(/React native isn't listed/i);
  });

  it('answers from the resume', () => {
    const chat = new ChatSession();
    expect(chat.ask('does he know C#?').summary).toMatch(/^Yes — C#/);
    expect(chat.ask('has he used .NET').summary).toMatch(/^Yes — \.NET/);
    expect(chat.ask('can he do web scraping').summary).toMatch(/Web Scraping/);
    expect(chat.ask('what is his work experience').summary).toMatch(/2\+ years.*Cloudtek/);
    expect(chat.ask('where did he study').summary).toMatch(
      /Data Science.*International Islamic University/,
    );
  });

  it('follows up on the previous topic', () => {
    const chat = new ChatSession();
    chat.ask('does he know python');
    expect(chat.ask('and FastAPI?').summary).toMatch(/FastAPI/);
    // An unrelated question does not inherit the previous topic.
    expect(chat.ask('favourite pizza topping').summary).toMatch(/didn't find that here/);
  });

  it('gives a specific profile link when a platform is named', () => {
    expect(new ChatSession().ask('github link?').summary).toMatch(/github\.com\/shahzaibeng/);
  });

  it('declines personal questions and admits what it does not know', () => {
    expect(new ChatSession().ask('is he married').summary).toMatch(/professional profile/);
    expect(new ChatSession().ask('what is the capital of peru').summary).toMatch(
      /didn't find that here/,
    );
    expect(new ChatSession().ask('asdkjh qwe').summary).toMatch(/didn't find that here/);
  });
});
