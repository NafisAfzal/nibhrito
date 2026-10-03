import { test as base, expect } from '@playwright/test';

// The pinned runner's NO_COPY_PROMPT flag suppresses teardown snapshots, but
// failed locator assertions still attach a complete DOM via errorContext.
// This automatic fixture tears down before the runner writes failure artifacts.
// Keep assertion messages/stacks and all checks; discard private DOM context.
export const test = base.extend<{ privateArtifacts: void }>({
  privateArtifacts: [
    async ({ browserName }, use, info) => {
      void browserName;
      await use();
      for (const error of info.errors)
        delete (error as typeof error & { errorContext?: unknown })
          .errorContext;
    },
    { auto: true },
  ],
});
export { expect };
