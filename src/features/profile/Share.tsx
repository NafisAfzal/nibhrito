import { useRef, useState } from 'react';
import { copy } from '../../app/copy';
import { Icon } from '../../components/Icon';
import { Notice } from '../../components/Layout';
import { ShareQr } from '../../components/ShareQr';
import { PageIntro } from '../../components/PageIntro';
import { story } from '../../app/story';
import { ProductFlow } from '../../components/ProductStory';
export function Share({ link, slug }: { link: string; slug: string }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState('');
  const details = useRef<HTMLDetailsElement>(null),
    input = useRef<HTMLInputElement>(null);
  function fallback() {
    if (details.current) details.current.open = true;
    input.current?.focus();
    input.current?.select();
    setError(copy.dashboard.copyUnavailableSelectAndCopyTheFull);
  }
  async function copyLink() {
    setError('');
    setCopied(false);
    if (!navigator.clipboard) {
      fallback();
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      fallback();
    }
  }
  return (
    <section className="share-page">
      <PageIntro eyebrow={copy.ui.myLink} title={copy.ui.yourLink} icon="link">
        <p>{copy.ui.shareBody}</p>
      </PageIntro>
      <div className="share-panel card">
        <div className="share-link-content">
          <span className="link-preview" translate="no">
            {window.location.host}/u/<strong>{slug}</strong>
          </span>
          <p className="hint">{copy.ui.completeLinkHint}</p>
          <button
            className={copied ? 'copy-button is-copied' : 'copy-button'}
            onClick={() => {
              void copyLink();
            }}
          >
            <Icon name={copied ? 'check' : 'copy'} />
            {copied ? copy.dashboard.linkCopied : copy.dashboard.copyFullLink}
          </button>
          <p className="copy-status" role="status">
            {copied ? copy.ui.copiedReady : ''}
          </p>
          <details className="complete-link" ref={details}>
            <summary>{copy.ui.viewFullLink}</summary>
            <label htmlFor="share-link">
              {copy.dashboard.verifiedShareLink}
            </label>
            <input
              id="share-link"
              ref={input}
              readOnly
              value={link}
              autoComplete="off"
              spellCheck={false}
              translate="no"
              onFocus={(e) => e.currentTarget.select()}
            />
          </details>
          {error ? <Notice message={error} /> : null}
        </div>
        <div className="qr-block">
          <ShareQr link={link} />
          <p className="hint">{copy.ui.qrHint}</p>
        </div>
      </div>
      <p className="privacy-label">
        <Icon name="lock" />
        {copy.ui.linkTrust}
      </p>
      <section className="share-guide" aria-labelledby="share-guide-title">
        <h2 id="share-guide-title">{story.share.title}</h2>
        <ProductFlow
          label={story.share.label}
          steps={story.share.steps}
          compact
        />
        <p className="helpful-note">
          <Icon name="message" />
          <span>{story.share.tip}</span>
        </p>
      </section>
      <a className="text-link" href={'/inbox?space=' + slug}>
        {copy.ui.backToInbox}
        <Icon name="arrow" />
      </a>
    </section>
  );
}
