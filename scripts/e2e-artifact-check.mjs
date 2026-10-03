import {
  mkdtemp,
  mkdir,
  writeFile,
  readdir,
  readFile,
  rm,
} from 'node:fs/promises';
import { resolve, join, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const parent = resolve('.wrangler');
await mkdir(parent, { recursive: true });
const dir = await mkdtemp(join(parent, 'artifact-check-'));
const marker = randomBytes(32).toString('hex');
async function cleanup() {
  if (
    dirname(resolve(dir)) !== parent ||
    !basename(dir).startsWith('artifact-check-')
  )
    throw new Error('Unsafe artifact cleanup path.');
  await rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}
try {
  await writeFile(
    join(dir, 'probe.spec.ts'),
    `import { test, expect } from '../../tests/e2e/test';
test('intentional failure checks artifact privacy', async ({page})=>{
  await page.setContent('<label>Recovery code<textarea>'+process.env['NIBHRITO_ARTIFACT_PROBE']+'</textarea></label>');
  await expect(page.getByRole('button',{name:'Missing control'})).toBeVisible({timeout:100});
});`,
  );
  await writeFile(
    join(dir, 'config.mjs'),
    `export default {testDir:'.',workers:1,reporter:'dot',use:{browserName:'chromium',trace:'off',screenshot:'off',video:'off'},outputDir:'./output'};`,
  );
  const run = spawnSync(
    process.execPath,
    [
      'node_modules/@playwright/test/cli.js',
      'test',
      '--config',
      join(dir, 'config.mjs'),
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        PLAYWRIGHT_NO_COPY_PROMPT: '1',
        NIBHRITO_ARTIFACT_PROBE: marker,
      },
      timeout: 60000,
    },
  );
  if (run.status !== 1 || (run.stdout + run.stderr).includes(marker))
    throw new Error('Artifact privacy probe failed.');
  let contexts = 0;
  async function inspect(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) await inspect(file);
      else {
        const content = await readFile(file, 'utf8');
        if (content.includes(marker) || content.includes('```yaml'))
          throw new Error('Private DOM found in failure artifacts.');
        if (entry.name === 'error-context.md') contexts++;
      }
    }
  }
  await inspect(join(dir, 'output'));
  if (!contexts) throw new Error('Probe did not exercise failure artifacts.');
  console.log(
    'Intentional assertion failure: no private DOM in output or artifacts.',
  );
} finally {
  await cleanup();
}
