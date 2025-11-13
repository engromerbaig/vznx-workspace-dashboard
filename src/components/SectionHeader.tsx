// src/components/SectionHeader.tsx
import { ReactNode } from 'react';
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'next/navigation';
import Heading from './Heading';

interface SectionHeaderProps {
  /** Section title */
  title: string;

  /** URL for the “View All” link */
  viewAllHref?: string;

  /** Show the Add button? */
  showAdd?: boolean;

  /** Text inside the Add button (default “Add <title>”) */
  addText?: string;

  /** Optional icon for the Add button (defaults to FaPlus) */
  addIcon?: ReactNode;

  /** Called when the Add button is clicked */
  onAdd?: () => void;

  /** Optional icon for the heading */
  icon?: ReactNode;
}

export default function SectionHeader({
  title,
  viewAllHref,
  showAdd = false,
  addText,
  addIcon = <FaPlus />,
  onAdd,
  icon, // New icon prop
}: SectionHeaderProps) {
  const router = useRouter();

  const defaultAddText = addText ?? `Add ${title.replace(/s$/, '')}`;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      {/* Title with optional icon */}
      <Heading 
        titleColor='text-black'  
        title={title} 
        showUnderline 
        icon={icon} // Pass the icon to Heading
      />

      {/* Right side: View All + Add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* View All */}
        {viewAllHref && (
          <button
            onClick={() => router.push(viewAllHref)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium group"
          >
            View All
            <FaArrowRight className="text-sm transform group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Add button */}
        {showAdd && (
          <PrimaryButton
            onClick={onAdd}
            showIcon
            className="w-full sm:w-auto"
          >
            {defaultAddText}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}