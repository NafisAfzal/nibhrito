import { isDeepStrictEqual } from 'node:util';

export interface ProductionOptions {
  databaseId: string;
  operatorName: string;
  contactEmail: string;
  jurisdiction: string;
  workerName?: string;
}
function invalid(): never {
  throw new Error(
    'Production configuration is missing or unsafe. See docs/16_DEPLOYMENT_OPERATIONS.md.',
  );
}
function record(value: unknown): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    invalid();
  return value as Record<string, unknown>;
}
function publicText(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > 128 ||
    new TextEncoder().encode(value).length > 256 ||
    // eslint-disable-next-line no-control-regex -- Reject control characters in public configuration.
    /[\u0000-\u001f\u007f-\u009f\uD800-\uDFFF]/u.test(value)
  )
    invalid();
  return value;
}
export function makeProductionConfig(options: ProductionOptions) {
  const name = options.workerName ?? 'nibhrito';
  if (
    !/^[a-z][a-z0-9-]{1,61}[a-z0-9]$/.test(name) ||
    name.includes('local') ||
    name.includes('example')
  )
    invalid();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      options.databaseId,
    )
  )
    invalid();
  const operatorName = publicText(options.operatorName),
    jurisdiction = publicText(options.jurisdiction),
    email = options.contactEmail;
  // Matches shared/schemas/site.ts. Tests exercise both validators.
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
      email,
    ) ||
    /(?:example\.(?:com|org|net)|\.invalid|\.test)$/i.test(email)
  )
    invalid();
  if (
    /^(?:replace|your |example|todo|operator name)/i.test(operatorName) ||
    /^(?:replace|your |example|todo|jurisdiction)/i.test(jurisdiction)
  )
    invalid();
  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    name,
    main: 'worker/index.ts',
    compatibility_date: '2026-07-30',
    send_metrics: false,
    dependencies_instrumentation: { enabled: false },
    workers_dev: true,
    preview_urls: false,
    logpush: false,
    vars: {
      APP_ENV: 'production',
      CHALLENGE_ENABLED: 'false',
      PUBLIC_OPERATOR_NAME: operatorName,
      PUBLIC_CONTACT_EMAIL: email,
      PUBLIC_JURISDICTION: jurisdiction,
    },
    secrets: { required: ['RATE_LIMIT_SECRET'] },
    triggers: { crons: ['17 * * * *'] },
    observability: {
      enabled: false,
      logs: { enabled: false, invocation_logs: false },
    },
    assets: {
      directory: './dist',
      binding: 'ASSETS',
      not_found_handling: 'single-page-application',
      run_worker_first: ['/api', '/api/*'],
    },
    d1_databases: [
      {
        binding: 'DB',
        database_name: 'nibhrito-prod',
        database_id: options.databaseId,
        migrations_dir: 'migrations',
      },
    ],
  };
}
export function validateProductionConfig(value: unknown) {
  const config = record(value),
    vars = record(config['vars']);
  const bindings = config['d1_databases'];
  if (!Array.isArray(bindings) || bindings.length !== 1) invalid();
  const db = record(bindings[0]);
  if (
    typeof db['database_id'] !== 'string' ||
    typeof config['name'] !== 'string'
  )
    invalid();
  const expected = makeProductionConfig({
    databaseId: db['database_id'],
    workerName: config['name'],
    operatorName: vars['PUBLIC_OPERATOR_NAME'] as string,
    contactEmail: vars['PUBLIC_CONTACT_EMAIL'] as string,
    jurisdiction: vars['PUBLIC_JURISDICTION'] as string,
  });
  if (!isDeepStrictEqual(value, expected)) invalid();
  return expected;
}
export function parseProductionOptions(args: string[]): ProductionOptions {
  const options: Record<string, string> = {};
  const names: Record<string, string> = {
    '--database-id': 'databaseId',
    '--operator-name': 'operatorName',
    '--contact-email': 'contactEmail',
    '--jurisdiction': 'jurisdiction',
    '--worker-name': 'workerName',
  };
  for (let i = 0; i < args.length; i += 2) {
    if (!Object.hasOwn(names, args[i] ?? '')) invalid();
    const key = names[args[i] ?? ''],
      value = args[i + 1];
    if (!key || value === undefined || value.startsWith('--') || key in options)
      invalid();
    options[key] = value;
  }
  if (
    !options['databaseId'] ||
    !options['operatorName'] ||
    !options['contactEmail'] ||
    !options['jurisdiction']
  )
    invalid();
  const result = options as unknown as ProductionOptions;
  makeProductionConfig(result);
  return result;
}
export function rateSecret(contents: string) {
  const lines = contents
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));
  if (
    lines.length !== 1 ||
    !/^RATE_LIMIT_SECRET=[A-Za-z0-9_-]{43}$/.test(lines[0] ?? '')
  )
    throw new Error(
      'Production rate secret is missing or malformed. Use npm run production:secret.',
    );
  const secret = lines[0]!.slice('RATE_LIMIT_SECRET='.length),
    bytes = Uint8Array.from(
      atob(secret.replace(/-/g, '+').replace(/_/g, '/') + '='),
      (c) => c.charCodeAt(0),
    );
  try {
    if (
      bytes.length !== 32 ||
      btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '') !== secret ||
      bytes.every((b) => b === bytes[0])
    )
      throw new Error('Invalid production rate secret.');
    return secret;
  } finally {
    bytes.fill(0);
  }
}
