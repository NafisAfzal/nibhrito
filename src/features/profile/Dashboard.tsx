import { copy } from '../../app/copy';
import { useEffect, useState } from 'react';
import { loadOwners, type LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { Notice } from '../../components/Layout';
import { Inbox } from '../inbox/Inbox';
import { Settings } from './Settings';
import { Share } from './Share';
import { Icon, type IconName } from '../../components/Icon';
import { LoadingState, PageIntro } from '../../components/PageIntro';
export function Dashboard() {
  const [owners, setOwners] = useState<LocalOwner[]>([]),
    [selected, setSelected] = useState(''),
    [state, setState] = useState<{
      owner: LocalOwner;
      profile: PublicProfile;
    } | null>(null),
    [error, setError] = useState(''),
    [loaded, setLoaded] = useState(false);
  const query = new URLSearchParams(window.location.search).get('view');
  const view =
    query === 'share' || query === 'profile' || query === 'security'
      ? query
      : 'inbox';
  useEffect(() => {
    let active = true;
    void loadOwners()
      .then((values) => {
        if (active) {
          setOwners(values);
          const requested = new URLSearchParams(window.location.search).get(
            'space',
          );
          setSelected(
            values.find((owner) => owner.profileSlug === requested)
              ?.profileSlug ??
              values[0]?.profileSlug ??
              '',
          );
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
    // Discard decrypted children before fetching another profile.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(null);
    setError('');
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
        <select
          value={selected}
          onChange={(e) =>
            window.location.assign(
              '/inbox?view=' + view + '&space=' + e.target.value,
            )
          }
        >
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
        <LoadingState>{copy.dashboard.openingYourPrivateSpace}</LoadingState>
      </>
    );
  if (!state)
    return (
      <div className="narrow state-page">
        {picker}
        {error ? <Notice message={error} /> : null}
        <PageIntro
          eyebrow={copy.dashboard.yourPrivateSpace}
          title={copy.dashboard.yourInboxLivesHere}
          icon="inbox"
        >
          <p>{copy.dashboard.createAProfileToReceivePrivateFeedback}</p>
        </PageIntro>
        <div className="actions">
          <a className="button" href="/create">
            {copy.landing.create}
            <Icon name="arrow" />
          </a>
          <a className="text-link" href="/restore">
            {copy.dashboard.restoreAProfile}
          </a>
        </div>
      </div>
    );
  const link =
    window.location.origin +
    '/u/' +
    state.profile.slug +
    '#v=1&pk=' +
    state.owner.publicKey;
  const destinations: { id: string; label: string; icon: IconName }[] = [
    { id: 'inbox', label: copy.ui.inbox, icon: 'inbox' },
    { id: 'share', label: copy.ui.myLink, icon: 'link' },
    { id: 'profile', label: copy.ui.profile, icon: 'profile' },
    { id: 'security', label: copy.ui.security, icon: 'shield' },
  ];
  return (
    <div className={'workspace accent-' + state.profile.theme}>
      {picker}
      <div className="workspace-identity">
        <div className="profile-avatar" aria-hidden="true">
          {Array.from(state.profile.display_name)[0]}
        </div>
        <div>
          <p className="workspace-name user-text">
            {state.profile.display_name}
          </p>
          <p className="hint" translate="no">
            /{state.profile.slug}
          </p>
        </div>
        <a className="text-link hide-inbox" href="/">
          <Icon name="exit" />
          {copy.dashboard.lockThisScreen}
        </a>
      </div>
      <nav className="space-nav" aria-label={copy.ui.spaceNavigation}>
        {destinations.map((d) => (
          <a
            key={d.id}
            href={'/inbox?view=' + d.id + '&space=' + state.profile.slug}
            aria-current={view === d.id ? 'page' : undefined}
          >
            <Icon name={d.icon} />
            {d.label}
          </a>
        ))}
      </nav>
      {state.profile.is_disabled ? (
        <p className="info-notice">
          {copy.settings.pauseIncomingMessages} ·{' '}
          <a href={'/inbox?view=profile&space=' + state.profile.slug}>
            {copy.ui.profile}
          </a>
        </p>
      ) : null}
      <div className="workspace-content">
        {view === 'share' ? (
          <Share
            key={'share:' + state.profile.id}
            link={link}
            slug={state.profile.slug}
          />
        ) : view === 'profile' || view === 'security' ? (
          <Settings
            key={'settings:' + view + ':' + state.profile.id}
            owner={state.owner}
            profile={state.profile}
            mode={view}
            onUpdate={(profile) => setState({ owner: state.owner, profile })}
          />
        ) : (
          <>
            <PageIntro
              eyebrow={copy.inbox.decryptedOnThisDevice}
              title={copy.inbox.yourInbox}
            >
              <p>
                {state.profile.retention_days}
                {copy.dashboard.dayRetention}.{' '}
                <a
                  className="text-link"
                  href={'/inbox?view=share&space=' + state.profile.slug}
                >
                  {copy.ui.emptyShare}
                </a>
              </p>
            </PageIntro>
            <Inbox key={'inbox:' + state.profile.id} owner={state.owner} />
          </>
        )}
      </div>
      <p className="device-footnote">
        <Icon name="lock" />
        {copy.dashboard.lockingClearsTheScreenButThisBrowser}
      </p>
    </div>
  );
}
