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
  | 'note'
  | 'message'
  | 'share'
  | 'work'
  | 'idea'
  | 'heart'
  | 'key'
  | 'device'
  | 'storage'
  | 'warning'
  | 'error';
const paths: Record<IconName, string> = {
  quiet: 'M5 19V8a7 7 0 0 1 14 0v11M9 19V9a3 3 0 0 1 6 0v10M3 19h18',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  link: 'm10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  inbox: 'M4 4h16l2 12v4H2v-4L4 4zm-2 12h6l2 3h4l2-3h6',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4zm-4 10 3 3 5-6',
  check: 'm5 12 4 4L19 6',
  refresh:
    'M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21v-2a8 8 0 0 1 16 0v2',
  exit: 'M9 4H3v16h6m5-13 5 5-5 5m-6-5h11',
  note: 'M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h3',
  message: 'M4 4h16v12H9l-5 4V4zm4 4h8m-8 4h5',
  share: 'M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8',
  work: 'M8 7V4h8v3M3 7h18v14H3V7zm0 6h18M10 13v3h4v-3',
  idea: 'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4',
  heart: 'M12 21 3 12a5 5 0 0 1 9-7 5 5 0 0 1 9 7l-9 9z',
  key: 'M10 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm0 0h11v4h-4v-4m-4 0v3',
  device: 'M3 3h18v13H3V3zm5 18h8m-4-5v5',
  storage: 'M3 4h18v6H3V4zm0 10h18v6H3v-6zm4-7h1m-1 10h1m7-10h3m-3 10h3',
  warning: 'M12 3 1 21h22L12 3zm0 6v5m0 3v1',
  error: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-10-5v6m0 3v1',
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
