import { copy } from '../../app/copy';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { parseShareLink } from '../../crypto/shareLink';
import { canonicalMessage, encryptMessage } from '../../crypto/protocol';
import { utf8 } from '../../../shared/protocol/encoding';
import type { MessageEnvelope } from '../../../shared/protocol/envelope';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { api, ApiError } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { PageIntro, LoadingState } from '../../components/PageIntro';
import { Icon } from '../../components/Icon';
import { story } from '../../app/story';
import { ProductFlow } from '../../components/ProductStory';
export function Send() {
  const [state, setState] = useState<{
      link: Awaited<ReturnType<typeof parseShareLink>>;
      profile: PublicProfile;
    } | null>(null),
    [error, setError] = useState(''),
    [loaded, setLoaded] = useState(false),
    [body, setBody] = useState(''),
    [mood, setMood] = useState(''),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false);
  const pending = useRef<MessageEnvelope | null>(null);
  useEffect(() => {
    let active = true;
    // A changed fragment is a new trust decision. Reload clears the composer
    // and reruns verification rather than retaining a previously verified key.
    const changed = () => window.location.reload();
    const clear = () => {
      active = false;
      pending.current = null;
      setBody('');
      setMood('');
    };
    const resumed = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('hashchange', changed);
    window.addEventListener('pagehide', clear);
    window.addEventListener('pageshow', resumed);
    void (async () => {
      try {
        const link = await parseShareLink(new URL(window.location.href)),
          profile = await api<PublicProfile>(
            `/api/v1/profiles/${link.profileSlug}`,
          );
        if (
          profile.current_key_id !== link.keyId ||
          profile.slug !== link.profileSlug ||
          profile.is_disabled
        )
          throw new Error();
        if (active) setState({ link, profile });
      } catch {
        if (active) setError(copy.send.thisLinkIsIncompleteCannotBeVerified);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
      window.removeEventListener('hashchange', changed);
      window.removeEventListener('pagehide', clear);
      window.removeEventListener('pageshow', resumed);
    };
  }, []);
  const plain = {
    type: 'message',
    text: body,
    ...(mood ? { mood } : {}),
    client_created_at: new Date().toISOString(),
  };
  const bytes = utf8.encode(JSON.stringify(plain)).length;
  let valid = true;
  try {
    canonicalMessage(plain);
  } catch {
    valid = false;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state || !valid || busy) return;
    setBusy(true);
    setError('');
    try {
      const envelope =
        pending.current ??
        (await encryptMessage(
          state.link.publicKey,
          state.link.profileSlug,
          plain,
        ));
      pending.current = envelope;
      await api(`/api/v1/profiles/${state.link.profileSlug}/messages`, {
        method: 'POST',
        body: envelope,
      });
      pending.current = null;
      setBody('');
      setMood('');
      setSent(true);
    } catch (error) {
      setError(
        error instanceof ApiError && error.code === 'RATE_LIMITED'
          ? copy.ui.sendRateLimited
          : copy.send.deliveryCouldNotBeConfirmedRetrySends,
      );
    } finally {
      setBusy(false);
    }
  }
  if (!loaded)
    return <LoadingState>{copy.send.verifyingTheFullShareLink}</LoadingState>;
  if (!state)
    return (
      <div className="narrow state-page">
        <PageIntro
          eyebrow={copy.ui.myLink}
          title={copy.send.checkThisLink}
          icon="link"
        />
        <Notice message={error} />
        <a className="text-link" href="/security">
          {copy.send.howVerifiedLinksWork}
        </a>
      </div>
    );
  if (sent)
    return (
      <div className="narrow sender-success" role="status">
        <span className="icon-tile symbol-check">
          <Icon name="check" />
        </span>
        <p className="eyebrow">{copy.send.deliveredAsCiphertext}</p>
        <h1>{copy.send.yourWordsAreOnTheirWay}</h1>
        <ProductFlow
          label={story.delivery.label}
          steps={story.delivery.steps}
          compact
          privacy
        />
        <p className="delivery-thanks">
          <Icon name="message" />
          {story.compose.sent}
        </p>
        <button onClick={() => setSent(false)} className="secondary">
          {copy.send.sendAnotherMessage}
        </button>
        <p className="hint">
          {copy.send.anonymousToTheRecipientHostingProvidersStill}
        </p>
      </div>
    );
  return (
    <div className={`narrow accent-${state.profile.theme}`}>
      <header className="sender-intro">
        <div className="profile-avatar" aria-hidden="true">
          {Array.from(state.profile.display_name)[0]}
        </div>
        <p className="eyebrow">{copy.send.aPrivateNoteFor}</p>
        <h1 className="user-text">{state.profile.display_name}</h1>
        <p className="lede user-text">{state.profile.public_prompt}</p>
        <p className="hint">{copy.ui.privateCompose}</p>
      </header>
      {error ? <Notice message={error} id="send-error" /> : null}
      <form className="card form composer" onSubmit={submit}>
        <p className="compose-guidance">
          <Icon name="message" />
          <span>{story.compose.guidance}</span>
        </p>
        <div className="field">
          <label htmlFor="message-text">{copy.send.yourMessage}</label>
          <textarea
            id="message-text"
            rows={7}
            maxLength={4096}
            name="message"
            aria-describedby={
              'message-size message-size-help' + (error ? ' send-error' : '')
            }
            aria-invalid={bytes > 4096}
            autoComplete="off"
            spellCheck={false}
            required
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              pending.current = null;
            }}
            placeholder={copy.ui.messagePlaceholder}
            disabled={busy}
          />
        </div>
        <p
          id="message-size"
          className={
            bytes > 4096 ? 'composer-counter invalid' : 'composer-counter'
          }
        >
          <span>
            {bytes.toLocaleString()}{' '}
            {copy.send.text4096EncryptedPayloadBytesBanglaAndEmoji}
          </span>
        </p>
        <p
          id="message-size-help"
          className="hint sender-limit"
          role={bytes > 4096 ? 'alert' : undefined}
        >
          {bytes > 4096 ? copy.ui.sizeLimit : copy.ui.sizeHelp}
        </p>
        <label>
          {copy.send.typeOfFeedbackOptional}
          <select
            name="mood"
            value={mood}
            disabled={busy}
            onChange={(e) => {
              setMood(e.target.value);
              pending.current = null;
            }}
          >
            <option value="">{copy.send.justANote}</option>
            <option value="appreciation">{copy.send.appreciation}</option>
            <option value="constructive">
              {copy.send.constructiveFeedback}
            </option>
            <option value="question">{copy.send.aQuestion}</option>
          </select>
        </label>
        <p className="privacy-label">
          <Icon name="lock" />
          {copy.send.encryptedInYourBrowserBeforeSending}
        </p>
        <button disabled={!valid || busy}>
          {busy ? copy.send.encryptingAndSending : copy.send.sendPrivateMessage}
        </button>
        <p className="hint">
          {copy.send.expiresAfter} {state.profile.retention_days}{' '}
          {state.profile.retention_days === 1 ? 'day' : 'days'}
          {copy.send.pleaseBeRespectful}{' '}
          <a href="/acceptable-use">{copy.send.acceptableUse}</a>
        </p>
      </form>
      <p className="sender-footer">
        {copy.send.yourIdentityIsNotShownToThe}{' '}
        <a className="text-link" href="/security">
          {copy.send.understandTheLimits}
        </a>
      </p>
    </div>
  );
}
