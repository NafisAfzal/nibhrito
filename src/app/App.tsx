import { copy } from './copy';
import { Layout } from '../components/Layout';
import { Setup } from '../features/profile/Setup';
import { Restore } from '../features/recovery/Restore';
import { Dashboard } from '../features/profile/Dashboard';
import { Send } from '../features/send/Send';
import { Legal } from '../features/legal/Legal';
import { policies } from './policies';
import { BackupReader } from '../features/recovery/Backup';
import { BrowserSupport } from '../components/BrowserSupport';
export function App() {
  const path = window.location.pathname;
  return (
    <Layout>
      {Object.hasOwn(policies, path) ? (
        <Legal path={path as keyof typeof policies} />
      ) : path === '/backup' ? (
        <BrowserSupport>
          <BackupReader />
        </BrowserSupport>
      ) : path.startsWith('/u/') ? (
        <BrowserSupport>
          <Send />
        </BrowserSupport>
      ) : path === '/create' ? (
        <BrowserSupport>
          <Setup />
        </BrowserSupport>
      ) : path === '/restore' ? (
        <BrowserSupport>
          <Restore />
        </BrowserSupport>
      ) : path === '/inbox' ? (
        <BrowserSupport>
          <Dashboard />
        </BrowserSupport>
      ) : path === '/' ? (
        <div className="hero">
          <p className="eyebrow">{copy.app.aQuieterSpaceForFeedback}</p>
          <h1>
            {copy.app.privateWords}
            <br />
            {copy.app.thoughtfulConversations}
          </h1>
          <p className="lede">
            {copy.app.aPersonalSpaceForHonestFeedbackBuilt}
          </p>
          <div className="actions">
            <a className="button" href="/create">
              {copy.app.createYourSpace}
              <span aria-hidden="true">{copy.app.text}</span>
            </a>
            <a className="text-link" href="/restore">
              {copy.app.alreadyHaveARecoveryCode}
            </a>
          </div>
          <div className="feature-grid">
            <section>
              <span className="feature-number">{copy.app.text01}</span>
              <h2>{copy.app.yourBrowserYourKeys}</h2>
              <p>{copy.app.yourPrivateEncryptionKeyStaysOnYour}</p>
            </section>
            <section>
              <span className="feature-number">{copy.app.text02}</span>
              <h2>{copy.app.aLinkWithAPurpose}</h2>
              <p>{copy.app.shareAFullLinkCarryingYourEncryption}</p>
            </section>
            <section>
              <span className="feature-number">{copy.app.text03}</span>
              <h2>{copy.app.recoveryYouControl}</h2>
              <p>{copy.app.aSavedCodeRestoresYourInboxOn}</p>
            </section>
          </div>
        </div>
      ) : (
        <div className="narrow card">
          <p className="eyebrow">{copy.app.text404}</p>
          <h1>{copy.app.thisSpaceIsnTHere}</h1>
          <p>{copy.app.checkTheLinkOrHeadBackTo}</p>
          <a className="button" href="/">
            {copy.app.backHome}
          </a>
        </div>
      )}
    </Layout>
  );
}
