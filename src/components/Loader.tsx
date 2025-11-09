// components/Loader.tsx
interface LoaderProps {
  fullScreen?: boolean;
  withBackground?: boolean;
  withBlur?: boolean;
  text?: string;
}

export default function Loader({ 
  fullScreen = true, 
  withBackground = false, 
  withBlur = true,
  text = '' 
}: LoaderProps) {
  const containerClasses = [
    'flex items-center justify-center',
    fullScreen ? 'fixed inset-0 z-50' : 'min-h-screen',
    withBackground ? 'bg-gradient-to-br from-slate-50 to-blue-100/30' : 'bg-transparent',
    withBlur ? 'backdrop-blur-xs' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/30 border-t-primary/80"></div>
        {text && (
          <p className="text-sm text-gray-600 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}