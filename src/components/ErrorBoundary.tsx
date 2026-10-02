import { copy } from '../app/copy';
import { Component, type ReactNode } from 'react';
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
        <main className="shell narrow">
          <h1>{copy.errorboundary.thisScreenCouldNotBeOpened}</h1>
          <p>{copy.errorboundary.refreshToClearTemporaryPageStateYour}</p>
          <a className="button" href="/">
            {copy.errorboundary.returnHome}
          </a>
        </main>
      );
    return this.props.children;
  }
}
