// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ObjectId } from 'mongodb';
import { slugify, generateUniqueSlug } from '@/utils/slugify';

// ✅ GET — Fetch all projects (now using slug instead of _id)
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
        $project: {
          name: 1,
          slug: 1, // ✅ Include slug
          status: 1,
          progress: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          taskStats: 1, // ✅ Use stored stats (real-time updated elsewhere)
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
      slug: project.slug,
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

// ✅ POST — Create new project with unique slug
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
    
    // ✅ Generate unique slug
    const baseSlug = slugify(name);
    const existingProjects = await db.collection('projects')
      .find({ slug: { $regex: `^${baseSlug}` } })
      .project({ slug: 1 })
      .toArray();
    const existingSlugs = existingProjects.map(p => p.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // ✅ Insert project
    const project = {
      name: name.trim(),
      slug: uniqueSlug,
      description: description?.trim(),
      status,
      progress: 0,
      taskStats: { total: 0, completed: 0, incomplete: 0 }, // ✅ Default stats
      createdBy: new ObjectId(currentUser._id),
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('projects').insertOne(project);
    
    // ✅ Fetch created project with username
    const newProject = await db.collection('projects').aggregate([
      { $match: { _id: result.insertedId } },
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
          slug: 1,
          status: 1,
          progress: 1,
          description: 1,
          taskStats: 1,
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
      slug: newProject.slug,
      status: newProject.status,
      progress: newProject.progress,
      description: newProject.description,
      createdBy: newProject.createdBy,
      taskStats: newProject.taskStats,
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
