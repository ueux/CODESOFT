'use client';

import React from 'react';

const Logo = () => {
  return (
    <div className="border border-slate-800 h-[38px] w-[38px] flex items-center justify-center rounded-md">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="4" width="24" height="2" rx="1" fill="#969696" />
        <rect y="11" width="24" height="2" rx="1" fill="#969696" />
        <rect y="18" width="24" height="2" rx="1" fill="#969696" />
      </svg>
    </div>
  );
};

export default Logo;
