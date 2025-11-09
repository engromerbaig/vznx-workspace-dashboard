import { ReactNode, ButtonHTMLAttributes } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded transition-colors duration-200 cursor-pointer';
  
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-black/80',
    secondary: 'text-primary hover:text-primary/80',
    icon: 'flex items-center gap-2 text-primary hover:text-primary/80'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {variant === 'icon' && icon && <span>{icon}</span>}
      {children}
    </button>
  );
}