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
    type: Schema.Types.ObjectId, // Store as ObjectId to reference User
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Project = models.Project || model('Project', projectSchema);
export default Project;