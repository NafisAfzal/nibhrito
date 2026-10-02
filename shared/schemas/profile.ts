import {
  decode,
  object,
  slug,
  text,
  ValidationError,
} from '../protocol/encoding';
import { recoveryEnvelope, type RecoveryEnvelope } from '../protocol/envelope';
export interface ProfileSettings {
  slug: string;
  display_name: string;
  public_prompt: string;
  theme: 'sage' | 'rose' | 'ocean';
  retention_days: 1 | 7 | 30 | 90;
}
export interface PublicProfile extends ProfileSettings {
  id: string;
  current_key_id: string;
  is_disabled: boolean;
  created_at: number;
  updated_at: number;
}
export interface CreateProfile extends ProfileSettings {
  current_key_id: string;
  owner_token_hash: string;
  recovery: RecoveryEnvelope;
}
export const settingsFields = [
  'slug',
  'display_name',
  'public_prompt',
  'theme',
  'retention_days',
];
export function settings(value: unknown): ProfileSettings {
  const data = object(value, settingsFields);
  if (
    !['sage', 'rose', 'ocean'].includes(data['theme'] as string) ||
    ![1, 7, 30, 90].includes(data['retention_days'] as number)
  )
    throw new ValidationError();
  return {
    slug: slug(data['slug']),
    display_name: text(data['display_name'], 256, 64),
    public_prompt: text(data['public_prompt'], 1120, 280, true),
    theme: data['theme'] as ProfileSettings['theme'],
    retention_days: data['retention_days'] as ProfileSettings['retention_days'],
  };
}
export function createProfile(value: unknown): CreateProfile {
  const data = object(value, [
    ...settingsFields,
    'current_key_id',
    'owner_token_hash',
    'recovery',
  ]);
  const publicSettings = settings(
    Object.fromEntries(settingsFields.map((k) => [k, data[k]])),
  );
  decode(data['current_key_id'], 32);
  decode(data['owner_token_hash'], 32);
  const recovery = recoveryEnvelope(data['recovery']);
  if (recovery.key_id !== data['current_key_id']) throw new ValidationError();
  return {
    ...publicSettings,
    current_key_id: data['current_key_id'] as string,
    owner_token_hash: data['owner_token_hash'] as string,
    recovery,
  };
}
