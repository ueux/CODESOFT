import * as React from 'react';

const CartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 5H6.5L7.8 14.2C7.9 15 8.6 15.6 9.4 15.6H17.5C18.2 15.6 18.9 15 19 14.3L20 8H7"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <circle
      cx="10"
      cy="20"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1"
    />
    <circle
      cx="17"
      cy="20"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

export default CartIcon;
