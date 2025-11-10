// src/app/api/projects/[slug]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { TaskStatsService } from '@/lib/services/taskStatsService';
import { slugify, generateUniqueSlug } from '@/utils/slugify';

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    
    const project = await db.collection('projects').aggregate([
      {
        $match: { slug: slug }
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
          slug: 1,
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

    // Get real-time stats to ensure consistency
    const realTimeStats = await TaskStatsService.getProjectStats(project._id.toString());
    
    const formattedProject: BaseProject = {
      _id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      status: realTimeStats.status,
      progress: realTimeStats.progress,
      description: project.description,
      createdBy: project.createdBy,
      taskStats: realTimeStats,
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const db = await getDatabase();
    
    // First, verify the project exists by slug
    const project = await db.collection('projects').findOne({
      slug: slug
    });

    if (!project) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    // If name is being updated, generate a new slug
    let updateData = { ...updates };
    if (updates.name && updates.name !== project.name) {
      const baseSlug = slugify(updates.name);
      
      // Check for existing slugs (excluding current project)
      const existingProjects = await db.collection('projects')
        .find({ 
          slug: { $regex: `^${baseSlug}` },
          _id: { $ne: project._id }
        })
        .project({ slug: 1 })
        .toArray();
      
      const existingSlugs = existingProjects.map(p => p.slug);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      updateData.slug = uniqueSlug;
    }

    updateData.updatedAt = new Date();

    const result = await db.collection('projects').updateOne(
      { slug: slug },
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
        $match: { _id: project._id }
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
          slug: 1,
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
      slug: updatedProject.slug,
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    
    // Check if the parameter is a valid ObjectId (ID) or a slug
    let query: any = { slug: slug };
    
    // If it looks like an ObjectId, search by _id instead
    if (ObjectId.isValid(slug)) {
      query = { _id: new ObjectId(slug) };
    }

    // First get the project to get its ID
    const project = await db.collection('projects').findOne(query);

    if (!project) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    const projectId = project._id.toString();

    // Delete the project using the correct _id
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(projectId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    // Also delete all tasks associated with this project
    await db.collection('tasks').deleteMany({
      projectId: projectId
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