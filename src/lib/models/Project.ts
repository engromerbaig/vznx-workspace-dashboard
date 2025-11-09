// src/lib/models/Project.ts
import { Schema, models, model, InferSchemaType, Types } from 'mongoose';
import { TaskStatsService } from '@/lib/services/taskStatsService';

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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Task statistics - always calculated from actual tasks
  taskStats: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    incomplete: { type: Number, default: 0 }
  }
}, { 
  timestamps: true 
});

// Virtual for real-time progress calculation
projectSchema.virtual('realTimeStats').get(async function() {
  return await TaskStatsService.getProjectStats(this._id.toString());
});

// Update stats before saving
projectSchema.pre('save', async function(next) {
  if (this.isModified('progress') || this.isModified('status')) {
    await TaskStatsService.updateProjectStats(this._id.toString());
  }
  next();
});

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Project = models.Project || model('Project', projectSchema);
export default Project;