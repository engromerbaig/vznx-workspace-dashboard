import Image from 'next/image';
import { companyInfo } from '@/data/companyInfo';

export default function DeveloperCard() {
  return (
    <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-5 flex flex-col items-center text-center space-y-3 w-44">
      <p className="text-xs text-gray-700 font-medium">Developed by</p>
      <a
        href={companyInfo.developer.website}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform duration-200 hover:scale-105"
      >
        <Image
          src="/scons.png"
          alt="Scons Tech Logo"
          width={100}
          height={40}
          className="object-contain"
        />
      </a>
      <a
        href={`tel:${companyInfo.developer.phone}`}
        className="text-xs px-4 py-2 bg-black hover:bg-gray-800 font-medium rounded-full text-white transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Contact Scons
      </a>
    </div>
  );
}