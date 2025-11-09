'use client';

interface HeadingProps {
  title: string;
  titleColor?: string;
  
  // style-related props
  titleSize?: string;
  titleWeight?: string;
  titleMargin?: string;
  titleLineHeight?: string;
  titleAlign?: string;

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
    </div>
  );
};

export default Heading;