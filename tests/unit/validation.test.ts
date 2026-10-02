import { expect, it } from 'vitest';
import { object, text } from '../../shared/protocol/encoding';
import { siteInfo } from '../../shared/schemas/site';
it('rejects non-JSON prototypes and malformed Unicode', () => {
  expect(() => object(Object.create({ v: 1 }), ['v'])).toThrow();
  expect(() => object(new Date(), [])).toThrow();
  expect(() => text('\ud800', 100, 100)).toThrow();
  expect(() => object(JSON.parse('{"__proto__":{}}') as unknown, [])).toThrow();
});
it('requires real operator metadata and rejects contact link injection', () => {
  const data = {
    operator_name: 'Operator',
    contact_email: 'support@service.org',
    jurisdiction: 'Declared jurisdiction',
    local: false,
  };
  expect(siteInfo(data)).toEqual(data);
  for (const bad of [
    '',
    'javascript:alert(1)',
    'a@example.com',
    'a@b.invalid',
    'x\r\nBcc:someone@service.org',
  ])
    expect(() => siteInfo({ ...data, contact_email: bad })).toThrow();
});
