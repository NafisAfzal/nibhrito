import { copy } from '../app/copy';
import { Component, type ReactNode } from 'react';
import { PageIntro } from './PageIntro';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    if (this.state.failed)
      return (
        <main className="shell narrow state-page">
          <PageIntro
            eyebrow={copy.ui.inbox}
            title={copy.errorboundary.thisScreenCouldNotBeOpened}
            icon="inbox"
          />
          <p>{copy.errorboundary.refreshToClearTemporaryPageStateYour}</p>
          <a className="button" href="/">
            {copy.errorboundary.returnHome}
          </a>
        </main>
      );
    return this.props.children;
  }
}
