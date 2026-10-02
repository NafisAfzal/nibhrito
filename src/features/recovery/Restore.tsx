import { copy } from '../../app/copy';
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
      setError(copy.restore.couldNotRestoreThisProfileCheckYour);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <p className="eyebrow">{copy.restore.welcomeBack}</p>
      <h1>{copy.restore.restoreYourInbox}</h1>
      <p className="lede">{copy.restore.yourCodeUnlocksYourKeysLocallyWe}</p>
      {error ? <Notice message={error} /> : null}
      <form className="card form" onSubmit={restore}>
        <label>
          {copy.restore.linkName}
          <input
            name="slug"
            required
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>
        <label>
          {copy.restore.recoveryCode}
          <textarea
            name="code"
            required
            rows={3}
            maxLength={128}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button disabled={busy}>
          {busy ? copy.restore.unlockingLocally : copy.restore.restoreProfile}
        </button>
      </form>
    </div>
  );
}
