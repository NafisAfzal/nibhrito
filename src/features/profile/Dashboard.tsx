import { useEffect, useState } from 'react';
import { loadOwners, type LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { Notice } from '../../components/Layout';
import { ShareQr } from '../../components/ShareQr';
import { Inbox } from '../inbox/Inbox';
import { Settings } from './Settings';
export function Dashboard() {
  const [owners, setOwners] = useState<LocalOwner[]>([]),
    [selected, setSelected] = useState(''),
    [state, setState] = useState<{
      owner: LocalOwner;
      profile: PublicProfile;
    } | null>(null),
    [error, setError] = useState(''),
    [loaded, setLoaded] = useState(false),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    void loadOwners()
      .then((values) => {
        if (active) {
          setOwners(values);
          setSelected(values[0]?.profileSlug ?? '');
          if (!values.length) setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setError('Private browser storage is unavailable.');
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    // Discard the previous profile's decrypted child tree before fetching another.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(null);
    setError('');
    setCopied(false);
    setLoaded(false);
    const local = owners.find((o) => o.profileSlug === selected);
    if (local)
      void api<PublicProfile>('/api/v1/owner', { token: local.ownerToken })
        .then((profile) => {
          if (
            profile.id !== local.id ||
            profile.slug !== local.profileSlug ||
            profile.current_key_id !== local.keyId
          )
            throw new Error();
          if (active) setState({ owner: local, profile });
        })
        .catch(() => {
          if (active)
            setError(
              'Could not open this profile. It may have been deleted. Try restoring with your saved recovery code.',
            );
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
    return () => {
      active = false;
    };
  }, [selected, owners]);
  const picker =
    owners.length > 1 ? (
      <label className="profile-picker">
        Your profiles
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {owners.map((owner) => (
            <option key={owner.profileSlug} value={owner.profileSlug}>
              {owner.profileSlug}
            </option>
          ))}
        </select>
      </label>
    ) : null;
  if (!loaded)
    return (
      <>
        {picker}
        <p role="status">Opening your private space…</p>
      </>
    );
  if (!state)
    return (
      <>
        {picker}
        {error ? <Notice message={error} /> : null}
        <div className="narrow card">
          <h1>Your inbox lives here</h1>
          <p>
            Create a profile to receive private feedback, or restore one with
            your saved code.
          </p>
          <a className="button" href="/create">
            Create a profile
          </a>
          <a className="button secondary" href="/restore">
            Restore a profile
          </a>
        </div>
      </>
    );
  const link = `${window.location.origin}/u/${state.profile.slug}#v=1&pk=${state.owner.publicKey}`;
  return (
    <div className={`accent-${state.profile.theme}`}>
      {picker}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your private space</p>
          <h1>{state.profile.display_name}</h1>
          <p className="muted">
            /{state.profile.slug} · {state.profile.retention_days}-day retention
            {state.profile.is_disabled ? ' · Incoming messages paused' : ''}
          </p>
        </div>
        <button
          className="secondary"
          onClick={() => window.location.replace('/')}
        >
          Lock this screen
        </button>
      </div>
      {error ? <Notice message={error} /> : null}
      <details className="card share" open>
        <summary>Share your space</summary>
        <ShareQr link={link} />
        <p>
          Your full link carries your encryption public key. Share the whole
          link.
        </p>
        <label htmlFor="share-link">Verified share link</label>
        <input id="share-link" readOnly value={link} />
        <button
          onClick={() => {
            void navigator.clipboard
              .writeText(link)
              .then(() => setCopied(true))
              .catch(() =>
                setError('Copy unavailable. Select and copy the full link.'),
              );
          }}
        >
          {copied ? 'Link copied' : 'Copy full link'}
        </button>
      </details>
      <Inbox key={state.profile.id} owner={state.owner} />
      <Settings
        key={state.profile.id}
        owner={state.owner}
        profile={state.profile}
        onUpdate={(profile) => setState({ owner: state.owner, profile })}
      />
      <p className="hint">
        Locking clears the screen, but this browser retains access. To remove
        access, use “Forget this profile on this device” in settings.
      </p>
    </div>
  );
}
