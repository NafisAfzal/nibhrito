import { useState, type FormEvent } from 'react';
import type { RecoveryEnvelope } from '../../../shared/protocol/envelope';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { slug } from '../../../shared/protocol/encoding';
import { decryptRecovery } from '../../crypto/recovery';
import { saveOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
export function Restore() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    try {
      const data = new FormData(form),
        name = slug(data.get('slug')),
        code = String(data.get('code') ?? '').trim();
      const blob = await api<RecoveryEnvelope>(`/api/v1/recovery/${name}`);
      const restored = await decryptRecovery(blob, name, code);
      const profile = await api<PublicProfile>('/api/v1/owner', {
        token: restored.ownerToken,
      });
      if (profile.slug !== name || profile.current_key_id !== restored.keyId)
        throw new Error();
      await saveOwner({ id: profile.id, ...restored });
      form.reset();
      window.location.assign('/inbox');
    } catch {
      setError(
        'Could not restore this profile. Check your link name and recovery code.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <p className="eyebrow">Welcome back</p>
      <h1>Restore your inbox</h1>
      <p className="lede">
        Your code unlocks your keys locally. We never receive it.
      </p>
      {error ? <Notice message={error} /> : null}
      <form className="card form" onSubmit={restore}>
        <label>
          Link name
          <input
            name="slug"
            required
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>
        <label>
          Recovery code
          <textarea
            name="code"
            required
            rows={3}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button disabled={busy}>
          {busy ? 'Unlocking locally…' : 'Restore profile'}
        </button>
      </form>
    </div>
  );
}
