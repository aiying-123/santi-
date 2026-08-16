import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(repoRoot, 'talkloop', 'v11-media.js'), 'utf8');
const directUrls = [...source.matchAll(/https:\/\/[^'"\s]+\.mp4/g)]
  .map((match) => match[0])
  .filter((url) => !url.includes('${'));
const mixkitUrls = [...source.matchAll(/mx\((\d+)\)/g)]
  .map((match) => `https://assets.mixkit.co/videos/${match[1]}/${match[1]}-720.mp4`);
const urls = [...new Set([...directUrls, ...mixkitUrls])];

async function check(url) {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-1' },
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = response.headers.get('content-type') || '';
    const ok = (response.status === 200 || response.status === 206) && contentType.startsWith('video/');
    await response.body?.cancel();
    return { url, status: response.status, contentType, ok };
  } catch (error) {
    return { url, status: 0, contentType: '', ok: false, error: error.message };
  }
}

const results = [];
const queue = [...urls];
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    results.push(await check(url));
  }
});
await Promise.all(workers);

results.sort((a, b) => a.url.localeCompare(b.url));
const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  status: failed.length ? 'failed' : 'passed',
  checked: results.length,
  available: results.length - failed.length,
  failed,
}, null, 2));
if (failed.length) process.exitCode = 1;
