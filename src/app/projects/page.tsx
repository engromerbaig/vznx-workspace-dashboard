// app/projects/page.tsx
import type { Metadata } from 'next';
import ProjectsPageClient from './ProjectsPageClient';

export const metadata: Metadata = {
  title: 'Projects - VZNX Workspace',
  description:
    'Manage and track all projects in VZNX Workspace: create, update, and overview project stats.',
  keywords: 'VZNX, projects, project management, dashboard, tasks, team',
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
