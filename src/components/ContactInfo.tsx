import { FaMapMarkerAlt, FaPhone, FaGlobe } from 'react-icons/fa';
import { companyInfo } from '@/data/companyInfo';

export default function ContactInfo() {
  return (
    <div className="text-sm text-gray-700 space-y-3">
      <h3 className="font-semibold text-gray-800 mb-3 text-center md:text-left">Contact Us</h3>
      
      <div className="flex items-start gap-3">
        <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
        <a 
          href={companyInfo.contact.addressLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors duration-200 leading-tight"
        >
          {companyInfo.contact.address}
        </a>
      </div>
      
      <div className="flex items-center gap-3">
        <FaPhone className="text-primary flex-shrink-0" />
        <a 
          href={`tel:${companyInfo.contact.phone}`}
          className="hover:text-primary transition-colors duration-200"
        >
          {companyInfo.contact.phone}
        </a>
      </div>
      
      <div className="flex items-center gap-3">
        <FaGlobe className="text-primary flex-shrink-0" />
        <a
          href={companyInfo.contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors duration-200"
        >
          {companyInfo.contact.website.replace(/^https?:\/\//, '')}
        </a>
      </div>
      
      <div className="pt-2 border-t border-gray-300/50">
        <p className="text-gray-600 text-center md:text-left">
          © {companyInfo.name} {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}