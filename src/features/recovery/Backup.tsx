import { copy } from '../../app/copy';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  BACKUP_BYTE_LIMIT,
  openBackup,
  parseBackup,
  validateBackup,
} from '../../crypto/backup';
import type { InboxPage, StoredMessage } from '../../../shared/schemas/inbox';
import type { RecoveryEnvelope } from '../../../shared/protocol/envelope';
import type { LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
import { PageIntro } from '../../components/PageIntro';
export function BackupExport({ owner }: { owner: LocalOwner }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(false);
  async function download() {
    setBusy(true);
    setError('');
    setDone(false);
    try {
      const recovery = await api<RecoveryEnvelope>(
          `/api/v1/recovery/${owner.profileSlug}`,
        ),
        messages: StoredMessage[] = [];
      let cursor: string | null = null;
      do {
        const page: InboxPage = await api(
          `/api/v1/inbox?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
          { token: owner.ownerToken },
        );
        messages.push(...page.messages);
        cursor = page.next_cursor;
        if (messages.length > 500) throw new Error();
      } while (cursor);
      const backup = validateBackup({
        format: 'nibhrito-encrypted-backup',
        version: 1,
        profile_slug: owner.profileSlug,
        recovery,
        messages,
      });
      const url = URL.createObjectURL(
          new Blob([JSON.stringify(backup)], { type: 'application/json' }),
        ),
        link = document.createElement('a');
      link.href = url;
      link.download = `nibhrito-${owner.profileSlug}-encrypted.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setDone(true);
    } catch {
      setError(copy.backup.encryptedBackupCouldNotBeDownloadedRefresh);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{copy.backup.encryptedBackup}</h2>
      <p className="hint">
        {copy.backup.downloadsEncryptedMessagesAndTheEncryptedRecovery}
      </p>
      <button
        className="secondary"
        disabled={busy}
        onClick={() => {
          void download();
        }}
      >
        {busy
          ? copy.backup.preparingEncryptedBackup
          : copy.backup.downloadEncryptedBackup}
      </button>
      {done ? (
        <p role="status">
          {copy.backup.backupDownloadedYourRecoveryCodeIsRequired}
        </p>
      ) : null}
      {error ? <Notice message={error} /> : null}
      <p>
        <a className="text-link" href="/backup">
          {copy.backup.openAnEncryptedBackupLocally}
        </a>
      </p>
    </section>
  );
}
export function BackupReader() {
  const active = useRef(true),
    formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<Awaited<
      ReturnType<typeof openBackup>
    > | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    active.current = true;
    const clear = () => {
      active.current = false;
      formRef.current?.reset();
      setState(null);
    };
    const resumed = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pagehide', clear);
    window.addEventListener('pageshow', resumed);
    return () => {
      active.current = false;
      window.removeEventListener('pagehide', clear);
      window.removeEventListener('pageshow', resumed);
    };
  }, []);
  async function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setState(null);
    const form = event.currentTarget;
    try {
      const data = new FormData(form),
        file = data.get('backup');
      if (
        !(file instanceof File) ||
        file.size > BACKUP_BYTE_LIMIT ||
        file.size === 0
      )
        throw new Error();
      const backup = parseBackup(await file.arrayBuffer()),
        restored = await openBackup(
          backup,
          String(data.get('code') ?? '').trim(),
        );
      if (active.current) setState(restored);
      form.reset();
    } catch {
      setError(copy.backup.couldNotOpenThisBackupCheckThe);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <PageIntro
        eyebrow={copy.backup.localEncryptedArchive}
        title={copy.backup.openYourBackup}
        icon="note"
      >
        <p>{copy.backup.yourFileAndCodeStayInThis}</p>
      </PageIntro>
      <p className="hint">{copy.backup.thisIsAnExistingCopyServerExpiry}</p>
      {error ? <Notice message={error} /> : null}
      <form ref={formRef} className="card form" onSubmit={open}>
        <label>
          {copy.backup.encryptedBackupFile}
          <input
            type="file"
            name="backup"
            aria-describedby="archive-file-hint"
            accept="application/json,.json"
            required
            disabled={busy}
          />
        </label>
        <p className="hint" id="archive-file-hint">
          {copy.ui.archiveHint}
        </p>
        <label>
          {copy.backup.recoveryCode}
          <textarea
            name="code"
            className="recovery-code"
            aria-describedby="archive-code-hint"
            rows={3}
            required
            autoComplete="off"
            spellCheck={false}
            maxLength={128}
            disabled={busy}
          />
        </label>
        <p className="hint" id="archive-code-hint">
          {copy.ui.recoveryHint}
        </p>
        <button disabled={busy}>
          {busy
            ? copy.backup.unlockingArchiveLocally
            : copy.backup.openBackupLocally}
        </button>
      </form>
      {state ? (
        <section aria-labelledby="archive-heading" className="archive-content">
          <h2 id="archive-heading">
            {copy.backup.archiveFor}
            {state.profile}
          </h2>
          {state.notes.length ? (
            state.notes.map((note) => (
              <article className="card" key={note.id}>
                <time dateTime={new Date(note.created_at).toISOString()}>
                  {new Date(note.created_at).toLocaleString()}
                </time>
                {note.plain ? (
                  <p className="message-text" dir="auto">
                    {note.plain.text}
                  </p>
                ) : (
                  <Notice
                    message={copy.backup.thisMessageCouldNotBeAuthenticatedOr}
                  />
                )}
              </article>
            ))
          ) : (
            <p>{copy.backup.noMessagesInThisBackup}</p>
          )}
          <button className="secondary" onClick={() => setState(null)}>
            {copy.backup.clearArchiveFromMemory}
          </button>
        </section>
      ) : null}
    </div>
  );
}
