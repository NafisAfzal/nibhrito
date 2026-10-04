import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';

test('publication audit catches current and removed credentials without printing them', () => {
  const parent = resolve('.wrangler');
  mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(join(parent, 'repository-audit-test-'));
  const scanner = resolve('scripts/repository-check.mjs');
  function cleanup() {
    if (
      dirname(resolve(dir)) !== parent ||
      !basename(dir).startsWith('repository-audit-test-')
    )
      throw new Error('Unsafe audit fixture cleanup path.');
    rmSync(dir, { recursive: true, force: true });
  }
  function git(args) {
    const result = spawnSync(
      'git',
      [
        '-c',
        'user.name=Audit fixture',
        '-c',
        'user.email=audit@example.invalid',
        '-c',
        'commit.gpgsign=false',
        '-c',
        `core.hooksPath=${join(dir, 'disabled-hooks')}`,
        ...args,
      ],
      { cwd: dir, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, 'Disposable Git fixture operation failed.');
  }
  const scan = () =>
    spawnSync(process.execPath, [scanner], {
      cwd: dir,
      encoding: 'utf8',
    });
  try {
    git(['init', '--quiet', '--initial-branch=main']);
    writeFileSync(join(dir, 'README.md'), 'Synthetic audit fixture\n');
    git(['add', 'README.md']);
    git(['commit', '--quiet', '-m', 'Synthetic audit baseline']);
    assert.equal(scan().status, 0, 'Clean repository should pass.');

    // Deliberately invalid synthetic value, never an operational credential.
    const marker = 'ghp_' + 'A'.repeat(36);
    writeFileSync(join(dir, 'fixture.txt'), marker + '\n');
    let result = scan();
    assert.equal(
      result.status,
      1,
      'Untracked credential should prevent publication.',
    );
    assert.ok(
      !(result.stdout + result.stderr).includes(marker),
      'Never print a matched value.',
    );

    git(['add', 'fixture.txt']);
    git(['commit', '--quiet', '-m', 'Synthetic historical fixture']);
    writeFileSync(
      join(dir, 'fixture.txt'),
      'Value removed from current file\n',
    );
    git(['add', 'fixture.txt']);
    git(['commit', '--quiet', '-m', 'Synthetic fixture removal']);
    result = scan();
    assert.equal(
      result.status,
      1,
      'Removed historical credential should still prevent publication.',
    );
    assert.match(result.stderr, /history fixture\.txt/);
    assert.ok(
      !(result.stdout + result.stderr).includes(marker),
      'Historical matches must stay redacted.',
    );

    writeFileSync(
      join(dir, '.dev.vars'),
      '# harmless file, unsafe publication path\n',
    );
    writeFileSync(
      join(dir, 'private.json'),
      JSON.stringify({ d: 'A'.repeat(43) }),
    );
    mkdirSync(join(dir, 'dist'));
    writeFileSync(join(dir, 'dist', 'index.html'), '<p>Generated fixture</p>');
    writeFileSync(join(dir, 'unknown.bin'), new Uint8Array([0, 1, 2]));
    result = scan();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /current \.dev\.vars: secret environment file/);
    assert.match(
      result.stderr,
      /current private\.json: possible literal private JWK/,
    );
    assert.match(
      result.stderr,
      /current dist\/index\.html: private or generated file/,
    );
    assert.match(result.stderr, /current unknown\.bin: unreviewed binary file/);
  } finally {
    cleanup();
  }
});
