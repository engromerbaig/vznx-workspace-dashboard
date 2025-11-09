// src/components/ui/PageContainer.tsx
import { ReactNode, ComponentType } from 'react';
import { IconType } from 'react-icons';
import SkeletonLoader from '../SkeletonLoader';

interface PageContainerProps {
  // Header props
  title: string;
  description?: string;
  headerIcon?: IconType;
  headerGradient?: string;
  headerAction?: ReactNode;
  headerLoading?: boolean;
  
  // Optional sections
  userInfo?: ReactNode;
  userInfoLoading?: boolean;
  
  summarySection?: {
    title: string;
    loading?: boolean;
    content: ReactNode;
  };
  
  // Tabs
  tabs?: Array<{
    id: string;
    name: string;
    icon: IconType | ComponentType<{ className?: string }>;
    badge?: string | number;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabsLoading?: boolean;
  tabsCount?: number; // For skeleton tabs
  
  // Content
  children: ReactNode;
  contentLoading?: boolean;
  contentSkeletonCount?: number;
  
  // Styling options
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  contentScrollable?: boolean;
  contentMaxHeight?: string;
  contentPadding?: string;
}

export default function PageContainer({
  title,
  description,
  headerIcon: HeaderIcon,
  headerGradient = 'from-primary to-primary/90',
  headerAction,
  headerLoading = false,
  userInfo,
  userInfoLoading = false,
  summarySection,
  tabs,
  activeTab,
  onTabChange,
  tabsLoading = false,
  tabsCount = 3,
  children,
  contentLoading = false,
  contentSkeletonCount = 6,
  maxWidth = '7xl',
  contentScrollable = true,
  contentMaxHeight = 'max-h-[calc(100vh-300px)]',
  contentPadding = 'p-8',
}: PageContainerProps) {
  const maxWidthClass = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  }[maxWidth];

  // Skeleton for header
  const HeaderSkeleton = () => (
    <div className={`bg-gradient-to-r ${headerGradient} px-8 py-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SkeletonLoader width="w-12" height="h-12" variant="circle" />
          <div className="space-y-2">
            <SkeletonLoader width="w-48" height="h-6" />
            <SkeletonLoader width="w-64" height="h-4" />
          </div>
        </div>
        {headerAction && (
          <SkeletonLoader width="w-32" height="h-10" />
        )}
      </div>
    </div>
  );

  // Skeleton for user info
  const UserInfoSkeleton = () => (
    <div className="px-8 py-6 border-b border-gray-200">
      <SkeletonLoader width="w-32" height="h-5" className="mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <SkeletonLoader width="w-20" height="h-3" className="mb-2" />
            <SkeletonLoader width="w-32" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton for tabs
  const TabsSkeleton = () => (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {Array.from({ length: tabsCount }).map((_, index) => (
          <div key={index} className="flex items-center px-8 py-4">
            <SkeletonLoader width="w-4" height="h-4" className="mr-2" />
            <SkeletonLoader width="w-16" height="h-4" />
          </div>
        ))}
      </nav>
    </div>
  );

  // Skeleton for content
  const ContentSkeleton = () => (
    <div className={contentPadding}>
      <div className="space-y-4">
        {Array.from({ length: contentSkeletonCount }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <SkeletonLoader width="w-10" height="h-10" variant="circle" />
                <div className="space-y-2">
                  <SkeletonLoader width="w-32" height="h-4" />
                  <SkeletonLoader width="w-24" height="h-3" />
                </div>
              </div>
              <SkeletonLoader width="w-20" height="h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className={`${maxWidthClass} mx-auto`}>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          {headerLoading ? (
            <HeaderSkeleton />
          ) : (
            <div className={`bg-gradient-to-r ${headerGradient} px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {HeaderIcon && <HeaderIcon className="text-3xl text-white" />}
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-primary-100 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                {headerAction && (
                  <div>{headerAction}</div>
                )}
              </div>
            </div>
          )}

          {/* User Info Section */}
          {userInfoLoading ? (
            <UserInfoSkeleton />
          ) : (
            userInfo && userInfo
          )}

          {/* Summary Section */}
          {summarySection && (
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {summarySection.title} {summarySection.loading && '(Loading...)'}
              </h2>
              {summarySection.content}
            </div>
          )}

          {/* Navigation Tabs */}
          {tabsLoading ? (
            <TabsSkeleton />
          ) : (
            tabs && tabs.length > 0 && (
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange?.(tab.id)}
                      className={`flex items-center cursor-pointer px-8 py-4 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary/80 text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="mr-2" />
                      {tab.name}
                      {tab.badge !== undefined && ` (${tab.badge})`}
                    </button>
                  ))}
                </nav>
              </div>
            )
          )}

          {/* Content */}
          {contentLoading ? (
            <ContentSkeleton />
          ) : (
            <div 
              className={`${contentPadding} ${
                contentScrollable 
                  ? `${contentMaxHeight} custom-scrollbar overflow-y-auto` 
                  : ''
              }`}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}