'use client';

import { ReactNode } from 'react';
import { theme } from '@/theme';

interface HeadingProps {
  title: string;
  titleColor?: string;
  titleSize?: string;
  titleWeight?: string;
  titleMargin?: string;
  titleLineHeight?: string;
  titleAlign?: string;

  text?: ReactNode;
  textColor?: string;
  textSize?: string;
  textWeight?: string;
  textMargin?: string;
  textAlign?: string;

  showUnderline?: boolean;
  underlineHeight?: string;
  underlineOffset?: string;

  icon?: ReactNode; // New optional icon prop
  className?: string;
}

const Heading = ({
  title,
  titleColor = 'text-white',

  titleSize = 'text-4xl',
  titleWeight = 'font-bold',
  titleMargin = 'mb-2',
  titleLineHeight = '1.0',
  titleAlign = 'text-center',

  text,
  textColor = 'text-gray-300',
  textSize = 'text-lg',
  textWeight = 'font-normal',
  textMargin = 'mb-0',
  textAlign = 'text-center',

  showUnderline = false,
  underlineHeight = 'h-1',
  underlineOffset = 'bottom-2',

  icon = false, // Default to false
  className = '',
}: HeadingProps) => {
  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="relative inline-block w-full">
          <div className={`flex items-center justify-${titleAlign === 'text-center' ? 'center' : titleAlign === 'text-right' ? 'end' : 'start'} gap-3`}>
            {icon && (
              <div className="text-primary text-2xl">
                {icon}
              </div>
            )}
            <h1
              className={`${titleSize} ${titleWeight} ${titleAlign} ${titleColor} ${titleMargin}`}
              style={{ lineHeight: titleLineHeight }}
            >
              {title}
            </h1>
          </div>

          {/* ---- Custom Underline (width matches title content) ---- */}
             {showUnderline && (
            <div className="flex justify-start">
              <span
                className={`
                  ${underlineHeight} rounded-none text-primary
                  md:h-1.5
                  lg:h-2
                  ${theme.gradients.hero}
                `}
                style={{ 
                  width: '60%',
                  minWidth: '50px' // Ensure it has some minimum width
                }}
              />
            </div>
          )}
        </div>
      )}

      {text && (
        <p className={`${textSize} ${textWeight} ${textAlign} ${textColor} ${textMargin}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Heading;