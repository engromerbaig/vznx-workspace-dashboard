'use client';

import { ReactNode } from 'react';
import Heading from './Heading';
import { PiCaretRight } from "react-icons/pi";
import { theme } from '@/theme';

interface HeaderProps {
  title?: string; // Made optional with default
  text?: string;
  icon?: ReactNode;
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
  title = "VZNX Workspace Dashboard", // Default title
  text,
  icon,
  bgColor = `${theme.gradients.hero}`,
  rounded = 'rounded-3xl',
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
  
  // Add caret before text if text exists
  const formattedText = text ? (
    <span className="flex items-center gap-2">
      <PiCaretRight className="text-lg" />
      {text}
    </span>
  ) : undefined;

  return (
    <div className={`
      relative 
      ${bgColor} 
      ${rounded} 
      px-8 
      py-12 
      shadow-xl 
      mb-6
      ${className}
    `}>
      {/* Absolute positioned icon - always on right */}
      {icon && (
        <div className="
          absolute 
          top-1/2 
          right-8
          transform 
          -translate-y-1/2 
          text-white 
          text-7xl 
          opacity-20 
          hover:opacity-50
          transition-opacity
          duration-200
        ">
          {icon}
        </div>
      )}
      
      {/* Content with padding adjustment for icon */}
      <div className={icon ? 'pr-16' : ''}>
        <Heading
          title={title}
          titleColor={titleColor}
          titleSize={titleSize}
          titleWeight={titleWeight}
          titleMargin={titleMargin}
          titleLineHeight={titleLineHeight}
          titleAlign={titleAlign}
          text={formattedText} // Use formatted text with caret
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