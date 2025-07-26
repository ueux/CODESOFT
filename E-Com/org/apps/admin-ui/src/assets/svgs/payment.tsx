import React from "react";

const Payments = ({ fill }: { fill: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="nextui-c-PJLV nextui-c-PJLV-ibxboXQ-css"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V7H3V5ZM3 9H21V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V9ZM16 16C16 15.45 15.55 15 15 15H7C6.45 15 6 15.45 6 16C6 16.55 6.45 17 7 17H15C15.55 17 16 16.55 16 16Z"
        fill={fill}
      />
    </svg>
  );
};

export default Payments;
