import {
  decode,
  decodeUtf8,
  encode,
  object,
  utf8,
  uuid,
  ValidationError,
} from '../protocol/encoding';
import type { MessageEnvelope } from '../protocol/envelope';
export interface StoredMessage {
  envelope: MessageEnvelope;
  created_at: number;
  expires_at: number;
}
export interface InboxPage {
  messages: StoredMessage[];
  next_cursor: string | null;
}
export interface Cursor {
  created_at: number;
  id: string;
  profile_id: string;
}
export function encodeCursor(value: Cursor): string {
  return encode(new Uint8Array(utf8.encode(JSON.stringify(value))));
}
export function parseCursor(value: string, profileId: string): Cursor {
  const data = object(
    JSON.parse(decodeUtf8(decode(value, 1, 256).buffer)) as unknown,
    ['created_at', 'id', 'profile_id'],
  );
  if (
    !Number.isSafeInteger(data['created_at']) ||
    Number(data['created_at']) < 0 ||
    data['profile_id'] !== profileId
  )
    throw new ValidationError();
  return {
    created_at: Number(data['created_at']),
    id: uuid(data['id']),
    profile_id: uuid(data['profile_id']),
  };
}
