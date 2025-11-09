// src/components/user/AccountInfo.tsx
import { FaUser, FaEnvelope, FaIdBadge, FaShieldAlt, FaHistory, FaCalendar, FaKey, FaUserPlus } from 'react-icons/fa';
import { BaseUser } from '@/types/user';
import BodyText from '@/components/ui/BodyText';
import PrimaryButton from '@/components/PrimaryButton';
import { formatDateTime } from '@/utils/dateFormatter';

interface AccountInfoProps {
  user: BaseUser;
  onPasswordChange: () => void;
}

export default function AccountInfo({ user, onPasswordChange }: AccountInfoProps) {
  const renderField = (Icon: React.ComponentType<any>, label: string, value: string) => (
    <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
      <Icon className="text-primary text-lg mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <BodyText 
          text={label}
          textSize="text-sm"
          textWeight="font-medium"
          textColor="text-gray-600"
          textMargin="mb-1"
        />
        <BodyText 
          text={value}
          textColor="text-gray-900"
          textMargin="mb-0"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg border border-white/30 rounded-xl p-6 space-y-6 shadow-lg">
      {/* Header */}
      <BodyText 
        text="Account Information"
        textSize="text-xl"
        textWeight="font-semibold"
        textColor="text-gray-800"
        textMargin="mb-0"
        className="pb-3 border-b border-white/30"
      />
      
      <div className="space-y-3">
        {renderField(FaUser, 'Name', user.name)}
        {renderField(FaIdBadge, 'Username', user.username)}
        {renderField(FaEnvelope, 'Email', user.email)}
        {renderField(FaShieldAlt, 'Role', user.role.charAt(0).toUpperCase() + user.role.slice(1))}
        
        {/* Created At */}
        {user.createdAt && renderField(
          FaCalendar,
          'Account Created', 
          formatDateTime(user.createdAt, {
            includeTime: true,
            includeSeconds: false
          })
        )}
        
        {/* Created By */}
{renderField(
  FaUserPlus,
  'Created By', 
  user.createdBy || 'System' // Directly use the string value
)}
        
        {/* Last Login */}
        {user.lastLogin && renderField(
          FaHistory, 
          'Last Login', 
          formatDateTime(user.lastLogin, {
            includeTime: true,
            includeSeconds: false
          })
        )}
        
        {/* Last Activity */}
        {user.lastActivity && renderField(
          FaHistory,
          'Last Activity', 
          formatDateTime(user.lastActivity, {
            includeTime: true,
            includeSeconds: false
          })
        )}
      </div>

      <div className="pt-4 border-t border-white/30">
        <PrimaryButton
          onClick={onPasswordChange}
          showIcon={true}
          icon={FaKey}
          iconPosition="left"
          rounded="rounded-lg"
          shadow={true}
          className="w-full py-2.5"
        >
          Change Password
        </PrimaryButton>
      </div>
    </div>
  );
}