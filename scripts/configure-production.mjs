import { writeFile } from 'node:fs/promises';
import {
  makeProductionConfig,
  parseProductionOptions,
} from './production-config.ts';
try {
  const config = makeProductionConfig(
    parseProductionOptions(process.argv.slice(2)),
  );
  await writeFile(
    'wrangler.production.jsonc',
    `${JSON.stringify(config, null, 2)}\n`,
    { flag: 'wx', mode: 0o600 },
  );
  console.log(
    'Created ignored production config. Review it, then follow docs/16_DEPLOYMENT_OPERATIONS.md. No remote action performed.',
  );
} catch {
  console.error(
    'Could not create production config. Supply actual DB/operator values; existing config is never overwritten. See docs/16_DEPLOYMENT_OPERATIONS.md.',
  );
  process.exitCode = 1;
}
