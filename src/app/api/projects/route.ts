// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    const projects = await db.collection('projects').aggregate([
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
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    const formattedProjects: BaseProject[] = projects.map(project => ({
      _id: project._id.toString(),
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project.description,
      createdBy: project.createdBy,
      taskStats: project.taskStats,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      status: 'success', 
      projects: formattedProjects 
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, status = 'planning' }: { 
      name: string; 
      description?: string; 
      status?: 'planning' | 'in-progress' | 'completed';
    } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { status: 'error', message: 'Project name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();
    
    const project = {
      name: name.trim(),
      description: description?.trim(),
      status,
      progress: 0,
      createdBy: new ObjectId(currentUser._id), // Store user ID as ObjectId
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('projects').insertOne(project);
    
    // Get the created project with populated creator info
    const newProject = await db.collection('projects').aggregate([
      {
        $match: { _id: result.insertedId }
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
        $project: {
          name: 1,
          status: 1,
          progress: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
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

    if (!newProject) {
      throw new Error('Failed to create project');
    }

    const formattedProject: BaseProject = {
      _id: newProject._id.toString(),
      name: newProject.name,
      status: newProject.status,
      progress: newProject.progress,
      description: newProject.description,
      createdBy: newProject.createdBy,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      project: formattedProject 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create project' },
      { status: 500 }
    );
  }
}