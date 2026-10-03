export type IconName =
  | 'quiet'
  | 'arrow'
  | 'lock'
  | 'link'
  | 'inbox'
  | 'shield'
  | 'check'
  | 'refresh'
  | 'profile'
  | 'exit'
  | 'note';
const paths: Record<IconName, string> = {
  quiet: 'M5 19V8a7 7 0 0 1 14 0v11M9 19V9a3 3 0 0 1 6 0v10M3 19h18',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  link: 'm10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  inbox: 'M4 4h16l2 12v4H2v-4L4 4zm-2 12h6l2 3h4l2-3h6',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4zm-4 10 3 3 5-6',
  check: 'm5 12 4 4L19 6',
  refresh:
    'M20 7v5h-5M4 17v-5h5m-5 0a8 8 0 0 1 14-6l2 6m0 0a8 8 0 0 1-14 6l-2-6',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21v-2a8 8 0 0 1 16 0v2',
  exit: 'M9 4H3v16h6m5-13 5 5-5 5m-6-5h11',
  note: 'M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h3',
};
export function Icon({
  name,
  className = '',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
