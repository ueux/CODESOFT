export const FullStar = ({ className = 'w-5 h-5 text-yellow-400' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 1.618l2.9 6.9 7.1 1.1-5 4.9 1 7.1-6-3.2-6 3.2 1-7.1-5-4.9 7.1-1.1 2.9-6.9z"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

export const HalfStar = ({ className = 'w-5 h-5 text-yellow-400' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="halfGrad" x1="0" x2="100%" y1="0" y2="0">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
      <mask id="halfMask">
        <rect x="0" y="0" width="12" height="24" fill="white" />
      </mask>
    </defs>
    <path
      fill="url(#halfGrad)"
      mask="url(#halfMask)"
      d="M12 1.618l2.9 6.9 7.1 1.1-5 4.9 1 7.1-6-3.2-6 3.2 1-7.1-5-4.9 7.1-1.1 2.9-6.9z"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

export const EmptyStar = ({ className = 'w-5 h-5 text-gray-300 dark:text-gray-500' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 1.618l2.9 6.9 7.1 1.1-5 4.9 1 7.1-6-3.2-6 3.2 1-7.1-5-4.9 7.1-1.1 2.9-6.9z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);