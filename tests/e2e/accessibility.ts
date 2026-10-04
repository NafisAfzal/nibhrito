import axe from 'axe-core';
import type { Page } from '@playwright/test';
import { expect, test } from './test';

export async function accessible(page: Page, state: string) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // Local test instrumentation through Playwright, never a shipped script or
  // a CSP relaxation. Summarize in-browser: no node HTML/private DOM is returned.
  await page.evaluate(axe.source);
  const summary = await page.evaluate(async () => {
    const audit = (globalThis as typeof globalThis & { axe: typeof axe }).axe;
    const results = await audit.run(document, {
      runOnly: {
        type: 'tag',
        values: [
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22aa',
          'best-practice',
        ],
      },
      resultTypes: ['violations', 'incomplete'],
    });
    return {
      violations: results.violations.map((item) => ({
        rule: item.id,
        impact: item.impact,
        count: item.nodes.length,
      })),
      incomplete: results.incomplete.map((item) => ({
        rule: item.id,
        count: item.nodes.length,
      })),
    };
  });
  // Inconclusive automated checks still need human review. Keep only generic
  // rule IDs/counts in annotations, never HTML, selectors or failure summaries.
  if (summary.incomplete.length)
    test.info().annotations.push({
      type: 'manual-accessibility-review',
      description:
        state +
        ': ' +
        summary.incomplete
          .map((item) => item.rule + ' (' + item.count + ')')
          .join(', '),
    });
  expect(summary.violations, state + ' accessibility rule IDs/counts').toEqual(
    [],
  );
  return summary.incomplete;
}
