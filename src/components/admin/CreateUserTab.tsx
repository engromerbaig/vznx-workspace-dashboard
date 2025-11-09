import { FaUserPlus } from 'react-icons/fa';
import PrimaryButton from '../PrimaryButton';
import InputField from '../InputField';
import { getAllRoles, getRoleDisplayName, type UserRole } from '@/lib/roles'; // Added UserRole import
import { CreateUserData } from '@/types/user';

interface CreateUserTabProps {
  newUser: CreateUserData;
  setNewUser: (user: CreateUserData) => void;
  isCreatingUser: boolean;
  onCreateUser: (e: React.FormEvent) => void;
}

const CreateUserTab = ({ newUser, setNewUser, isCreatingUser, onCreateUser }: CreateUserTabProps) => {
  const handleInputChange = (field: keyof CreateUserData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewUser({ ...newUser, role: e.target.value as UserRole });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New User</h3>
      <form onSubmit={onCreateUser} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            type="text"
            required={true}
            value={newUser.name}
            onChange={handleInputChange('name')}
            placeholder="Enter full name"
          />
          
          <InputField
            label="Username"
            type="text"
            required={true}
            value={newUser.username}
            onChange={handleInputChange('username')}
            placeholder="Enter username"
          />
        </div>
        
        <InputField
          label="Email Address"
          type="email"
          required={true}
          value={newUser.email}
          onChange={handleInputChange('email')}
          placeholder="Enter email address"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Password"
            type="password"
            required={true}
            value={newUser.password}
            onChange={handleInputChange('password')}
            placeholder="Enter password"
            isPassword={true}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              value={newUser.role}
              onChange={handleSelectChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            >
              {getAllRoles().map((role) => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <PrimaryButton
            type="submit"
            disabled={isCreatingUser}
            isLoading={isCreatingUser}
            loadingText="Creating User..."
            showIcon={!isCreatingUser}
            icon={FaUserPlus}
            className="w-full md:w-auto"
          >
            Create User
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default CreateUserTab;