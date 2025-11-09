// src/lib/models/Project.ts
import { Schema, models, model, InferSchemaType, Types } from 'mongoose';

const projectSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['planning', 'in-progress', 'completed'],
    default: 'planning'
  },
  progress: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100,
    default: 0
  },
  description: { 
    type: String, 
    trim: true 
  },
  createdBy: {
    type: String,
    required: true,
    default: 'system'
  }
}, { 
  timestamps: true 
});

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const Project = models.Project || model('Project', projectSchema);
export default Project;