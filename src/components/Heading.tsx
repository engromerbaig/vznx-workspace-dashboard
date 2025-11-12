'use client';

import { ReactNode } from 'react';

interface HeadingProps {
  title: string;
  titleColor?: string;
  
  // style-related props
  titleSize?: string;
  titleWeight?: string;
  titleMargin?: string;
  titleLineHeight?: string;
  titleAlign?: string;

  // Optional text prop - changed to ReactNode
  text?: ReactNode; // Changed from string to ReactNode
  textColor?: string;
  textSize?: string;
  textWeight?: string;
  textMargin?: string;
  textAlign?: string;

  className?: string;
}

const Heading = ({
  title,
  titleColor = 'text-white',

  // style-related props
  titleSize = 'text-4xl',
  titleWeight = 'font-bold',
  titleMargin = 'mb-2',
  titleLineHeight = '1.0',
  titleAlign = 'text-center',

  // Optional text props
  text,
  textColor = 'text-gray-300',
  textSize = 'text-lg',
  textWeight = 'font-normal',
  textMargin = 'mb-0',
  textAlign = 'text-center',

  className = '',
}: HeadingProps) => {
  return (
    <div className={className}>
      {title && (
        <h1
          className={`${titleSize} ${titleWeight} ${titleAlign} ${titleColor} ${titleMargin}`}
          style={{ lineHeight: titleLineHeight }}
        >
          {title}
        </h1>
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