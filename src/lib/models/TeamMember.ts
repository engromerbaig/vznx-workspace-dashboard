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
};

const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema);
export default TeamMember;