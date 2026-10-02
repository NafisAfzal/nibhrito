import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
let failures = 0;
function fail(path, reason) {
  console.error(`${path}: ${reason}`);
  failures++;
}
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      await scan(file);
      continue;
    }
    if (!/\.(?:tsx?|html|css)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    if (/\bconsole\.(?:log|warn|error|info|debug)\s*\(/.test(source))
      fail(file, 'runtime logging is prohibited');
    if (
      /\b(?:localStorage|sessionStorage|dangerouslySetInnerHTML)\b/.test(source)
    )
      fail(file, 'unsafe persistent storage or HTML rendering');
    if (dir.startsWith('worker') && /from\s+['"][^'"]*src\//.test(source))
      fail(file, 'backend imports browser modules');
    if (/<script[^>]*src=['"]https?:|@import\s+url\(['"]?https?:/.test(source))
      fail(file, 'remote runtime script/style');
  }
}
await scan('src');
await scan('worker');
await scan('public');
const git = spawnSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' },
);
if (git.status !== 0) throw new Error('Git file inventory unavailable.');
for (const file of git.stdout.split(/\r?\n/).filter(Boolean)) {
  if (
    /(?:^|\/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$/.test(file) &&
    !file.endsWith('.example')
  )
    fail(file, 'secret configuration must be ignored');
  if (!/\.(?:tsx?|mjs|md|jsonc?|html|txt|sql)$/.test(file)) continue;
  const source = await readFile(file, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|NBR1-[A-Za-z0-9_-]{43}-[A-Za-z0-9_-]{8}|Bearer [A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/.test(
      source,
    )
  )
    fail(file, 'possible literal private key/recovery code/bearer credential');
}
if (failures) process.exitCode = 1;
else
  console.log(
    'Privacy source and tracked-secret checks passed. Review complements these narrow static rules.',
  );
