import { ValidationError } from '../../shared/protocol/encoding';
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  if (
    (origin !== null && origin !== new URL(request.url).origin) ||
    request.headers.get('Sec-Fetch-Site') === 'cross-site'
  )
    throw new HttpError(403, 'FORBIDDEN', 'Request not allowed.');
}
export async function boundedJson(
  request: Request,
  limit = 16384,
): Promise<unknown> {
  checkOrigin(request);
  if (
    request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !==
    'application/json'
  )
    throw new HttpError(415, 'CONTENT_TYPE', 'JSON is required.');
  const length = request.headers.get('Content-Length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit))
    throw new HttpError(413, 'TOO_LARGE', 'Request is too large.');
  if (!request.body) throw new ValidationError();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new HttpError(413, 'TOO_LARGE', 'Request is too large.');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(
      new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes),
    ) as unknown;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new ValidationError();
  } finally {
    reader.releaseLock();
  }
}
export async function noBody(request: Request) {
  // Workers may expose an empty stream for a bodyless DELETE (Content-Length: 0).
  if (!request.body) return;
  const reader = request.body.getReader();
  try {
    const chunk = await reader.read();
    if (!chunk.done) {
      await reader.cancel();
      throw new ValidationError();
    }
  } finally {
    reader.releaseLock();
  }
}
