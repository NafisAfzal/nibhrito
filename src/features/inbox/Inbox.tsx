import { copy } from '../../app/copy';
import { useEffect, useRef, useState } from 'react';
import type { InboxPage, StoredMessage } from '../../../shared/schemas/inbox';
import { decryptMessage, type PlainMessage } from '../../crypto/protocol';
import type { LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { Icon } from '../../components/Icon';
import { LoadingState } from '../../components/PageIntro';
import { story } from '../../app/story';
import { ProductFlow } from '../../components/ProductStory';
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
  const request = useRef<AbortController | null>(null);
  async function load(next: string | null = null) {
    if (busy) return;
    setBusy(true);
    setError('');
    request.current = new AbortController();
    try {
      const page = await api<InboxPage>(
        `/api/v1/inbox?limit=25${next ? `&cursor=${encodeURIComponent(next)}` : ''}`,
        { token: owner.ownerToken, signal: request.current.signal },
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
        setClock(Date.now());
      }
    } catch {
      if (active.current) setError(copy.inbox.yourInboxCouldNotBeLoadedPlease);
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
    }, 1000);
    const clear = () => {
      active.current = false;
      request.current?.abort();
      setNotes([]);
      setSearch('');
    };
    const resumed = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pagehide', clear);
    window.addEventListener('pageshow', resumed);
    return () => {
      active.current = false;
      request.current?.abort();
      clearInterval(timer);
      window.removeEventListener('pagehide', clear);
      window.removeEventListener('pageshow', resumed);
    };
    // This component is keyed by profile ID; changing profiles discards all state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function remove(id: string) {
    if (busy || !window.confirm(copy.inbox.deleteThisMessageThisCannotBeUndone))
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
      setError(copy.inbox.messageCouldNotBeDeletedPleaseTry);
    } finally {
      setBusy(false);
    }
  }
  const current = notes.filter((note) => note.expires_at > clock);
  const visible = current.filter(
    (n) =>
      n.expires_at > clock &&
      (!mood || n.plain?.mood === mood) &&
      (!search ||
        n.plain?.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())),
  );
  return (
    <section aria-label={copy.inbox.yourInbox}>
      <div className="page-heading">
        <p className="hint">
          {current.length
            ? current.length +
              ' ' +
              (current.length === 1 ? 'message' : 'messages') +
              ' on this page'
            : copy.ui.emptyIcon}
        </p>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void load();
          }}
        >
          <Icon name="refresh" />
          {copy.inbox.refreshInbox}
        </button>
      </div>
      {current.length || search || mood || cursor ? (
        <div className="inbox-toolbar">
          <div className="form-grid">
            <label>
              {copy.inbox.searchLoadedMessages}
              <input
                type="search"
                name="search"
                aria-describedby="inbox-search-hint"
                value={search}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              {copy.inbox.filterFeedback}
              <select
                name="filter"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option value="">{copy.inbox.allFeedback}</option>
                <option value="appreciation">{copy.inbox.appreciation}</option>
                <option value="constructive">
                  {copy.inbox.constructiveFeedback}
                </option>
                <option value="question">{copy.inbox.questions}</option>
              </select>
            </label>
          </div>
          <p className="hint" id="inbox-search-hint">
            {copy.inbox.searchRunsOnlyOnLoadedMessagesIn}
          </p>
        </div>
      ) : null}
      {error ? <Notice message={error} /> : null}
      {!loaded && busy ? (
        <LoadingState>
          {copy.inbox.fetchingCiphertextAndDecryptingLocally}
        </LoadingState>
      ) : null}
      {loaded && !visible.length ? (
        <div className="empty">
          <span className="icon-tile">
            <Icon name="inbox" />
          </span>
          <h2>
            {current.length
              ? copy.inbox.noMatchingNotes
              : copy.inbox.aLittleQuietForNow}
          </h2>
          <p>
            {current.length
              ? copy.inbox.tryADifferentSearchOrLoadMore
              : copy.inbox.shareYourFullLinkToInviteThoughtful}
          </p>
          {!current.length ? (
            <>
              <ProductFlow
                label={story.empty.label}
                steps={story.empty.steps}
                compact
              />
              <a
                className="button"
                href={'/inbox?view=share&space=' + owner.profileSlug}
              >
                {copy.ui.emptyShare}
                <Icon name="arrow" />
              </a>
            </>
          ) : null}
        </div>
      ) : null}
      <div className="note-list">
        {visible.map((note) => (
          <article className="card note" key={note.envelope.message_id}>
            <div className="note-meta">
              <span>
                <Icon
                  name={
                    note.plain?.mood === 'appreciation'
                      ? 'heart'
                      : note.plain?.mood === 'constructive'
                        ? 'idea'
                        : 'message'
                  }
                />{' '}
                {note.plain?.mood === 'appreciation'
                  ? copy.inbox.appreciation
                  : note.plain?.mood === 'constructive'
                    ? copy.inbox.constructiveFeedback
                    : note.plain?.mood === 'question'
                      ? copy.inbox.questions
                      : copy.ui.privateNote}
              </span>
              <time dateTime={new Date(note.created_at).toISOString()}>
                {new Date(note.created_at).toLocaleString()}
              </time>
            </div>
            {note.plain ? (
              <p className="message-text" dir="auto">
                {note.plain.text}
              </p>
            ) : (
              <Notice
                message={copy.inbox.thisMessageCouldNotBeAuthenticatedOr}
              />
            )}
            <p className="expiry-label">
              <Icon name="clock" />
              {copy.inbox.expires}{' '}
              <time dateTime={new Date(note.expires_at).toISOString()}>
                {new Date(note.expires_at).toLocaleDateString()}
              </time>
            </p>
            <div className="note-actions">
              <details>
                <summary>{copy.inbox.messageDetails}</summary>
                <p className="hint">
                  {copy.inbox.expires}{' '}
                  <time dateTime={new Date(note.expires_at).toISOString()}>
                    {new Date(note.expires_at).toLocaleString()}
                  </time>
                  {copy.inbox.serverTimeControlsExpiryTheSenderS}
                </p>
                {note.plain ? (
                  <p className="hint">
                    {copy.inbox.senderDeviceTime}{' '}
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
                <Icon name="trash" />
                {copy.inbox.deleteMessage}
              </button>
            </div>
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
          {busy ? copy.inbox.loading : copy.inbox.loadOlderMessages}
        </button>
      ) : null}
    </section>
  );
}
