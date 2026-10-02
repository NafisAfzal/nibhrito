import { copy } from '../../app/copy';
import { useState, type FormEvent } from 'react';
import type { PublicProfile } from '../../../shared/schemas/profile';
import type { LocalOwner } from '../../storage/indexedDb';
import { forgetOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { BackupExport } from '../recovery/Backup';
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
      setError(copy.settings.settingsCouldNotBeSavedCheckThe);
    } finally {
      setBusy(false);
    }
  }
  async function forget() {
    if (!window.confirm(copy.settings.removeThisBrowserSKeyAndOwner)) return;
    try {
      await forgetOwner(owner.profileSlug);
      window.location.replace('/inbox');
    } catch {
      setError(copy.settings.browserStorageCouldNotBeCleared);
    }
  }
  async function remove() {
    if (
      confirmation !== profile.slug ||
      busy ||
      !window.confirm(copy.settings.permanentlyDeleteThisProfileAllMessagesAnd)
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
      setError(copy.settings.deletionCouldNotBeConfirmedRefreshAnd);
      setBusy(false);
    }
  }
  return (
    <details className="card settings">
      <summary>{copy.settings.profileSettingsSecurity}</summary>
      <h2>{copy.settings.makeThisSpaceYours}</h2>
      {error ? <Notice message={error} /> : null}
      {saved ? <p role="status">{copy.settings.settingsSaved}</p> : null}
      <form className="form" onSubmit={update}>
        <label>
          {copy.settings.displayName}
          <input
            name="display_name"
            defaultValue={profile.display_name}
            required
            maxLength={64}
          />
        </label>
        <label>
          {copy.settings.publicPrompt}
          <textarea
            name="public_prompt"
            defaultValue={profile.public_prompt}
            maxLength={280}
            rows={3}
          />
        </label>
        <div className="form-grid">
          <label>
            {copy.settings.keepNewMessagesFor}
            <select name="retention_days" defaultValue={profile.retention_days}>
              {[1, 7, 30, 90].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </label>
          <label>
            {copy.settings.profileAccent}
            <select name="theme" defaultValue={profile.theme}>
              <option value="sage">{copy.settings.sage}</option>
              <option value="rose">{copy.settings.rose}</option>
              <option value="ocean">{copy.settings.ocean}</option>
            </select>
          </label>
        </div>
        <p className="hint">
          {copy.settings.retentionChangesApplyToNewMessagesExisting}
        </p>
        <label className="check">
          <input
            type="checkbox"
            name="is_disabled"
            defaultChecked={profile.is_disabled}
          />
          {copy.settings.pauseIncomingMessages}
        </label>
        <button disabled={busy}>
          {busy ? copy.settings.saving : copy.settings.saveSettings}
        </button>
      </form>
      <h3>{copy.settings.yourBrowserKey}</h3>
      <p className="hint">
        {copy.settings.nonExtractableKeyStoredInIndexeddbAnyone}
      </p>
      <p className="fingerprint">
        {copy.settings.keyFingerprint} {owner.keyId}
      </p>
      <button
        type="button"
        className="secondary"
        onClick={() => {
          void forget();
        }}
        disabled={busy}
      >
        {copy.settings.forgetThisProfileOnThisDevice}
      </button>
      <BackupExport owner={owner} />
      <h3>{copy.settings.deleteYourProfile}</h3>
      <p>{copy.settings.thisRemovesTheProfileMessagesAndEncrypted}</p>
      <label>
        {copy.settings.typeYourLinkNameToDelete}
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
        {copy.settings.permanentlyDeleteProfile}
      </button>
    </details>
  );
}
