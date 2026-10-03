import { copy } from '../../app/copy';
import { story } from '../../app/story';
import { Icon } from '../../components/Icon';
import {
  FeedbackExample,
  OpenFeedback,
  PrivacyFlow,
  ProductFlow,
  RespectfulUse,
  UseCases,
} from '../../components/ProductStory';

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
        <FeedbackExample />
      </section>

      <section className="story-section" aria-labelledby="uses-title">
        <div className="section-heading">
          <p className="eyebrow">{story.uses.eyebrow}</p>
          <h2 id="uses-title">{story.uses.title}</h2>
        </div>
        <UseCases />
      </section>

      <section
        className="story-section how-section"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="section-heading">
          <p className="eyebrow">{c.howEyebrow}</p>
          <h2 id="how-title">{c.howTitle}</h2>
        </div>
        <ProductFlow label="How Nibhrito works" steps={story.steps} />
      </section>

      <OpenFeedback />

      <section
        className="story-section privacy-story"
        aria-labelledby="privacy-title"
      >
        <div className="section-heading">
          <p className="eyebrow">{c.privacyEyebrow}</p>
          <h2 id="privacy-title">{c.privacyTitle}</h2>
          <p className="lede">
            Privacy gives honest feedback a little more room. Here is what
            happens to a message.
          </p>
        </div>
        <PrivacyFlow />
        <p className="story-limits">{story.privacy.note}</p>
        <a className="text-link" href="/security">
          {c.privacyLink}
          <Icon name="arrow" />
        </a>
      </section>

      <section
        className="story-section"
        aria-label="Thoughtful, respectful use"
      >
        <RespectfulUse />
        <a className="text-link" href="/about">
          {story.whyLink}
          <Icon name="arrow" />
        </a>
      </section>

      <section className="final-cta">
        <p lang="bn">{story.about.bangla}</p>
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
