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
import { Landing } from '../features/landing/Landing';
import { About } from '../features/landing/About';
import { PageIntro } from '../components/PageIntro';
export function App() {
  const path = window.location.pathname;
  return (
    <Layout>
      {Object.hasOwn(policies, path) ? (
        <Legal path={path as keyof typeof policies} />
      ) : path === '/about' ? (
        <About />
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
        <Landing />
      ) : (
        <div className="narrow state-page">
          <PageIntro
            eyebrow={copy.app.text404}
            title={copy.app.thisSpaceIsnTHere}
            icon="link"
          >
            <p>{copy.app.checkTheLinkOrHeadBackTo}</p>
          </PageIntro>
          <a className="button" href="/">
            {copy.app.backHome}
          </a>
        </div>
      )}
    </Layout>
  );
}
