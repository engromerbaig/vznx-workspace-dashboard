// src/lib/models/User.ts
import { Schema, models, model, InferSchemaType, Types } from 'mongoose';

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
  role: { type: String, required: true, default: 'user' },
  
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

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const User = models.User || model('User', userSchema);
export default User;