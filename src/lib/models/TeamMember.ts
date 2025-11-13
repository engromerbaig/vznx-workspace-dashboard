// src/lib/models/TeamMember.ts
import { Schema, models, model } from 'mongoose';
import { DEFAULT_ROLES } from '@/types/team'; // ← from types/team.ts

const teamMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: DEFAULT_ROLES,
      required: true,
      trim: true,
    },
    maxCapacity: {
      type: Number,
      min: 1,
      max: 20,
    },
  },
  { timestamps: true }
);

const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema);
export default TeamMember;