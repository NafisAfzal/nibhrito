import { copy } from '../app/copy';
import type { ReactNode } from 'react';
export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        className="skip"
        href="#main"
        tabIndex={0}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {copy.layout.skipToContent}
      </a>
      <header className="site-header">
        <a href="/" className="brand" translate="no">
          {copy.layout.nibhrito}
          <span lang="bn">{copy.layout.text}</span>
        </a>
        <nav aria-label={copy.layout.mainNavigation}>
          <a href="/inbox">{copy.layout.myInbox}</a>
          <a href="/restore">{copy.layout.restore}</a>
        </nav>
      </header>
      <main id="main" className="shell" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <p>
          {copy.layout.quietByDesign} <span lang="bn">{copy.layout.text2}</span>
        </p>
        <nav aria-label={copy.layout.legal}>
          <a href="/privacy">{copy.layout.privacy}</a>
          <a href="/terms">{copy.layout.terms}</a>
          <a href="/security">{copy.layout.security}</a>
          <a href="/acceptable-use">{copy.layout.acceptableUse}</a>
          <a href="/contact">{copy.layout.contact}</a>
        </nav>
      </footer>
    </>
  );
}
export function Notice({ message }: { message: string }) {
  return (
    <p role="alert" className="notice">
      {message}
    </p>
  );
}
