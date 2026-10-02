export class ValidationError extends Error {
  constructor() {
    super('Invalid data.');
    this.name = 'ValidationError';
  }
}
export const utf8 = new TextEncoder();
export const decodeUtf8 = (bytes: ArrayBuffer) =>
  new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
export function encode(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
export function decode(
  value: unknown,
  min: number,
  max = min,
): Uint8Array<ArrayBuffer> {
  if (
    typeof value !== 'string' ||
    value.length > Math.ceil((max * 4) / 3) ||
    !/^[A-Za-z0-9_-]+$/.test(value) ||
    value.length % 4 === 1
  )
    throw new ValidationError();
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = Uint8Array.from(
      atob(
        value.replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (value.length % 4)) % 4),
      ),
      (c) => c.charCodeAt(0),
    );
  } catch {
    throw new ValidationError();
  }
  if (bytes.length < min || bytes.length > max || encode(bytes) !== value)
    throw new ValidationError();
  return bytes;
}
export function object(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null) ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !fields.includes(k))
  )
    throw new ValidationError();
  return value as Record<string, unknown>;
}
export function text(
  value: unknown,
  maxBytes: number,
  maxPoints: number,
  allowEmpty = false,
): string {
  if (
    typeof value !== 'string' ||
    new TextDecoder().decode(utf8.encode(value)) !== value ||
    (!allowEmpty && !value.trim()) ||
    [...value].length > maxPoints ||
    utf8.encode(value).length > maxBytes
  )
    throw new ValidationError();
  return value;
}
export function slug(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(value)
  )
    throw new ValidationError();
  return value;
}
export function uuid(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      value,
    )
  )
    throw new ValidationError();
  return value;
}
export function timestamp(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  )
    throw new ValidationError();
  return value;
}
