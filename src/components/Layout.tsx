import { copy } from '../app/copy';
import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { story } from '../app/story';
export function Layout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const path = window.location.pathname;
  const sender = path.startsWith('/u/');
  const links = [
    ['/about', story.whyLink],
    ['/security', copy.ui.publicPrivacy],
    ['/inbox', copy.layout.myInbox],
    ['/restore', copy.layout.restore],
  ] as const;
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {copy.layout.skipToContent}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            href="/"
            className="brand"
            translate="no"
            aria-label="Nibhrito · নিভৃত"
          >
            <span className="brand-mark">
              <Icon name="quiet" />
            </span>
            <span>
              Nibhrito
              <span className="brand-bangla" lang="bn">
                নিভৃত
              </span>
            </span>
          </a>
          {sender ? (
            <a className="header-privacy text-link" href="/security">
              <Icon name="lock" />
              {copy.ui.publicPrivacy}
            </a>
          ) : (
            <>
              <button
                className="secondary mobile-menu"
                type="button"
                aria-expanded={menu}
                aria-controls="public-navigation"
                onClick={() => setMenu(!menu)}
              >
                {menu ? copy.ui.closeMenu : copy.ui.menu}
              </button>
              <nav
                id="public-navigation"
                className={menu ? 'public-nav is-open' : 'public-nav'}
                aria-label={copy.layout.mainNavigation}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setMenu(false);
                    document
                      .querySelector<HTMLButtonElement>('.mobile-menu')
                      ?.focus();
                  }
                }}
              >
                {links.map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    aria-current={path === href ? 'page' : undefined}
                  >
                    {label}
                  </a>
                ))}
                {path === '/' ? (
                  <a href="/create" className="button header-cta">
                    {copy.landing.create}
                    <Icon name="arrow" />
                  </a>
                ) : null}
              </nav>
            </>
          )}
        </div>
      </header>
      <main id="main" className="shell" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
          <span translate="no">
            Nibhrito <span lang="bn">নিভৃত</span>
          </span>
          <p>
            {copy.layout.quietByDesign}{' '}
            <span lang="bn">{copy.layout.text2}</span>
          </p>
        </div>
        <nav aria-label={copy.layout.legal}>
          {[
            ['/about', story.whyLink],
            ['/privacy', copy.layout.privacy],
            ['/terms', copy.layout.terms],
            ['/security', copy.layout.security],
            ['/acceptable-use', copy.layout.acceptableUse],
            ['/contact', copy.layout.contact],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              aria-current={path === href ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </>
  );
}
export function Notice({ message, id }: { message: string; id?: string }) {
  return (
    <p role="alert" className="notice" id={id}>
      <Icon name="error" />
      <span>{message}</span>
    </p>
  );
}
