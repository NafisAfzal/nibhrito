import { useEffect, useState } from 'react';
import { loadOwners, type LocalOwner } from '../../storage/indexedDb';
import { api } from '../../lib/api';
import type { PublicProfile } from '../../../shared/schemas/profile';
import { Notice } from '../../components/Layout';
import { ShareQr } from '../../components/ShareQr';
export function Dashboard() {
  const [state, setState] = useState<{
      owner: LocalOwner;
      profile: PublicProfile;
    } | null>(null),
    [error, setError] = useState(''),
    [loaded, setLoaded] = useState(false),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const owners = await loadOwners();
        const owner = owners[0];
        if (owner) {
          const profile = await api<PublicProfile>('/api/v1/owner', {
            token: owner.ownerToken,
          });
          if (active) setState({ owner, profile });
        }
      } catch {
        if (active)
          setError(
            'Could not open this profile. Try restoring with your recovery code.',
          );
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  if (!loaded) return <p role="status">Opening your private space…</p>;
  if (error) return <Notice message={error} />;
  if (!state)
    return (
      <div className="narrow card">
        <h1>Your inbox lives here</h1>
        <p>
          Create a profile to receive private feedback, or restore one with your
          saved code.
        </p>
        <a className="button" href="/create">
          Create a profile
        </a>
        <a className="button secondary" href="/restore">
          Restore a profile
        </a>
      </div>
    );
  const link = `${window.location.origin}/u/${state.profile.slug}#v=1&pk=${state.owner.publicKey}`;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your private space</p>
          <h1>{state.profile.display_name}</h1>
          <p className="muted">
            /{state.profile.slug} · {state.profile.retention_days}-day retention
          </p>
        </div>
      </div>
      <section className="card">
        <h2>Share your space</h2>
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
      </section>
      <section className="card">
        <h2>Profile ready</h2>
        <p>
          Your keys are saved on this browser. Keep your recovery code safe.
        </p>
      </section>
    </>
  );
}
