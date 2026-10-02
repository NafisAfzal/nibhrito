import { useState, type FormEvent } from 'react';
import {
  settings,
  type ProfileSettings,
  type PublicProfile,
} from '../../../shared/schemas/profile';
import { encode } from '../../../shared/protocol/encoding';
import type { RecoveryEnvelope } from '../../../shared/protocol/envelope';
import { generateRecipient, random, tokenVerifier } from '../../crypto/keys';
import { encryptRecovery, recoveryCode } from '../../crypto/recovery';
import { saveOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
interface Prepared {
  settings: ProfileSettings;
  key: Omit<Awaited<ReturnType<typeof generateRecipient>>, 'jwk'>;
  token: string;
  code: string;
  blob: RecoveryEnvelope;
}
export function Setup() {
  const [prepared, setPrepared] = useState<Prepared | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      const publicSettings = settings({
        slug: form.get('slug'),
        display_name: form.get('display_name'),
        public_prompt: form.get('public_prompt'),
        theme: form.get('theme'),
        retention_days: Number(form.get('retention_days')),
      });
      const generated = await generateRecipient(),
        token = encode(random(32)),
        code = await recoveryCode();
      const blob = await encryptRecovery(
        {
          v: 1,
          profile_slug: publicSettings.slug,
          key_id: generated.keyId,
          recipient_private_jwk: generated.jwk,
          owner_token: token,
          created_at: new Date().toISOString(),
        },
        code,
      );
      const { jwk, ...key } = generated;
      void jwk;
      setPrepared({ settings: publicSettings, key, token, code, blob });
    } catch {
      setError(
        'Check your profile details. Link names use 3–32 lowercase letters, digits, or hyphens. Your browser must support Web Crypto.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prepared) return;
    setBusy(true);
    setError('');
    try {
      const profile = await api<PublicProfile>('/api/v1/profiles', {
        method: 'POST',
        body: {
          ...prepared.settings,
          current_key_id: prepared.key.keyId,
          owner_token_hash: await tokenVerifier(prepared.token),
          recovery: prepared.blob,
        },
      });
      await saveOwner({
        id: profile.id,
        profileSlug: profile.slug,
        keyId: prepared.key.keyId,
        publicKey: prepared.key.publicKey,
        privateKey: prepared.key.privateKey,
        ownerToken: prepared.token,
      });
      setPrepared(null);
      window.location.assign('/inbox');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Setup failed. Keep your recovery code and try restoring if this profile was created.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <p className="eyebrow">Your private space</p>
      <h1>Create your profile</h1>
      <p className="lede">No email. No password. Your browser holds the key.</p>
      {error ? <Notice message={error} /> : null}
      {prepared ? (
        <section className="card">
          <h2>Save your recovery code</h2>
          <p>
            Anyone with this code can open your inbox. Save it in a password
            manager or somewhere safe.
          </p>
          <label htmlFor="recovery-code">Recovery code</label>
          <textarea
            id="recovery-code"
            readOnly
            rows={3}
            value={prepared.code}
            spellCheck={false}
          />
          <p className="muted">
            Nibhrito cannot recover this code for you. If you lose both this
            device and the recovery code, old messages may become permanently
            unreadable.
          </p>
          <form onSubmit={create}>
            <label className="check">
              <input type="checkbox" required />I saved my recovery code
              somewhere safe
            </label>
            <button disabled={busy}>
              {busy ? 'Creating profile…' : 'Create my private profile'}
            </button>
          </form>
          <button
            type="button"
            className="secondary"
            onClick={() => setPrepared(null)}
            disabled={busy}
          >
            Back
          </button>
        </section>
      ) : (
        <form className="card form" onSubmit={prepare}>
          <label>
            Display name
            <input
              name="display_name"
              required
              maxLength={64}
              autoComplete="off"
              placeholder="How should people know you?"
            />
          </label>
          <label>
            Link name
            <input
              name="slug"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              placeholder="your-name"
            />
          </label>
          <p className="hint">
            Your link name is public and cannot be changed.
          </p>
          <label>
            Public prompt
            <textarea
              name="public_prompt"
              maxLength={280}
              rows={3}
              defaultValue="What should I keep doing? What could I improve?"
            />
          </label>
          <div className="form-grid">
            <label>
              Keep messages for
              <select name="retention_days" defaultValue="30">
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </label>
            <label>
              Profile accent
              <select name="theme" defaultValue="sage">
                <option value="sage">Sage</option>
                <option value="rose">Rose</option>
                <option value="ocean">Ocean</option>
              </select>
            </label>
          </div>
          <p className="hint">
            Display name and prompt are public. Keep identifying or sensitive
            details out of them.
          </p>
          <button disabled={busy}>
            {busy ? 'Preparing keys…' : 'Prepare my recovery code'}
          </button>
        </form>
      )}
    </div>
  );
}
