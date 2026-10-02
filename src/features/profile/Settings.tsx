import { useState, type FormEvent } from 'react';
import type { PublicProfile } from '../../../shared/schemas/profile';
import type { LocalOwner } from '../../storage/indexedDb';
import { forgetOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
export function Settings({
  owner,
  profile,
  onUpdate,
}: {
  owner: LocalOwner;
  profile: PublicProfile;
  onUpdate: (profile: PublicProfile) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [confirmation, setConfirmation] = useState('');
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const form = new FormData(event.currentTarget);
      const updated = await api<PublicProfile>(
        `/api/v1/profiles/${profile.id}`,
        {
          method: 'PATCH',
          token: owner.ownerToken,
          body: {
            display_name: form.get('display_name'),
            public_prompt: form.get('public_prompt'),
            theme: form.get('theme'),
            retention_days: Number(form.get('retention_days')),
            is_disabled: form.has('is_disabled'),
          },
        },
      );
      onUpdate(updated);
      setSaved(true);
    } catch {
      setError(
        'Settings could not be saved. Check the field lengths and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function forget() {
    if (
      !window.confirm(
        'Remove this browser’s key and owner token? Make sure your recovery code is saved first. Messages on the server are unchanged.',
      )
    )
      return;
    try {
      await forgetOwner(owner.profileSlug);
      window.location.replace('/inbox');
    } catch {
      setError('Browser storage could not be cleared.');
    }
  }
  async function remove() {
    if (
      confirmation !== profile.slug ||
      busy ||
      !window.confirm(
        'Permanently delete this profile, all messages and its encrypted recovery bundle?',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/v1/profiles/${profile.id}`, {
        method: 'DELETE',
        token: owner.ownerToken,
      });
      await forgetOwner(owner.profileSlug);
      window.location.replace('/inbox');
    } catch {
      setError('Deletion could not be confirmed. Refresh and try again.');
      setBusy(false);
    }
  }
  return (
    <details className="card settings">
      <summary>Profile settings & security</summary>
      <h2>Make this space yours</h2>
      {error ? <Notice message={error} /> : null}
      {saved ? <p role="status">Settings saved.</p> : null}
      <form className="form" onSubmit={update}>
        <label>
          Display name
          <input
            name="display_name"
            defaultValue={profile.display_name}
            required
            maxLength={64}
          />
        </label>
        <label>
          Public prompt
          <textarea
            name="public_prompt"
            defaultValue={profile.public_prompt}
            maxLength={280}
            rows={3}
          />
        </label>
        <div className="form-grid">
          <label>
            Keep new messages for
            <select name="retention_days" defaultValue={profile.retention_days}>
              {[1, 7, 30, 90].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profile accent
            <select name="theme" defaultValue={profile.theme}>
              <option value="sage">Sage</option>
              <option value="rose">Rose</option>
              <option value="ocean">Ocean</option>
            </select>
          </label>
        </div>
        <p className="hint">
          Retention changes apply to new messages. Existing expiry dates stay
          the same.
        </p>
        <label className="check">
          <input
            type="checkbox"
            name="is_disabled"
            defaultChecked={profile.is_disabled}
          />
          Pause incoming messages
        </label>
        <button disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
      <h3>Your browser key</h3>
      <p className="hint">
        Non-extractable key stored in IndexedDB. Anyone able to run code in this
        browser profile may still use it. Your saved recovery code restores
        access; Nibhrito cannot reset it. This device cannot reveal the original
        recovery code.
      </p>
      <p className="fingerprint">Key fingerprint: {owner.keyId}</p>
      <button
        type="button"
        className="secondary"
        onClick={() => {
          void forget();
        }}
        disabled={busy}
      >
        Forget this profile on this device
      </button>
      <h3>Delete your profile</h3>
      <p>
        This removes the profile, messages and encrypted recovery bundle from
        active storage. Provider backups and copies others made may remain
        temporarily.
      </p>
      <label>
        Type your link name to delete
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
        />
      </label>
      <button
        className="danger"
        disabled={busy || confirmation !== profile.slug}
        onClick={() => {
          void remove();
        }}
      >
        Permanently delete profile
      </button>
    </details>
  );
}
