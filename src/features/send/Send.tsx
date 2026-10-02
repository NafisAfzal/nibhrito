import { copy } from '../../app/copy';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { parseShareLink } from '../../crypto/shareLink';
import { canonicalMessage, encryptMessage } from '../../crypto/protocol';
import { utf8 } from '../../../shared/protocol/encoding';
import type { MessageEnvelope } from '../../../shared/protocol/envelope';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
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
    } catch {
      setError(copy.send.deliveryCouldNotBeConfirmedRetrySends);
    } finally {
      setBusy(false);
    }
  }
  if (!loaded)
    return <p role="status">{copy.send.verifyingTheFullShareLink}</p>;
  if (!state)
    return (
      <div className="narrow">
        <h1>{copy.send.checkThisLink}</h1>
        <Notice message={error} />
        <a className="text-link" href="/security">
          {copy.send.howVerifiedLinksWork}
        </a>
      </div>
    );
  if (sent)
    return (
      <div className="narrow card">
        <p className="eyebrow">{copy.send.deliveredAsCiphertext}</p>
        <h1>{copy.send.yourWordsAreOnTheirWay}</h1>
        <p>{copy.send.onlyTheRecipientSBrowserHoldsThe}</p>
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
      <p className="eyebrow">{copy.send.aPrivateNoteFor}</p>
      <h1>{state.profile.display_name}</h1>
      <p className="lede user-text">{state.profile.public_prompt}</p>
      {error ? <Notice message={error} /> : null}
      <form className="card form" onSubmit={submit}>
        <label>
          {copy.send.yourMessage}
          <textarea
            rows={7}
            maxLength={4096}
            name="message"
            autoComplete="off"
            spellCheck={false}
            required
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              pending.current = null;
            }}
            placeholder={copy.send.text}
            disabled={busy}
          />
        </label>
        <p className={bytes > 4096 ? 'notice' : 'hint'} aria-live="polite">
          {bytes} {copy.send.text4096EncryptedPayloadBytesBanglaAndEmoji}
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
      <p className="muted">
        {copy.send.yourIdentityIsNotShownToThe}{' '}
        <a className="text-link" href="/security">
          {copy.send.understandTheLimits}
        </a>
      </p>
    </div>
  );
}
