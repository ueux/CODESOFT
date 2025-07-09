import * as React from 'react';

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 6.5C10.5 3.5 7 3 5 5.5C2 8.5 4 12 12 17.5C20 12 22 8.5 19 5.5C17 3 13.5 3.5 12 6.5Z"
      stroke="currentColor"
      strokeWidth="1" strokeLinecap="square"
      strokeLinejoin="round"
    />
  </svg>
);

export default HeartIcon;