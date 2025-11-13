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

  className = '',
}: HeadingProps) => {
  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="relative inline-block w-full">
          <h1
            className={`${titleSize} ${titleWeight} ${titleAlign} ${titleColor} ${titleMargin}`}
            style={{ lineHeight: titleLineHeight }}
          >
            {title}
          </h1>

          {/* ---- Custom Underline with Tailwind Gradient ---- */}
          {showUnderline && (
            <span
              className={`
                absolute left-0 ${underlineOffset} w-full ${underlineHeight}
                rounded-none
                md:bottom-3 md:h-1.5
                lg:bottom-[-3px] lg:h-2
                ${theme.gradients.hero}   // This applies the gradient!
              `}
            />
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