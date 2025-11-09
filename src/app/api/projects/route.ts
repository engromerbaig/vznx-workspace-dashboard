// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';

export async function GET() {
  try {
    const db = await getDatabase();
    const projects = await db.collection('projects')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const formattedProjects: BaseProject[] = projects.map(project => ({
      _id: project._id.toString(),
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project.description,
      createdBy: project.createdBy || 'system', // Add createdBy with fallback
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
    const { name, description, status = 'planning', createdBy = 'system' }: { 
      name: string; 
      description?: string; 
      status?: 'planning' | 'in-progress' | 'completed';
      createdBy?: string;
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
      createdBy: createdBy.trim(),
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('projects').insertOne(project);
    
    const newProject: BaseProject = {
      _id: result.insertedId.toString(),
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project.description,
      createdBy: project.createdBy,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      project: newProject 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create project' },
      { status: 500 }
    );
  }
}