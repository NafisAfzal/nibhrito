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
    window.addEventListener('hashchange', changed);
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
        if (active)
          setError(
            'This link is incomplete, cannot be verified, or is no longer accepting messages. Ask the profile owner for the full Nibhrito link.',
          );
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
      window.removeEventListener('hashchange', changed);
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
      setError(
        'Delivery could not be confirmed. Retry sends the same encrypted message safely. If you edit it, a new message will be sent.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (!loaded) return <p role="status">Verifying the full share link…</p>;
  if (!state)
    return (
      <div className="narrow">
        <h1>Check this link</h1>
        <Notice message={error} />
        <a className="text-link" href="/security">
          How verified links work
        </a>
      </div>
    );
  if (sent)
    return (
      <div className="narrow card">
        <p className="eyebrow">Delivered as ciphertext</p>
        <h1>Your words are on their way.</h1>
        <p>Only the recipient’s browser holds the key to read this message.</p>
        <button onClick={() => setSent(false)} className="secondary">
          Send another message
        </button>
        <p className="hint">
          Anonymous to the recipient. Hosting providers still process network
          metadata.
        </p>
      </div>
    );
  return (
    <div className={`narrow accent-${state.profile.theme}`}>
      <p className="eyebrow">A private note for</p>
      <h1>{state.profile.display_name}</h1>
      <p className="lede user-text">{state.profile.public_prompt}</p>
      {error ? <Notice message={error} /> : null}
      <form className="card form" onSubmit={submit}>
        <label>
          Your message
          <textarea
            rows={7}
            required
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              pending.current = null;
            }}
            placeholder="একটি ভালো দিক, একটি উন্নতির জায়গা…"
            disabled={busy}
          />
        </label>
        <p className={bytes > 4096 ? 'notice' : 'hint'} aria-live="polite">
          {bytes} / 4096 encrypted-payload bytes · Bangla and emoji welcome
        </p>
        <label>
          Type of feedback (optional)
          <select
            value={mood}
            disabled={busy}
            onChange={(e) => {
              setMood(e.target.value);
              pending.current = null;
            }}
          >
            <option value="">Just a note</option>
            <option value="appreciation">Appreciation</option>
            <option value="constructive">Constructive feedback</option>
            <option value="question">A question</option>
          </select>
        </label>
        <p className="privacy-label">
          Encrypted in your browser before sending.
        </p>
        <button disabled={!valid || busy}>
          {busy ? 'Encrypting and sending…' : 'Send private message'}
        </button>
        <p className="hint">
          Expires after {state.profile.retention_days}{' '}
          {state.profile.retention_days === 1 ? 'day' : 'days'}. Please be
          respectful. <a href="/acceptable-use">Acceptable use</a>
        </p>
      </form>
      <p className="muted">
        Your identity is not shown to the recipient. Your device, your writing,
        and network metadata can still reveal information.{' '}
        <a className="text-link" href="/security">
          Understand the limits
        </a>
      </p>
    </div>
  );
}
