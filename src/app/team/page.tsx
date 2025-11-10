// app/team/page.tsx
import type { Metadata } from 'next';
import TeamPageClient from './TeamPageClient';

export const metadata: Metadata = {
  title: 'Team - VZNX Workspace',
  description:
    'Manage your team in VZNX Workspace: view workload, add or remove members, and track team stats.',
  keywords: 'VZNX, team, workload, project management, dashboard',
};

export default function TeamPage() {
  return <TeamPageClient />;
}
