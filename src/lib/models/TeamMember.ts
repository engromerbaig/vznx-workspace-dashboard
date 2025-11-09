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
  }
}, { 
  timestamps: true 
});

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema);
export default TeamMember;