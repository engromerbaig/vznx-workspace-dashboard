import { forwardRef, ReactNode, CSSProperties } from 'react';
import { theme } from '@/theme';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  bgColor?: string; // Add bgColor prop
  [key: string]: any; // For any other props
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { children, className = '', style = {}, bgColor = 'bg-gray-100', ...props },
  ref
) {
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