import { copy } from '../app/copy';
import { useEffect, useState, type ReactNode } from 'react';
import { supportsCrypto } from '../lib/browser';
import { PageIntro, LoadingState } from './PageIntro';
export function BrowserSupport({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void supportsCrypto().then((value) => {
      if (active) setSupported(value);
    });
    return () => {
      active = false;
    };
  }, []);
  if (supported === null)
    return (
      <LoadingState>
        {copy.browsersupport.checkingSecureBrowserSupport}
      </LoadingState>
    );
  if (!supported)
    return (
      <div className="narrow state-page">
        <PageIntro
          eyebrow={copy.ui.security}
          title={copy.browsersupport.thisBrowserCannotSafelyOpenNibhrito}
          icon="shield"
        />
        <p>{copy.browsersupport.useAnUpToDateChromeEdge}</p>
        <a className="text-link" href="/security">
          {copy.browsersupport.readTheSecurityExplanation}
        </a>
      </div>
    );
  return children;
}
