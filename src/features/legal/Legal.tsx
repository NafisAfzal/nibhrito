import { copy } from '../../app/copy';
import { useEffect, useState } from 'react';
import { policies } from '../../app/policies';
import { siteInfo, type SiteInfo } from '../../../shared/schemas/site';
import { api } from '../../lib/api';
import { Notice } from '../../components/Layout';
export function Legal({ path }: { path: keyof typeof policies }) {
  const policy = policies[path],
    [site, setSite] = useState<SiteInfo | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    void api<unknown>('/api/v1/site')
      .then((data) => {
        if (active) setSite(siteInfo(data));
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <article className="narrow legal">
      <p className="eyebrow">{copy.legal.nibhritoUpdated3October2026}</p>
      <h1>{policy.title}</h1>
      <p className="lede">{policy.intro}</p>
      <nav aria-label={copy.legal.policies}>
        {Object.entries(policies).map(([href, item]) => (
          <a
            key={href}
            className="text-link"
            href={href}
            aria-current={path === href ? 'page' : undefined}
          >
            {item.title}
          </a>
        ))}
      </nav>
      {policy.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      <section className="card">
        <h2>{copy.legal.serviceOperator}</h2>
        {site ? (
          site.local && !site.operator_name ? (
            <p>
              {copy.legal.localEvaluationOperatorIdentityContactAndJurisdiction}
            </p>
          ) : (
            <>
              <p>
                {site.operator_name} {copy.legal.text} {site.jurisdiction}
              </p>
              <a className="text-link" href={`mailto:${site.contact_email}`}>
                {site.contact_email}
              </a>
              <p className="hint">
                {copy.legal.emailIsVoluntaryDisclosureToYourMail}
              </p>
            </>
          )
        ) : error ? (
          <Notice message="Operator details could not be loaded. Please refresh." />
        ) : (
          <p role="status">{copy.legal.loadingOperatorDetails}</p>
        )}
      </section>
    </article>
  );
}
