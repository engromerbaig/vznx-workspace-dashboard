// app/api/projects/route.js
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { slugify, generateUniqueSlug } from '@/utils/slugify';

// Helper function to build filter query (shared across endpoints)
function buildProjectFilterQuery(searchParams) {
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  let filterQuery = {};

  // Status filter
  if (status !== 'all') {
    filterQuery.status = status;
  }

  // Search filter (name or description)
  if (search) {
    filterQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Date range filter on createdAt
  if (startDate || endDate) {
    filterQuery.createdAt = {};
    if (startDate) {
      filterQuery.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filterQuery.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  return filterQuery;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const sortBy = searchParams.get('sortBy') || 'recent';

    const db = await getDatabase();
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = buildProjectFilterQuery(searchParams);

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'name-asc':
        sortOptions = { name: 1 };
        break;
      case 'name-desc':
        sortOptions = { name: -1 };
        break;
      case 'progress-asc':
        sortOptions = { progress: 1 };
        break;
      case 'progress-desc':
        sortOptions = { progress: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get total count for pagination
    const totalProjects = await db.collection('projects').countDocuments(filterQuery);

    // Fetch projects with filters, sorting, and pagination
    const projects = await db
      .collection('projects')
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      status: 'success',
      projects: projects.map(project => ({
        ...project,
        _id: project._id.toString()
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProjects / limit),
        totalProjects,
        hasMore: skip + projects.length < totalProjects
      }
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { status: 'error', message: 'Project name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Generate base slug from project name
    const baseSlug = slugify(name);

    // Find all existing slugs that start with the base slug
    const existingProjects = await db
      .collection('projects')
      .find({ slug: { $regex: `^${baseSlug}` } })
      .project({ slug: 1 })
      .toArray();

    const existingSlugs = existingProjects.map(p => p.slug);

    // Generate a unique slug
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    const newProject = {
      name: name.trim(),
      slug: uniqueSlug,
      description: description || '',
      status: 'planning',
      progress: 0,
      taskStats: {
        total: 0,
        completed: 0,
        incomplete: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('projects').insertOne(newProject);

    return NextResponse.json({
      status: 'success',
      project: {
        ...newProject,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create project' },
      { status: 500 }
    );
  }
}