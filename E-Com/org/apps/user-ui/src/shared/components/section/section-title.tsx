import React from 'react';
import TitleBorder from 'apps/user-ui/src/assets/svgs/title-border';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'dark';
}

const SectionTitle = ({
  title,
  subtitle,
  align = 'left',
  color = 'primary'
}: SectionTitleProps) => {
  const textAlign = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const textColor = {
    primary: 'text-blue-600',
    secondary: 'text-red-500',
    dark: 'text-gray-800'
  };

  return (
    <div className={`relative max-w-max ${textAlign[align]}`}>
      {subtitle && (
        <p className={`text-sm font-medium ${color === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>
          {subtitle}
        </p>
      )}
      <h1 className={`md:text-4xl text-2xl relative z-10 font-bold ${textColor[color]} mb-2`}>
        {title}
      </h1>
      <TitleBorder className={`absolute top-[70%] w-full ${align === 'center' ? 'left-1/2 transform -translate-x-1/2' : ''}`} />
    </div>
  );
};

export default SectionTitle;