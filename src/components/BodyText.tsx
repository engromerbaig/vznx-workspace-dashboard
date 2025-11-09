// src/components/ui/BodyText.tsx
'use client';

interface BodyTextProps {
  text: string;
  textColor?: string;
  textWidth?: string;
  textSize?: string;
  textWeight?: string;
  textMargin?: string;
  textAlign?: string;
  textLineHeight?: string;
  className?: string;
}

const BodyText = ({
  text,
  textColor = 'text-black',
  textWidth = '',
  textSize = 'text-base',
  textWeight = 'font-normal',
  textMargin = 'mb-4',
  textAlign = 'text-left',
  textLineHeight = 'leading-normal',
  className = '',
}: BodyTextProps) => {
  return (
    <p
      className={`
        ${textSize} 
        ${textWeight} 
        ${textMargin} 
        ${textAlign} 
        ${textLineHeight} 
        ${textColor} 
        ${textWidth} 
        ${className}
      `}
    >
      {text}
    </p>
  );
};

export default BodyText;