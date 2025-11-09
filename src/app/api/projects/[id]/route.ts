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
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(params.id)
    });

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
      createdBy: project.createdBy || 'system', // Add createdBy with fallback
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

    // Return updated project - with null check
    const updatedProject = await db.collection('projects').findOne({
      _id: new ObjectId(params.id)
    });

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
      createdBy: updatedProject.createdBy || 'system', // Add createdBy with fallback
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