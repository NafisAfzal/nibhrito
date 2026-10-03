import { copy } from '../../app/copy';
import { useState, type FormEvent } from 'react';
import type { RecoveryEnvelope } from '../../../shared/protocol/envelope';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { slug } from '../../../shared/protocol/encoding';
import { decryptRecovery } from '../../crypto/recovery';
import { saveOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { PageIntro } from '../../components/PageIntro';
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
      window.location.assign('/inbox?space=' + name);
    } catch {
      setError(copy.restore.couldNotRestoreThisProfileCheckYour);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <PageIntro
        eyebrow={copy.restore.welcomeBack}
        title={copy.restore.restoreYourInbox}
        icon="shield"
      >
        <p>{copy.restore.yourCodeUnlocksYourKeysLocallyWe}</p>
      </PageIntro>
      {error ? <Notice message={error} id="restore-error" /> : null}
      <form
        className="card form"
        onSubmit={restore}
        aria-describedby={error ? 'restore-error' : undefined}
      >
        <label>
          {copy.restore.linkName}
          <input
            name="slug"
            aria-describedby={
              'restore-link-hint' + (error ? ' restore-error' : '')
            }
            required
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>
        <p className="hint" id="restore-link-hint">
          {copy.ui.restoreHint}
        </p>
        <label>
          {copy.restore.recoveryCode}
          <textarea
            name="code"
            className="recovery-code"
            aria-describedby={
              'restore-code-hint' + (error ? ' restore-error' : '')
            }
            required
            rows={3}
            maxLength={128}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p className="hint" id="restore-code-hint">
          {copy.ui.recoveryHint}
        </p>
        <button disabled={busy}>
          {busy ? copy.restore.unlockingLocally : copy.restore.restoreProfile}
        </button>
      </form>
      <details className="advanced-details">
        <summary>{copy.ui.lostCode}</summary>
        <p>{copy.ui.lostCodeBody}</p>
      </details>
    </div>
  );
}
