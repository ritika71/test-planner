import { cookies } from 'next/headers';
import AdminPanel from '@/components/admin/admin-panel';
import LoginForm from '@/components/admin/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { getAdminData } from '@/app/actions';
import type { Submission } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isLoggedIn = cookies().get('signease-admin-auth')?.value === 'true';

  let initialSubmissions: Submission[] = [];
  let fetchError: string | null = null;

  if (isLoggedIn) {
    try {
      initialSubmissions = await getAdminData();
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      fetchError = error instanceof Error ? error.message : "An unknown error occurred while fetching submissions.";
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      {isLoggedIn ? (
        <AdminPanel initialSubmissions={initialSubmissions} fetchError={fetchError} />
      ) : (
        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full w-fit">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 text-2xl font-headline">Admin Access</CardTitle>
              <CardDescription>
                Please enter the password to view submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
