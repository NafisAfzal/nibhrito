import { copy } from '../../app/copy';
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
import { PageIntro } from '../../components/PageIntro';
import { Icon } from '../../components/Icon';
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
      setError(copy.setup.checkYourProfileDetailsLinkNamesUse);
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
      window.location.assign('/inbox?view=share&space=' + profile.slug);
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
    <div className="narrow onboarding">
      <ol className="setup-progress" aria-label="Setup progress">
        <li aria-current={!prepared ? 'step' : undefined}>{copy.ui.stepOne}</li>
        <li aria-current={prepared ? 'step' : undefined}>{copy.ui.stepTwo}</li>
      </ol>
      <PageIntro
        eyebrow={copy.setup.yourPrivateSpace}
        title={
          prepared
            ? copy.setup.saveYourRecoveryCode
            : copy.setup.createYourProfile
        }
      >
        <p>
          {prepared
            ? copy.ui.recoveryIntro
            : copy.setup.noEmailNoPasswordYourBrowserHolds}
        </p>
      </PageIntro>
      {error ? <Notice message={error} /> : null}
      {prepared ? (
        <section className="card recovery-panel">
          <span className="icon-tile">
            <Icon name="shield" />
          </span>
          <h2>{copy.ui.recoveryStep}</h2>
          <p>{copy.setup.anyoneWithThisCodeCanOpenYour}</p>
          <label htmlFor="recovery-code">{copy.setup.recoveryCode}</label>
          <textarea
            id="recovery-code"
            className="recovery-code"
            aria-describedby="recovery-warning"
            autoComplete="off"
            translate="no"
            readOnly
            rows={3}
            value={prepared.code}
            spellCheck={false}
          />
          <p className="warning-notice" id="recovery-warning">
            {copy.setup.nibhritoCannotRecoverThisCodeForYou}
          </p>
          <form onSubmit={create}>
            <label className="check">
              <input type="checkbox" required />
              {copy.setup.iSavedMyRecoveryCodeSomewhereSafe}
            </label>
            <button disabled={busy}>
              {busy
                ? copy.setup.creatingProfile
                : copy.setup.createMyPrivateProfile}
            </button>
          </form>
          <button
            type="button"
            className="secondary"
            onClick={() => setPrepared(null)}
            disabled={busy}
          >
            {copy.setup.back}
          </button>
        </section>
      ) : (
        <form className="card form" onSubmit={prepare}>
          <label>
            {copy.setup.displayName}
            <input
              name="display_name"
              required
              maxLength={64}
              autoComplete="off"
              placeholder={copy.setup.howShouldPeopleKnowYou}
            />
          </label>
          <label>
            {copy.setup.linkName}
            <input
              name="slug"
              aria-describedby="slug-hint"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              placeholder={copy.setup.yourName}
            />
          </label>
          <p className="hint" id="slug-hint">
            {copy.ui.slugHint}
          </p>
          <label>
            {copy.setup.publicPrompt}
            <textarea
              name="public_prompt"
              aria-describedby="setup-public-hint"
              autoComplete="off"
              maxLength={280}
              rows={3}
              defaultValue={copy.setup.whatShouldIKeepDoingWhatCould}
            />
          </label>
          <details className="preferences">
            <summary>{copy.ui.setupOptions}</summary>
            <div className="form-grid">
              <label>
                {copy.setup.keepMessagesFor}
                <select name="retention_days" defaultValue="30">
                  <option value="1">{copy.setup.text1Day}</option>
                  <option value="7">{copy.setup.text7Days}</option>
                  <option value="30">{copy.setup.text30Days}</option>
                  <option value="90">{copy.setup.text90Days}</option>
                </select>
              </label>
              <label>
                {copy.setup.profileAccent}
                <select name="theme" defaultValue="sage">
                  <option value="sage">{copy.setup.sage}</option>
                  <option value="rose">{copy.setup.rose}</option>
                  <option value="ocean">{copy.setup.ocean}</option>
                </select>
              </label>
            </div>
          </details>
          <p className="hint" id="setup-public-hint">
            {copy.ui.promptHint} {copy.setup.displayNameAndPromptArePublicKeep}
          </p>
          <button disabled={busy}>
            {busy ? copy.setup.preparingKeys : copy.setup.prepareMyRecoveryCode}
          </button>
        </form>
      )}
    </div>
  );
}
