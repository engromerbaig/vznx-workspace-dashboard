// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';
import { getCurrentUser } from '@/lib/server/auth-utils';

// Helper function to update project task statistics
async function updateProjectTaskStats(projectId: string) {
  const db = await getDatabase();
  
  const tasks = await db.collection('tasks')
    .find({ projectId })
    .toArray();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'complete').length;
  const incompleteTasks = totalTasks - completedTasks;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Update project progress and task stats
  await db.collection('projects').updateOne(
    { _id: new ObjectId(projectId) },
    { 
      $set: { 
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'planning',
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          incomplete: incompleteTasks
        },
        updatedAt: new Date()
      }
    }
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    const project = await db.collection('projects').aggregate([
      {
        $match: { _id: new ObjectId(params.id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'projectId',
          as: 'projectTasks'
        }
      },
      {
        $addFields: {
          taskStats: {
            total: { $size: '$projectTasks' },
            completed: {
              $size: {
                $filter: {
                  input: '$projectTasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'complete'] }
                }
              }
            },
            incomplete: {
              $size: {
                $filter: {
                  input: '$projectTasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'incomplete'] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          status: 1,
          progress: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          taskStats: 1,
          createdBy: {
            $cond: {
              if: { $ne: ['$creator', null] },
              then: '$creator.username',
              else: 'system'
            }
          }
        }
      }
    ]).next();

    if (!project) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    const formattedProject: BaseProject = {
      _id: project._id.toString(),
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project.description,
      createdBy: project.createdBy,
      taskStats: project.taskStats, // Include taskStats
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      project: formattedProject 
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const db = await getDatabase();
    
    // First, verify the project exists
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(params.id)
    });

    if (!project) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    // Return updated project with populated info
    const updatedProject = await db.collection('projects').aggregate([
      {
        $match: { _id: new ObjectId(params.id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'projectId',
          as: 'projectTasks'
        }
      },
      {
        $addFields: {
          taskStats: {
            total: { $size: '$projectTasks' },
            completed: {
              $size: {
                $filter: {
                  input: '$projectTasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'complete'] }
                }
              }
            },
            incomplete: {
              $size: {
                $filter: {
                  input: '$projectTasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'incomplete'] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          status: 1,
          progress: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          taskStats: 1,
          createdBy: {
            $cond: {
              if: { $ne: ['$creator', null] },
              then: '$creator.username',
              else: 'system'
            }
          }
        }
      }
    ]).next();

    if (!updatedProject) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found after update' },
        { status: 404 }
      );
    }

    const formattedProject: BaseProject = {
      _id: updatedProject._id.toString(),
      name: updatedProject.name,
      status: updatedProject.status,
      progress: updatedProject.progress,
      description: updatedProject.description,
      createdBy: updatedProject.createdBy,
      taskStats: updatedProject.taskStats,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      project: formattedProject 
    });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    // Also delete all tasks associated with this project
    await db.collection('tasks').deleteMany({
      projectId: params.id
    });

    return NextResponse.json({ 
      status: 'success', 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete project' },
      { status: 500 }
    );
  }
}