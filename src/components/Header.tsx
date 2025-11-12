'use client';

import { ReactNode } from 'react';
import Heading from './Heading';

interface HeaderProps {
  title: string;
  text?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  bgColor?: string;
  rounded?: string;
  className?: string;
  
  // Heading props
  titleColor?: string;
  titleSize?: string;
  titleWeight?: string;
  titleMargin?: string;
  titleLineHeight?: string;
  titleAlign?: string;
  
  textColor?: string;
  textSize?: string;
  textWeight?: string;
  textMargin?: string;
  textAlign?: string;
}

const Header = ({
  title,
  text,
  icon,
  iconPosition = 'right',
  bgColor = 'bg-primary',
  rounded = 'rounded-xl',
  className = '',
  
  // Heading props with defaults suitable for header
  titleColor = 'text-white',
  titleSize = 'text-3xl',
  titleWeight = 'font-bold',
  titleMargin = 'mb-2',
  titleLineHeight = '1.2',
  titleAlign = 'text-left',
  
  textColor = 'text-white/90',
  textSize = 'text-lg',
  textWeight = 'font-normal',
  textMargin = 'mb-0',
  textAlign = 'text-left',
}: HeaderProps) => {
  return (
    <div className={`
      relative 
      ${bgColor} 
      ${rounded} 
      p-8 
      shadow-lg 
      mb-6  /* Added bottom margin */
      ${className}
    `}>
      {/* Absolute positioned icon */}
      {icon && (
        <div className={`
          absolute 
          top-1/2 
          transform 
          -translate-y-1/2 
          ${iconPosition === 'right' ? 'right-8' : 'left-8'} /* Adjusted for increased padding */
          text-white 
          text-7xl 
          opacity-20 
          hover:opacity-50
          transition-opacity
          duration-200
        `}>
          {icon}
        </div>
      )}
      
      {/* Content with padding adjustment for icon */}
      <div className={`
        ${icon && iconPosition === 'right' ? 'pr-16' : ''} 
        ${icon && iconPosition === 'left' ? 'pl-16' : ''}  
      `}>
        <Heading
          title={title}
          titleColor={titleColor}
          titleSize={titleSize}
          titleWeight={titleWeight}
          titleMargin={titleMargin}
          titleLineHeight={titleLineHeight}
          titleAlign={titleAlign}
          text={text}
          textColor={textColor}
          textSize={textSize}
          textWeight={textWeight}
          textMargin={textMargin}
          textAlign={textAlign}
        />
      </div>
    </div>
  );
};

export default Header;