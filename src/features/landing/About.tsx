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

export function About() {
  const c = story.about;
  return (
    <article className="about-page">
      <header className="hero about-hero">
        <div>
          <h1>{c.title}</h1>
          <p className="lede">{c.intro}</p>
          <p className="purpose-note">
            <Icon name="heart" />
            {c.purpose}
          </p>
          <a className="button" href="/create">
            {copy.landing.create}
            <Icon name="arrow" />
          </a>
        </div>
        <FeedbackExample />
      </header>
      <OpenFeedback />
      <section className="story-section" aria-labelledby="about-uses-title">
        <div className="section-heading">
          <h2 id="about-uses-title">{story.uses.title}</h2>
        </div>
        <UseCases />
      </section>
      <section className="story-section" aria-labelledby="about-how-title">
        <h2 id="about-how-title">From a question to a fresh perspective.</h2>
        <ProductFlow label="How Nibhrito works" steps={story.steps} />
      </section>
      <section
        className="story-section privacy-story"
        aria-labelledby="about-privacy-title"
      >
        <div className="section-heading">
          <h2 id="about-privacy-title">The feedback is yours to read.</h2>
        </div>
        <PrivacyFlow />
        <p className="story-limits">{story.privacy.note}</p>
        <p className="story-limits">{story.privacy.limits}</p>
        <a className="text-link" href="/security">
          {copy.ui.publicPrivacy}
          <Icon name="arrow" />
        </a>
      </section>
      <section
        className="story-section"
        aria-label="Thoughtful, respectful use"
      >
        <RespectfulUse />
      </section>
      <section className="final-cta">
        <p lang="bn">{c.bangla}</p>
        <h2>{c.finalTitle}</h2>
        <p>{copy.landing.finalBody}</p>
        <a className="button" href="/create">
          {copy.landing.create}
          <Icon name="arrow" />
        </a>
      </section>
    </article>
  );
}
