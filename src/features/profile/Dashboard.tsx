import { copy } from '../../app/copy';
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
          setError(copy.dashboard.privateBrowserStorageIsUnavailable);
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
          if (active) setError(copy.dashboard.couldNotOpenThisProfileItMay);
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
        {copy.dashboard.yourProfiles}
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
        <p role="status">{copy.dashboard.openingYourPrivateSpace}</p>
      </>
    );
  if (!state)
    return (
      <>
        {picker}
        {error ? <Notice message={error} /> : null}
        <div className="narrow card">
          <h1>{copy.dashboard.yourInboxLivesHere}</h1>
          <p>{copy.dashboard.createAProfileToReceivePrivateFeedback}</p>
          <a className="button" href="/create">
            {copy.dashboard.createAProfile}
          </a>
          <a className="button secondary" href="/restore">
            {copy.dashboard.restoreAProfile}
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
          <p className="eyebrow">{copy.dashboard.yourPrivateSpace}</p>
          <h1>{state.profile.display_name}</h1>
          <p className="muted">
            {copy.dashboard.text}
            {state.profile.slug} {copy.dashboard.text2}{' '}
            {state.profile.retention_days}
            {copy.dashboard.dayRetention}
            {state.profile.is_disabled
              ? copy.dashboard.incomingMessagesPaused
              : ''}
          </p>
        </div>
        <a className="button secondary" href="/">
          {copy.dashboard.lockThisScreen}
        </a>
      </div>
      {error ? <Notice message={error} /> : null}
      <details className="card share" open>
        <summary>{copy.dashboard.shareYourSpace}</summary>
        <ShareQr link={link} />
        <p>{copy.dashboard.yourFullLinkCarriesYourEncryptionPublic}</p>
        <label htmlFor="share-link">{copy.dashboard.verifiedShareLink}</label>
        <input id="share-link" readOnly value={link} />
        <button
          onClick={() => {
            if (!navigator.clipboard) {
              setError(copy.dashboard.copyUnavailableSelectAndCopyTheFull);
              return;
            }
            void navigator.clipboard
              .writeText(link)
              .then(() => setCopied(true))
              .catch(() =>
                setError(copy.dashboard.copyUnavailableSelectAndCopyTheFull),
              );
          }}
        >
          {copied ? copy.dashboard.linkCopied : copy.dashboard.copyFullLink}
        </button>
      </details>
      <Inbox key={`inbox:${state.profile.id}`} owner={state.owner} />
      <Settings
        key={`settings:${state.profile.id}`}
        owner={state.owner}
        profile={state.profile}
        onUpdate={(profile) => setState({ owner: state.owner, profile })}
      />
      <p className="hint">
        {copy.dashboard.lockingClearsTheScreenButThisBrowser}
      </p>
    </div>
  );
}
