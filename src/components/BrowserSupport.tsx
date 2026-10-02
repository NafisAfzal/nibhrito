import { copy } from '../app/copy';
import { useEffect, useState, type ReactNode } from 'react';
import { supportsCrypto } from '../lib/browser';
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
      <p role="status">{copy.browsersupport.checkingSecureBrowserSupport}</p>
    );
  if (!supported)
    return (
      <div className="narrow card">
        <h1>{copy.browsersupport.thisBrowserCannotSafelyOpenNibhrito}</h1>
        <p>{copy.browsersupport.useAnUpToDateChromeEdge}</p>
        <a className="text-link" href="/security">
          {copy.browsersupport.readTheSecurityExplanation}
        </a>
      </div>
    );
  return children;
}
