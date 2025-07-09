import * as React from 'react';

const GoogleLoginButton = (props: any) => (
  <button
    {...props}
    className={`mx-auto flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${props.className ?? ''}`}
  >
    <GoogleIcon className="w-5 h-5" />
    Continue with Google
  </button>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
    className={props.className}
    {...props}
  >
    <path
      d="M533.5 278.4c0-18.2-1.5-36-4.3-53.2H272v100.9h146.9c-6.3 34-25 62.7-53.3 82v68.2h85.8c50.3-46.4 81.1-114.9 81.1-197.9z"
      fill="#4285F4"
    />
    <path
      d="M272 544.3c72.9 0 134-24.2 178.6-65.9l-85.8-68.2c-23.8 16-54.2 25.4-92.8 25.4-71.4 0-131.9-48.2-153.7-113.1H30.4v70.9c44.5 88 136.1 150.9 241.6 150.9z"
      fill="#34A853"
    />
    <path
      d="M118.3 322.5c-10.6-31.7-10.6-65.9 0-97.6V154H30.4c-40.9 80.9-40.9 175.3 0 256.2l87.9-70.9z"
      fill="#FBBC05"
    />
    <path
      d="M272 107.7c39.6-.6 77.7 13.5 107.1 39.9l80.1-80.1C407.5 24.3 341.3-2.7 272 0 166.5 0 74.9 62.9 30.4 150.9l87.9 70.9C140.1 155.9 200.6 107.7 272 107.7z"
      fill="#EA4335"
    />
  </svg>
);

export default GoogleLoginButton;
