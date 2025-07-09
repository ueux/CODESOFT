import * as React from 'react';

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={23}
    viewBox="0 0 17 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx={8.57894}
      cy={5.77803}
      r={4.77803}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 17.2014C1 14.5551 4.13401 13.5 8.57895 13.5C13.0239 13.5 16.1579 14.5551 16.1579 17.2014C16.1579 19.8476 13.0239 20 8.57895 20C4.13401 20 1 19.8476 1 17.2014Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ProfileIcon;