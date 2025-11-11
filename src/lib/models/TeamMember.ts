// src/lib/models/TeamMember.ts
import { Schema, models, model, InferSchemaType } from 'mongoose';

const teamMemberSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  role: { 
    type: String, 
    required: true,
    trim: true 
  },
  maxCapacity: {
    type: Number,
    default: 8, // Default max capacity
    min: 1,
    max: 20
  }
}, { 
  timestamps: true 
});

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Export the raw document type for server-side usage
export type TeamMemberRaw = TeamMemberDocument;

// Export a client-friendly type with string dates
export type TeamMember = Omit<TeamMemberDocument, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  capacity: number; // This will be calculated on server
};

const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema);
export default TeamMember;