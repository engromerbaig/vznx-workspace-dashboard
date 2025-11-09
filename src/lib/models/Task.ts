// src/lib/models/Task.ts
import { Schema, models, model, InferSchemaType, Types } from 'mongoose';

const taskSchema = new Schema({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project',
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['incomplete', 'complete'],
    default: 'incomplete'
  },
  assignedTo: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Track who created and last modified the task
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Additional tracking
  completedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Task = models.Task || model('Task', taskSchema);
export default Task;