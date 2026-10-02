import type { ReactNode } from 'react';
export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="/" className="brand">
          Nibhrito <span lang="bn">নিভৃত</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/inbox">My inbox</a>
          <a href="/restore">Restore</a>
        </nav>
      </header>
      <main id="main" className="shell">
        {children}
      </main>
      <footer className="site-footer">
        <p>
          Quiet by design. <span lang="bn">কথা থাকুক ব্যক্তিগত।</span>
        </p>
        <nav aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/security">Security</a>
          <a href="/acceptable-use">Acceptable use</a>
          <a href="/contact">Contact</a>
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
