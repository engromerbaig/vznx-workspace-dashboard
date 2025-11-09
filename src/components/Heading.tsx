import { FaArrowRightLong } from "react-icons/fa6";

interface HeadingProps {
  title: string;
  showArrow?: boolean;
  arrowLink?: string;
  marginBottom?: string;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export default function Heading({
  title,
  showArrow = false,
  arrowLink,
  justify = 'center',
  marginBottom = 'mb-6'
}: HeadingProps) {
  return (
    <div className={`flex gap-x-4 items-center justify-${justify} ${marginBottom}`}>
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {showArrow && arrowLink && (
        <a
          href={arrowLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black border border-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ease-in-out hover:bg-primary hover:text-white hover:border-primary"
        >
          View All <FaArrowRightLong />
        </a>
      )}
    </div>
  );
}
