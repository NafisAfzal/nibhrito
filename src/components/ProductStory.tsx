import { story } from '../app/story';
import { Icon, type IconName } from './Icon';

export interface FlowStep {
  readonly icon: IconName;
  readonly title: string;
  readonly body: string;
  readonly shortTitle?: string;
}

export function ProductFlow({
  label,
  steps,
  compact = false,
  privacy = false,
  brief = false,
}: {
  label: string;
  steps: readonly FlowStep[];
  compact?: boolean;
  privacy?: boolean;
  brief?: boolean;
}) {
  return (
    <ol
      className={`product-flow${compact ? ' flow-compact' : ''}${privacy ? ' flow-privacy' : ''}${brief ? ' flow-brief' : ''}${steps.length === 2 ? ' flow-pair' : ''}`}
      aria-label={label}
    >
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="flow-symbol">
            <Icon name={step.icon} />
            <span className="flow-number" aria-hidden="true">
              {index + 1}
            </span>
          </span>
          <div className="flow-caption">
            <strong>
              {brief ? (step.shortTitle ?? step.title) : step.title}
            </strong>
            {!brief ? <p>{step.body}</p> : null}
          </div>
          {index < steps.length - 1 ? (
            <Icon name="arrow" className="flow-arrow" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function PrivacyFlow({ compact = false }: { compact?: boolean }) {
  return (
    <ProductFlow
      label={story.privacy.label}
      steps={story.privacy.steps}
      privacy
      compact={compact}
    />
  );
}

export function RecoveryFlow({ brief = false }: { brief?: boolean }) {
  return (
    <ProductFlow
      label={story.recovery.label}
      steps={story.recovery.steps}
      compact
      brief={brief}
    />
  );
}

export function FeedbackExample() {
  const c = story.example;
  return (
    <figure className="feedback-example">
      <figcaption>{c.label}</figcaption>
      <div className="example-question">
        <span className="example-label">
          <span className="example-person">
            <Icon name="profile" />
          </span>
          {c.ask}
        </span>
        <p>{c.question}</p>
      </div>
      <div className="example-connection">
        <Icon name="link" />
        <span>{c.share}</span>
        <Icon name="arrow" />
      </div>
      <div className="example-response">
        <span className="example-label">
          <span className="example-person private-person">
            <Icon name="profile" />
          </span>
          {c.reply}
        </span>
        <p>{c.response}</p>
        <span className="example-protected">
          <Icon name="lock" />
          {c.protected}
        </span>
        <span className="example-read">
          <Icon name="inbox" />
          {c.read}
        </span>
      </div>
    </figure>
  );
}

export function UseCases() {
  return (
    <div className="use-cases">
      {story.uses.items.map((item) => (
        <article key={item.title}>
          <span className="story-symbol">
            <Icon name={item.icon} />
          </span>
          <h3>{item.title}</h3>
          <blockquote>{item.example}</blockquote>
        </article>
      ))}
    </div>
  );
}

export function PressureComparison() {
  const c = story.openness;
  return (
    <div
      className="pressure-comparison"
      role="group"
      aria-label={c.comparisonLabel}
    >
      {[c.identified, c.private].map((scenario, index) => (
        <figure
          className={
            index === 0
              ? 'pressure-scenario'
              : 'pressure-scenario private-scenario'
          }
          key={scenario.title}
        >
          <figcaption>
            <h3>{scenario.title}</h3>
          </figcaption>
          <ol className="pressure-path" aria-label={scenario.title}>
            {scenario.steps.map((step, stepIndex) => (
              <li key={step.title}>
                <span className="pressure-symbol">
                  <Icon name={step.icon} />
                </span>
                <span>{step.title}</span>
                {stepIndex < 2 ? (
                  <Icon name="arrow" className="pressure-arrow" />
                ) : null}
              </li>
            ))}
          </ol>
          <blockquote>{scenario.quote}</blockquote>
        </figure>
      ))}
    </div>
  );
}

export function OpenFeedback() {
  const c = story.openness;
  return (
    <section
      className="story-section openness-section"
      aria-labelledby="openness-title"
    >
      <div className="section-heading">
        <h2 id="openness-title">{c.title}</h2>
        <p className="lede">{c.intro}</p>
      </div>
      <PressureComparison />
      <p className="comparison-qualifier">{c.qualifier}</p>
      <p className="story-limits">
        {c.limits} <a href="/security">Understand the limits</a>
      </p>
    </section>
  );
}

export function RespectfulUse({ showLink = true }: { showLink?: boolean }) {
  const c = story.respect;
  return (
    <div className="respectful-use">
      <div className="respect-intro">
        <span className="story-symbol">
          <Icon name="heart" />
        </span>
        <div>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
        </div>
      </div>
      <div className="principles">
        {c.items.map((item) => (
          <div key={item.title}>
            <Icon name={item.icon} />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      {showLink ? (
        <a className="text-link" href="/acceptable-use">
          {c.link}
          <Icon name="arrow" />
        </a>
      ) : null}
    </div>
  );
}
