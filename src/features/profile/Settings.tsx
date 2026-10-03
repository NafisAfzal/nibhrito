import { copy } from '../../app/copy';
import { useState, type FormEvent } from 'react';
import type { PublicProfile } from '../../../shared/schemas/profile';
import type { LocalOwner } from '../../storage/indexedDb';
import { forgetOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { BackupExport } from '../recovery/Backup';
import { PageIntro } from '../../components/PageIntro';
import { Icon } from '../../components/Icon';
import { story } from '../../app/story';
import { RecoveryFlow } from '../../components/ProductStory';
export function Settings({
  owner,
  profile,
  onUpdate,
  mode,
}: {
  owner: LocalOwner;
  mode: 'profile' | 'security';
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
    <section className="settings">
      <PageIntro
        eyebrow={mode === 'profile' ? copy.ui.profile : copy.ui.security}
        title={
          mode === 'profile'
            ? copy.settings.makeThisSpaceYours
            : copy.ui.security
        }
        icon={mode === 'profile' ? 'profile' : 'shield'}
      >
        <p>
          {mode === 'profile' ? copy.ui.profileIntro : copy.ui.securityIntro}
        </p>
      </PageIntro>
      {error ? <Notice message={error} /> : null}
      {saved ? (
        <p role="status" className="success-notice">
          <Icon name="check" />
          {copy.settings.settingsSaved}
        </p>
      ) : null}
      {mode === 'profile' ? (
        <form className="card form" onSubmit={update}>
          <label>
            {copy.settings.displayName}
            <input
              name="display_name"
              defaultValue={profile.display_name}
              required
              maxLength={64}
              autoComplete="off"
            />
          </label>
          <label>
            {copy.settings.publicPrompt}
            <textarea
              name="public_prompt"
              defaultValue={profile.public_prompt}
              maxLength={280}
              rows={3}
              autoComplete="off"
              aria-describedby="profile-public-hint"
            />
          </label>
          <p className="helpful-note">
            <Icon name="message" />
            <span>{story.share.tip}</span>
          </p>
          <p className="hint" id="profile-public-hint">
            {copy.ui.promptHint}
          </p>
          <div className="form-grid">
            <label>
              {copy.settings.keepNewMessagesFor}
              <select
                name="retention_days"
                defaultValue={profile.retention_days}
              >
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
          <div className="form-actions">
            <button disabled={busy}>
              {busy ? copy.settings.saving : copy.settings.saveSettings}
            </button>
          </div>
        </form>
      ) : (
        <div className="security-sections">
          <section className="security-section">
            <span className="icon-tile">
              <Icon name="key" />
            </span>
            <h2>{copy.ui.recoveryHeading}</h2>
            <RecoveryFlow />
            <p>{copy.ui.recoveryBody}</p>
            <a href="/restore" className="text-link">
              {copy.dashboard.restoreAProfile}
              <Icon name="arrow" />
            </a>
          </section>
          <section className="security-section">
            <span className="icon-tile">
              <Icon name="device" />
            </span>
            <h2>{copy.ui.deviceHeading}</h2>
            <p>{copy.ui.deviceBody}</p>
            <details className="advanced-details">
              <summary>{copy.ui.advancedKey}</summary>
              <p>{copy.settings.nonExtractableKeyStoredInIndexeddbAnyone}</p>
              <p className="fingerprint" translate="no">
                {copy.settings.keyFingerprint} {owner.keyId}
              </p>
            </details>
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
          </section>
          <div className="security-section">
            <BackupExport owner={owner} />
          </div>
          <section className="security-section danger-zone">
            <h2>{copy.settings.deleteYourProfile}</h2>
            <p>{copy.settings.thisRemovesTheProfileMessagesAndEncrypted}</p>
            <label>
              {copy.settings.typeYourLinkNameToDelete}
              <input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                aria-describedby="delete-slug-hint"
              />
            </label>
            <p id="delete-slug-hint" className="hint" translate="no">
              /{profile.slug}
            </p>
            <button
              className="danger"
              disabled={busy || confirmation !== profile.slug}
              onClick={() => {
                void remove();
              }}
            >
              {copy.settings.permanentlyDeleteProfile}
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
