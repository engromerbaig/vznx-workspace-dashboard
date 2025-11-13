// app/layout.tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ClientLayout from '@/components/ClientLayout';
import Footer from '@/components/Footer';
import { UserProvider } from '@/context/UserContext';
import ToastProvider from '@/components/ToastProvider';
import AuthProviderWrapper from '@/components/AuthProviderWrapper';
import { LogoutProvider } from '@/context/LogoutContext';
import GlobalLogoutLoader from '@/components/GlobalLogoutLoader';
import { TeamProvider } from '@/context/TeamContext'; // ← ADD THIS

// Initialize Poppins font
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'VZNX Workspace Dashboard',
  description:
    'A clean and minimal project management dashboard built for the VZNX Developer Technical Challenge — featuring project tracking, task management, and team overview functionality.',
  keywords:
    'VZNX, project management, task tracking, team dashboard, workspace, Next.js, developer challenge',
  authors: [{ name: 'Muhammad Omer Baig' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased flex flex-col min-h-screen`}>
        <UserProvider>
          <LogoutProvider>
            <AuthProviderWrapper>
              <GlobalLogoutLoader />

              {/* Wrap TeamProvider here so all children can use useTeam() */}
              <TeamProvider>
                <Navbar />
                <ClientLayout>
                  <ToastProvider />
                  {children}
                </ClientLayout>
              </TeamProvider>
            </AuthProviderWrapper>
          </LogoutProvider>
        </UserProvider>
      </body>
    </html>
  );
}