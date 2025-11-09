// src/lib/models/User.ts
import { Schema, models, model, InferSchemaType, Types } from 'mongoose';
import { ROLES } from '../roles';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { 
    type: String, 
    required: true,
    set: (name: string) => {
      // Convert to sentence case: first letter capital, rest lowercase
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
  },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(ROLES), default: ROLES.MANAGER },
  
  // Role-based permissions (inherited from role)
  rolePermissions: { 
    type: [String], 
    default: [] 
  },
  
  // Specific permissions (override/add to role permissions)
  specificPermissions: { 
    type: [String], 
    default: [] 
  },
  
  sessionToken: { type: String, default: null, index: true },
  sessionCreatedAt: { type: Date, default: null },
  sessionExpiresAt: { type: Date, default: null },
  lastActivity: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  
  // Add createdBy field - references another User or defaults to "system"
  createdBy: { 
    type: Schema.Types.Mixed, // Can be ObjectId (User reference) or String ("system")
    default: "system",
    ref: 'User'
  },
}, { 
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Virtual for combined permissions (role + specific)
userSchema.virtual('permissions').get(function() {
  const rolePerms = this.rolePermissions || [];
  const specificPerms = this.specificPermissions || [];
  
  // Combine and remove duplicates
  return [...new Set([...rolePerms, ...specificPerms])];
});

// Method to check if user has a specific permission
userSchema.methods.hasPermission = function(permission: string): boolean {
  const allPermissions = this.permissions;
  return allPermissions.includes(permission);
};

// Method to check if user has any of the given permissions
userSchema.methods.hasAnyPermission = function(permissions: string[]): boolean {
  const allPermissions = this.permissions;
  return permissions.some(permission => allPermissions.includes(permission));
};

// Method to check if user has all of the given permissions
userSchema.methods.hasAllPermissions = function(permissions: string[]): boolean {
  const allPermissions = this.permissions;
  return permissions.every(permission => allPermissions.includes(permission));
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[]; // Virtual field
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
};

const User = models.User || model('User', userSchema);
export default User;