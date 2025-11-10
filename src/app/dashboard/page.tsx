// app/dashboard/page.tsx
import type { Metadata } from 'next';
import DashboardPageClient from './DashboardPageClient';

export const metadata: Metadata = {
  title: 'Dashboard - VZNX Workspace',
  description:
    'Dashboard overview for VZNX Workspace: project stats, team workload, and task management.',
  keywords: 'VZNX, dashboard, projects, tasks, team, workspace',
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
