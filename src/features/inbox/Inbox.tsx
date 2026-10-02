import { useEffect, useRef, useState } from 'react';
import type { InboxPage, StoredMessage } from '../../../shared/schemas/inbox';
import { decryptMessage, type PlainMessage } from '../../crypto/protocol';
import type { LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
interface Note extends StoredMessage {
  plain: PlainMessage | null;
}
export function Inbox({ owner }: { owner: LocalOwner }) {
  const [notes, setNotes] = useState<Note[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [mood, setMood] = useState(''),
    [clock, setClock] = useState(() => Date.now());
  const active = useRef(false);
  async function load(next: string | null = null) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const page = await api<InboxPage>(
        `/api/v1/inbox?limit=25${next ? `&cursor=${encodeURIComponent(next)}` : ''}`,
        { token: owner.ownerToken },
      );
      const decoded = await Promise.all(
        page.messages.map(async (item) => {
          let plain: PlainMessage | null = null;
          try {
            plain = await decryptMessage(
              item.envelope,
              owner.profileSlug,
              new Map([[owner.keyId, owner.privateKey]]),
            );
          } catch {
            /* No partial plaintext on authentication failure. */
          }
          return { ...item, plain };
        }),
      );
      if (active.current) {
        setNotes((previous) =>
          next
            ? [
                ...previous,
                ...decoded.filter(
                  (item) =>
                    !previous.some(
                      (p) => p.envelope.message_id === item.envelope.message_id,
                    ),
                ),
              ]
            : decoded,
        );
        setCursor(page.next_cursor);
        setLoaded(true);
      }
    } catch {
      if (active.current)
        setError('Your inbox could not be loaded. Please try again.');
    } finally {
      if (active.current) setBusy(false);
    }
  }
  useEffect(() => {
    active.current = true;
    // Start the external fetch with its explicit loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      setNotes((previous) => previous.filter((n) => n.expires_at > now));
    }, 30000);
    const clear = () => {
      setNotes([]);
      setSearch('');
    };
    window.addEventListener('pagehide', clear);
    return () => {
      active.current = false;
      clearInterval(timer);
      window.removeEventListener('pagehide', clear);
    };
    // This component is keyed by profile ID; changing profiles discards all state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function remove(id: string) {
    if (busy || !window.confirm('Delete this message? This cannot be undone.'))
      return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/v1/messages/${id}`, {
        method: 'DELETE',
        token: owner.ownerToken,
      });
      setNotes((previous) =>
        previous.filter((n) => n.envelope.message_id !== id),
      );
    } catch {
      setError('Message could not be deleted. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  const visible = notes.filter(
    (n) =>
      n.expires_at > clock &&
      (!mood || n.plain?.mood === mood) &&
      (!search ||
        n.plain?.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())),
  );
  return (
    <section aria-labelledby="inbox-heading">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Decrypted on this device</p>
          <h2 id="inbox-heading">Your inbox</h2>
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void load();
          }}
        >
          Refresh inbox
        </button>
      </div>
      <div className="form-grid">
        <label>
          Search loaded messages
          <input
            type="search"
            value={search}
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Filter feedback
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">All feedback</option>
            <option value="appreciation">Appreciation</option>
            <option value="constructive">Constructive feedback</option>
            <option value="question">Questions</option>
          </select>
        </label>
      </div>
      <p className="hint">
        Search runs only on loaded messages, in this browser. Nothing is sent to
        the server.
      </p>
      {error ? <Notice message={error} /> : null}
      {!loaded && busy ? (
        <p role="status">Fetching ciphertext and decrypting locally…</p>
      ) : null}
      {loaded && !visible.length ? (
        <div className="card empty">
          <h3>
            {notes.length ? 'No matching notes' : 'A little quiet, for now'}
          </h3>
          <p>
            {notes.length
              ? 'Try a different search or load more messages.'
              : 'Share your full link to invite thoughtful feedback. Expired messages disappear automatically.'}
          </p>
        </div>
      ) : null}
      <div className="note-list">
        {visible.map((note) => (
          <article className="card note" key={note.envelope.message_id}>
            <div className="note-meta">
              <span>{note.plain?.mood ?? 'Private note'}</span>
              <time dateTime={new Date(note.created_at).toISOString()}>
                {new Date(note.created_at).toLocaleString()}
              </time>
            </div>
            {note.plain ? (
              <p className="message-text" dir="auto">
                {note.plain.text}
              </p>
            ) : (
              <p role="alert">
                This message could not be authenticated or decrypted. No text
                was displayed.
              </p>
            )}
            <details>
              <summary>Message details</summary>
              <p className="hint">
                Expires{' '}
                <time dateTime={new Date(note.expires_at).toISOString()}>
                  {new Date(note.expires_at).toLocaleString()}
                </time>
                . Server time controls expiry; the sender’s device timestamp is
                informational.
              </p>
              {note.plain ? (
                <p className="hint">
                  Sender device time:{' '}
                  {new Date(note.plain.client_created_at).toLocaleString()}
                </p>
              ) : null}
            </details>
            <button
              className="secondary danger"
              disabled={busy}
              onClick={() => {
                void remove(note.envelope.message_id);
              }}
            >
              Delete message
            </button>
          </article>
        ))}
      </div>
      {cursor ? (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void load(cursor);
          }}
        >
          {busy ? 'Loading…' : 'Load older messages'}
        </button>
      ) : null}
    </section>
  );
}
