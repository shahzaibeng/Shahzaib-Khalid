import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
let fileEnv = {};
try {
  fileEnv = parseEnv(await readFile(path.join(root, 'server/.env'), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const apiPort = Number(process.env.PORT ?? fileEnv.PORT ?? 3001);
if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535)
  throw new Error('PORT must be between 1 and 65535.');
const apiUrl = 'http://127.0.0.1:' + apiPort + '/api/health';
const clientUrl = 'http://127.0.0.1:5173';
const children = [];
let stopping = false;

async function isOurs(url, kind) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return false;
    if (kind === 'api') return (await response.json()).service === 'portfolio-api';
    const html = await response.text();
    return html.includes('name="portfolio-app" content="shahzaib-khalid"');
  } catch {
    return false;
  }
}

function portFree(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', (error) => (error.code === 'EADDRINUSE' ? resolve(false) : reject(error)));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    // Kill only descendants started by this command. Reused servers belong to another terminal.
    if (process.platform === 'win32' && child.exitCode === null) {
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exitCode = code;
}

async function ensureService({ kind, port, url, file, args, cwd }) {
  if (await isOurs(url, kind)) {
    console.log(kind + ' already running: ' + url);
    return;
  }
  if (!(await portFree(port)))
    throw new Error(
      'Port ' + port + ' belongs to another app. Stop that app before starting this portfolio.',
    );
  const child = spawn(process.execPath, [file, ...args], {
    cwd,
    stdio: 'inherit',
    windowsHide: true,
  });
  children.push(child);
  child.once('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.once('exit', (code) => {
    if (!stopping) stop(code ?? 1);
  });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (stopping) throw new Error(kind + ' stopped before startup completed.');
    if (await isOurs(url, kind)) {
      console.log(kind + ' ready: ' + url);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(kind + ' did not become ready. Check its startup output above.');
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

try {
  await ensureService({
    kind: 'api',
    port: apiPort,
    url: apiUrl,
    file: path.join(root, 'node_modules/tsx/dist/cli.mjs'),
    args: ['watch', 'src/index.ts'],
    cwd: path.join(root, 'server'),
  });
  await ensureService({
    kind: 'client',
    port: 5173,
    url: clientUrl,
    file: path.join(root, 'node_modules/vite/bin/vite.js'),
    args: ['--host', '127.0.0.1'],
    cwd: path.join(root, 'client'),
  });
  console.log('\nPortfolio: ' + clientUrl + '\nAPI health: ' + apiUrl);
  if (children.length) console.log('Press Ctrl+C to stop the services started by this terminal.');
  else console.log('Both services are already running; no duplicate processes started.');
} catch (error) {
  console.error(error.message);
  stop(1);
}
