import { Layout } from '../components/Layout';
import { Setup } from '../features/profile/Setup';
import { Restore } from '../features/recovery/Restore';
import { Dashboard } from '../features/profile/Dashboard';
import { Send } from '../features/send/Send';
export function App() {
  const path = window.location.pathname;
  return (
    <Layout>
      {path.startsWith('/u/') ? (
        <Send />
      ) : path === '/create' ? (
        <Setup />
      ) : path === '/restore' ? (
        <Restore />
      ) : path === '/inbox' ? (
        <Dashboard />
      ) : path === '/' ? (
        <div className="hero">
          <p className="eyebrow">A quieter space for feedback</p>
          <h1>
            Private words.
            <br />
            Thoughtful conversations.
          </h1>
          <p className="lede">
            A personal space for honest feedback. Built around browser
            encryption, with no email or password.
          </p>
          <div className="actions">
            <a className="button" href="/create">
              Create your space <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="/restore">
              Already have a recovery code?
            </a>
          </div>
          <div className="feature-grid">
            <section>
              <span className="feature-number">01</span>
              <h2>Your browser, your keys</h2>
              <p>Your private encryption key stays on your device.</p>
            </section>
            <section>
              <span className="feature-number">02</span>
              <h2>A link with a purpose</h2>
              <p>Share a full link carrying your encryption public key.</p>
            </section>
            <section>
              <span className="feature-number">03</span>
              <h2>Recovery you control</h2>
              <p>A saved code restores your inbox on another browser.</p>
            </section>
          </div>
        </div>
      ) : (
        <div className="narrow card">
          <p className="eyebrow">404</p>
          <h1>This space isn’t here</h1>
          <p>Check the link, or head back to Nibhrito.</p>
          <a className="button" href="/">
            Back home
          </a>
        </div>
      )}
    </Layout>
  );
}
