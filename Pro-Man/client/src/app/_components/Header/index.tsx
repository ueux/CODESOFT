import React from "react";
import { useAppSelector } from "@/app/redux";

type Props = {
  name: string;
  buttonComponent?: React.ReactNode;
  isSmallText?: boolean;
  description?: string;
};

const Header = ({ name, buttonComponent, isSmallText = false, description }: Props) => {
  return (
    <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex-1">
        <h1 className={`header-title ${isSmallText ? 'small' : 'large'}`}>
          {name}
        </h1>
        {description && (
          <p className="header-description">
            {description}
          </p>
        )}
      </div>

      {buttonComponent && (
        <div className="flex-shrink-0">
          {React.isValidElement(buttonComponent)
            ? React.cloneElement(buttonComponent, {
                className: `primary-button ${
                  buttonComponent.props.className || ''
                }`
              })
            : buttonComponent}
        </div>
      )}
    </div>
  );
};

export default Header;