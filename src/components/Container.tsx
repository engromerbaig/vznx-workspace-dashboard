import { forwardRef, ReactNode, CSSProperties } from 'react';
import { theme } from '@/theme';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  bgColor?: string;
  disableOnRoot?: boolean; // Add disableOnRoot prop
  [key: string]: any;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { 
    children, 
    className = '', 
    style = {}, 
    bgColor = 'bg-gray-100', 
    disableOnRoot = false,
    ...props 
  },
  ref
) {
  // If disableOnRoot is true, don't apply container padding/background
  if (disableOnRoot) {
    return (
      <div
        ref={ref}
        {...props}
        className={className}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Normal container with padding and background
  return (
    <div
      ref={ref}
      {...props}
      className={`${bgColor} ${theme.sectionPaddings.horizontalPx} ${theme.sectionPaddings.verticalPy} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});

export default Container;