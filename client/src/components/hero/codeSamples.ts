export type Language = 'ts' | 'py' | 'sql' | 'docker';

export interface CodeSample {
  /** The tech pill that opens this file. */
  tech: string;
  file: string;
  language: Language;
  status: string;
  code: string;
}

// One representative snippet per technology in the hero stack.
export const codeSamples: CodeSample[] = [
  {
    tech: 'Next.js 14',
    file: 'app/api/chat/route.ts',
    language: 'ts',
    status: 'Next.js 14 · Edge route handler',
    code: `// Streams model tokens straight to the browser
import { NextRequest } from 'next/server';
import { streamAnswer } from '@/lib/agent';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { question, sessionId } = await req.json();
  const stream = await streamAnswer({ question, sessionId });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}`,
  },
  {
    tech: 'FastAPI',
    file: 'api.py',
    language: 'py',
    status: 'Python · FastAPI',
    code: `# Typed, rate-limited endpoint in front of the agent
from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field
from .agent import answer
from .limits import rate_limit

app = FastAPI(title="Knowledge API")

class Query(BaseModel):
    question: str = Field(min_length=3, max_length=2000)

@app.post("/ask", dependencies=[Depends(rate_limit)])
async def ask(query: Query):
    return await answer(query.question)`,
  },
  {
    tech: 'Python',
    file: 'ingest.py',
    language: 'py',
    status: 'Python · Async ingestion',
    code: `# Chunk, embed, and store documents concurrently
import asyncio
from .embed import embed_batch
from .store import upsert

async def ingest(docs: list[str], size: int = 800) -> int:
    chunks = [d[i:i + size] for d in docs for i in range(0, len(d), size)]
    batches = [chunks[i:i + 64] for i in range(0, len(chunks), 64)]
    vectors = await asyncio.gather(*(embed_batch(b) for b in batches))
    await upsert(chunks, [v for batch in vectors for v in batch])
    return len(chunks)`,
  },
  {
    tech: 'Ollama / LLMs',
    file: 'agent.py',
    language: 'py',
    status: 'Ollama · Tool-calling agent',
    code: `# Local model with tools, via Ollama
import ollama
from .tools import search_docs, TOOLS

async def answer(question: str) -> dict:
    messages = [{"role": "user", "content": question}]
    reply = await ollama.AsyncClient().chat(
        model="llama3.1", messages=messages, tools=TOOLS
    )
    for call in reply.message.tool_calls or []:
        context = await search_docs(**call.function.arguments)
        messages.append({"role": "tool", "content": context})
    return {"answer": reply.message.content}`,
  },
  {
    tech: 'PostgreSQL',
    file: 'schema.sql',
    language: 'sql',
    status: 'PostgreSQL · pgvector',
    code: `-- Semantic search with pgvector
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunks (
  id         BIGSERIAL PRIMARY KEY,
  content    TEXT NOT NULL,
  embedding  VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

SELECT id, content FROM chunks
ORDER BY embedding <=> $1 LIMIT 5;`,
  },
];
