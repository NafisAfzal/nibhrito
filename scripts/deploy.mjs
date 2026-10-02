// No remote deployment is configured during the local foundation phase.
console.error(
  'Deployment is not configured. Follow docs/14_LOCAL_DEVELOPMENT.md and Phase 8: create a real Cloudflare D1 database and supply a reviewed production config before remote migrations or deployment.',
);
process.exitCode = 1;
