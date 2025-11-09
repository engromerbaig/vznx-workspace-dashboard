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
  }
}, { 
  timestamps: true 
});

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const Task = models.Task || model('Task', taskSchema);
export default Task;