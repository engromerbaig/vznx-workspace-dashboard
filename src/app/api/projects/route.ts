// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ObjectId } from 'mongodb';
import { slugify, generateUniqueSlug } from '@/utils/slugify';

// ✅ GET — Server-side pagination for optimal performance
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    // Get total count for pagination info
    const totalProjects = await db.collection('projects').countDocuments();

    // Get paginated projects
    const projects = await db
      .collection('projects')
      .find({}, {
        projection: {
          name: 1,
          slug: 1,
          status: 1,
          progress: 1,
          description: 1,
          taskStats: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Preload all unique creator IDs for one batched user fetch (1 query, not N)
    const creatorIds = [...new Set(projects.map(p => p.createdBy?.toString()).filter(Boolean))].map(id => new ObjectId(id));
    const users = await db.collection('users')
      .find({ _id: { $in: creatorIds } }, { projection: { _id: 1, username: 1 } })
      .toArray();

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.username]));

    const formattedProjects: BaseProject[] = projects.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      status: p.status,
      progress: p.progress,
      description: p.description,
      createdBy: userMap[p.createdBy?.toString()] || 'system',
      taskStats: p.taskStats,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      status: 'success', 
      projects: formattedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProjects / limit),
        totalProjects,
        hasNext: skip + limit < totalProjects,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch projects:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch projects' }, { status: 500 });
  }
}

// ✅ POST — Avoid extra DB read (faster) - No changes needed
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, status = 'planning' } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ status: 'error', message: 'Project name is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const now = new Date();

    // ✅ Fast slug uniqueness: get count instead of regex
    const baseSlug = slugify(name);
    const slugCount = await db.collection('projects').countDocuments({ slug: { $regex: `^${baseSlug}` } });
    const uniqueSlug = slugCount === 0 ? baseSlug : `${baseSlug}-${slugCount + 1}`;

    const newProject = {
      name: name.trim(),
      slug: uniqueSlug,
      description: description?.trim() || '',
      status,
      progress: 0,
      taskStats: { total: 0, completed: 0, incomplete: 0 },
      createdBy: new ObjectId(currentUser._id),
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('projects').insertOne(newProject);

    // ✅ No need for aggregation refetch — we already know all fields
    const formattedProject: BaseProject = {
      _id: result.insertedId.toString(),
      ...newProject,
      createdBy: currentUser.username || 'system',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    return NextResponse.json({ status: 'success', project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to create project:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create project' }, { status: 500 });
  }
}