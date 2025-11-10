// src/app/projects/[slug]/page.tsx
import type { Metadata } from 'next';
import ProjectDetailsPageClient from './ProjectDetailsPageClient';
import { getDatabase } from '@/lib/mongodb';
import { BaseProject } from '@/types/project';

interface PageProps {
  params: { slug: string };
}

// Fetch project from DB
async function getProject(slug: string): Promise<BaseProject | null> {
  const db = await getDatabase();
  const project = await db.collection('projects').findOne({ slug });
  if (!project) return null;

  // Convert Mongo _id and dates
  return {
    ...project,
    _id: project._id.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  } as BaseProject;
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: 'Project Not Found - VZNX Workspace',
      description: 'The project you are looking for does not exist.',
    };
  }

  return {
    title: `${project.name} - Project | VZNX Workspace`,
    description: project.description || `View project ${project.name}, track tasks, progress, and status.`,
    keywords: `VZNX, project, ${project.name}, tasks, progress, ${project.status}`,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  return <ProjectDetailsPageClient slug={params.slug} />;
}
