import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
export function PageIntro({
  eyebrow,
  title,
  children,
  icon,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  icon?: IconName;
}) {
  return (
    <header className="page-intro">
      {icon ? (
        <span className="icon-tile">
          <Icon name={icon} />
        </span>
      ) : null}
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children ? <div className="lede">{children}</div> : null}
    </header>
  );
}
export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-mark" aria-hidden="true">
        <Icon name="lock" />
      </span>
      <p>{children}</p>
    </div>
  );
}
