// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';

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
      createdBy: project.createdBy, // Actual username
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

// Update PUT function similarly...
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const db = await getDatabase();
    
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

    // Return updated project with populated creator
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
      createdBy: updatedProject.createdBy, // Actual username
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