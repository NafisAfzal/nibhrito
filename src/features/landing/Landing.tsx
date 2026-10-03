import { copy } from '../../app/copy';
import { Icon } from '../../components/Icon';
export function Landing() {
  const c = copy.landing;
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 id="hero-title">
            {c.title}
            <span>{c.titleQuiet}</span>
          </h1>
          <p className="lede">{c.intro}</p>
          <div className="actions">
            <a className="button" href="/create">
              {c.create}
              <Icon name="arrow" />
            </a>
            <a className="text-link" href="#how-it-works">
              {c.how}
            </a>
          </div>
          <p className="trust-line">
            <Icon name="lock" />
            {c.trust}
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="quiet-arch">
            <Icon name="quiet" />
          </div>
          <div className="illustrated-note">
            <span className="note-rule" />
            <span className="note-rule" />
            <span className="note-rule short" />
            <span className="sealed-note">
              <Icon name="lock" />
              {c.note}
            </span>
          </div>
          <p lang="bn">{c.bangla}</p>
        </div>
      </section>
      <section
        className="how-section"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="section-heading">
          <p className="eyebrow">{c.howEyebrow}</p>
          <h2 id="how-title">{c.howTitle}</h2>
        </div>
        <div className="steps">
          {c.steps.map((step, i) => (
            <div className="step" key={step.title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="privacy-section" aria-labelledby="privacy-title">
        <div>
          <span className="icon-tile">
            <Icon name="shield" />
          </span>
          <p className="eyebrow">{c.privacyEyebrow}</p>
          <h2 id="privacy-title">{c.privacyTitle}</h2>
          <p>{c.privacyBody}</p>
          <a className="text-link" href="/security">
            {c.privacyLink}
            <Icon name="arrow" />
          </a>
        </div>
        <div className="privacy-facts">
          {c.facts.map((f) => (
            <div key={f.title}>
              <Icon name="check" />
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="final-cta">
        <p lang="bn">{c.bangla}</p>
        <h2>{c.finalTitle}</h2>
        <p>{c.finalBody}</p>
        <a className="button" href="/create">
          {c.create}
          <Icon name="arrow" />
        </a>
        <a className="text-link restore-link" href="/restore">
          {c.restore}
        </a>
      </section>
    </div>
  );
}
