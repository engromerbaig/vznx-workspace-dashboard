// src/components/SectionHeader.tsx
import { ReactNode } from 'react';
import { FaPlus, FaArrowRight, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'next/navigation';
import Heading from './Heading';

interface SectionHeaderProps {
  /** Section title */
  title: string;

  /** URL for the "View All" link */
  viewAllHref?: string;

  /** Show the Add button? */
  showAdd?: boolean;

  /** Text inside the Add button (default "Add <title>") */
  addText?: string;

  /** Optional icon for the Add button (defaults to FaPlus) */
  addIcon?: ReactNode;

  /** Called when the Add button is clicked */
  onAdd?: () => void;

  /** Optional icon for the heading */
  icon?: ReactNode;

  /** Show view count badge? */
  showViewCount?: boolean;
  viewCount?: number;
}

export default function SectionHeader({
  title,
  viewAllHref,
  showAdd = false,
  addText,
  addIcon = <FaPlus className="text-sm" />,
  onAdd,
  icon,
  showViewCount = false,
  viewCount = 0,
}: SectionHeaderProps) {
  const router = useRouter();

  const defaultAddText = addText ?? `Add ${title.replace(/s$/, '')}`;

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8">
      {/* Left side - Title with responsive sizing */}
        <Heading 
          titleColor='text-gradient-hero'  
          title={title} 
          showUnderline 
          icon={icon}
        />
        
        {/* Optional view count */}
      

      {/* Right side - Action buttons with responsive layout */}
      <div className="flex flex-row xs:flex-row gap-3 w-full lg:w-auto">
        {/* Enhanced View All as PrimaryButton */}
        {viewAllHref && (
          <div className="flex-1 lg:flex-none">
            <PrimaryButton
              onClick={() => router.push(viewAllHref)}
              showIcon
              icon={FaArrowRight}
              iconPosition="right"
              bgColor="bg-transparent"
              textColor="text-gray-700"
              hoverColor="bg-gray-50"
              border={true}
              borderColor="border-gray-300"
              hoverBorderColor="border-gray-400"
              rounded="rounded-xl"
              shadow={false}
              className="group w-full lg:w-auto border-dashed hover:border-solid transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">View All</span>
                {showViewCount && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold min-w-6 flex items-center justify-center">
                    {viewCount > 99 ? '99+' : viewCount}
                  </span>
                )}
              </div>
            </PrimaryButton>
          </div>
        )}

        {/* Enhanced Add button */}
        {showAdd && (
          <div className="flex-1 lg:flex-none">
            <PrimaryButton
              onClick={onAdd}
              showIcon
              icon={FaPlus}
              iconPosition="left"
              textColor="text-white"
              rounded="rounded-xl"
              shadow={true}
            >
              {defaultAddText}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}