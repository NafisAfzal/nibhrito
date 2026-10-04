import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Reports categories and locations only, never matching values or file bodies.
// Complements manual content/image review; it cannot prove absence of every secret.
function git(args, input) {
  const result = spawnSync('git', args, {
    input,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error('Repository inventory unavailable.');
  return result.stdout;
}

const rules = [
  [
    'private key',
    /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/,
  ],
  [
    'GitHub credential',
    /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{40,255})\b/,
  ],
  ['AWS credential', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Slack credential', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ['recovery code', /NBR1-[A-Za-z0-9_-]{43}-[A-Za-z0-9_-]{8}/],
  ['owner bearer credential', /Bearer [A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/],
  ['literal private JWK', /\bd['"]?\s*:\s*['"][A-Za-z0-9_-]{43}['"]/],
  [
    'assigned credential',
    /(?:RATE_LIMIT_SECRET|CLOUDFLARE_API_TOKEN|GITHUB_TOKEN|GH_TOKEN|api[_-]?key|password)\s*['"]?\s*[=:]\s*['"]?[A-Za-z0-9_+/-]{32,}/i,
  ],
  ['credential URL', /https?:\/\/[^\s/:]+:[^\s/@]+@/],
];
const findings = new Set();
const visuals = new Set();
const approvedVisuals = new Set(['docs/assets/overview.png']);
function pathCheck(path, location) {
  if (
    /(?:^|\/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$/.test(path) &&
    !path.endsWith('.example')
  )
    findings.add(`${location}: secret environment file`);
  if (
    /(?:^|\/)(?:node_modules|dist|\.wrangler|coverage|test-results|playwright-report|backups|\.idea|\.vscode)\//.test(
      path,
    ) ||
    /(?:^|\/)wrangler\.production\.jsonc$|\.(?:db|sqlite3?)(?:-\w+)?$|\.(?:log|pem|key|p12|pfx|zip|mp4|webm|tmp|temp|bak|swp|swo)$|(?:^|\/)(?:\.DS_Store|Thumbs\.db)$/.test(
      path,
    )
  )
    findings.add(`${location}: private or generated file`);
}
function contentCheck(data, path, location) {
  pathCheck(path, location);
  if (data.length > 1024 * 1024)
    findings.add(`${location}: file exceeds 1 MiB; review before publication`);
  if (/\.(?:png|jpe?g|gif|webp|svg)$/.test(path)) {
    visuals.add(path);
    if (!approvedVisuals.has(path))
      findings.add(`${location}: visual requires explicit privacy review`);
  }
  if (data.includes(0)) {
    if (!approvedVisuals.has(path))
      findings.add(`${location}: unreviewed binary file`);
    return;
  }
  const source = data.toString('utf8');
  for (const [category, pattern] of rules)
    if (pattern.test(source)) findings.add(`${location}: possible ${category}`);
}

const files = git([
  'ls-files',
  '--cached',
  '--others',
  '--exclude-standard',
  '-z',
])
  .toString('utf8')
  .split('\0')
  .filter(Boolean);
for (const path of new Set(files)) {
  try {
    contentCheck(readFileSync(path), path, `current ${path}`);
  } catch {
    findings.add(`current ${path}: cannot read inventoried file`);
  }
}

// Include every ref and local reflog, not just HEAD or the current index.
const inventory = git(['rev-list', '--objects', '--all', '--reflog'])
  .toString('utf8')
  .trim()
  .split('\n');
const names = new Map(
  inventory.map((line) => {
    const space = line.indexOf(' ');
    return space < 0
      ? [line, '']
      : [line.slice(0, space), line.slice(space + 1)];
  }),
);
// Also check paths that reuse an existing blob under a different filename.
const historyPaths = git([
  'log',
  '--all',
  '--reflog',
  '--format=',
  '--name-only',
  '-z',
])
  .toString('utf8')
  .split('\0')
  .map((path) => path.trim())
  .filter(Boolean);
for (const path of new Set(historyPaths)) pathCheck(path, `history ${path}`);

const batch = git(['cat-file', '--batch'], [...names.keys()].join('\n') + '\n');
let offset = 0;
let blobs = 0;
let bytes = 0;
let largest = { path: '', bytes: 0 };
while (offset < batch.length) {
  const end = batch.indexOf(10, offset);
  if (end < 0) throw new Error('Incomplete Git object inventory.');
  const [oid, type, sizeText] = batch
    .subarray(offset, end)
    .toString()
    .split(' ');
  const size = Number(sizeText);
  if (!Number.isSafeInteger(size) || size < 0 || end + size + 1 >= batch.length)
    throw new Error('Invalid Git object inventory.');
  const data = batch.subarray(end + 1, end + 1 + size);
  const path = names.get(oid) || '';
  if (type === 'blob') {
    contentCheck(data, path, `history ${path} (${oid.slice(0, 12)})`);
    blobs++;
    bytes += size;
    if (size > largest.bytes) largest = { path, bytes: size };
  } else if (type === 'commit' || type === 'tag') {
    contentCheck(data, '', `${type} ${oid.slice(0, 12)}`);
  }
  offset = end + 1 + size + 1;
}

if (findings.size) {
  for (const finding of findings) console.error(finding);
  process.exitCode = 1;
} else {
  console.log(
    `Repository audit passed: ${new Set(files).size} current files, ${blobs} historical blob versions, ${bytes} historical bytes.`,
  );
  console.log(
    `Largest historical blob: ${largest.path}, ${largest.bytes} bytes.`,
  );
  console.log(
    `Reviewed visual paths: ${[...visuals].join(', ') || 'none'}. Re-review pixels whenever changed.`,
  );
  console.log(
    'No common credential matches or prohibited generated/private files. Manual review remains required.',
  );
}
