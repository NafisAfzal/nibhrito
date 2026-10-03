import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const css = readFileSync(
  new URL('../../src/styles.css', import.meta.url),
  'utf8',
);
const roots = [...css.matchAll(/:root\s*\{([^}]+)\}/g)];
function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)!.map((value) => {
    const n = parseInt(value, 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
function ratio(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe('semantic light/dark contrast', () => {
  test.each(['light', 'dark'])(
    '%s text, buttons, feedback and controls meet AA',
    (scheme) => {
      const tokens: Record<string, string> = {};
      for (const root of roots.slice(0, scheme === 'light' ? 1 : 2))
        for (const match of root[1]!.matchAll(/--([\w-]+):\s*(#[a-f\d]{6})/gi))
          tokens[match[1]!] = match[2]!;
      for (const surface of [
        'background',
        'surface',
        'surface-subtle',
        'primary-soft',
        'info-soft',
        'accent-soft',
      ])
        for (const text of ['foreground', 'muted', 'primary'])
          expect(ratio(tokens[text]!, tokens[surface]!)).toBeGreaterThanOrEqual(
            4.5,
          );
      for (const [fg, bg] of [
        ['on-primary', 'primary'],
        ['on-primary', 'primary-hover'],
        ['danger', 'danger-soft'],
        ['warning', 'warning-soft'],
        ['success', 'success-soft'],
        ['accent', 'accent-soft'],
        ['info', 'info-soft'],
        ['profile-rose', 'profile-rose-soft'],
        ['profile-ocean', 'profile-ocean-soft'],
      ])
        expect(ratio(tokens[fg!]!, tokens[bg!]!)).toBeGreaterThanOrEqual(4.5);
      for (const surface of ['background', 'surface']) {
        expect(
          ratio(tokens['focus-ring']!, tokens[surface]!),
        ).toBeGreaterThanOrEqual(3);
        expect(
          ratio(tokens['input-border']!, tokens[surface]!),
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );
});
