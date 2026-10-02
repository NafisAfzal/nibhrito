import { expect, it } from 'vitest';
import { encodeCursor, parseCursor } from '../../shared/schemas/inbox';
it('validates bounded cursor metadata and profile binding', () => {
  const value = {
    id: crypto.randomUUID(),
    profile_id: crypto.randomUUID(),
    created_at: 123,
  };
  expect(parseCursor(encodeCursor(value), value.profile_id)).toEqual(value);
  for (const cursor of [
    encodeCursor({ ...value, created_at: -1 }),
    encodeCursor({ ...value, id: '../../sql' }),
    'x'.repeat(1000),
    'e30',
  ])
    expect(() => parseCursor(cursor, value.profile_id)).toThrow();
  expect(() => parseCursor(encodeCursor(value), crypto.randomUUID())).toThrow();
});
