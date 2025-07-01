'use client';

import { useTransition, useState, useEffect } from 'react';
import { adminLogout } from '@/app/actions';
import type { Submission } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';


interface AdminPanelProps {
  initialSubmissions: Submission[];
  fetchError?: string | null;
}

export default function AdminPanel({ initialSubmissions, fetchError }: AdminPanelProps) {
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = () => {
    startLogoutTransition(async () => {
        await adminLogout();
        toast({ title: 'Logged out successfully.'});
    });
  };

  const isActionPending = isLoggingOut;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Trip Submissions</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/csv"
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </a>
          <Button type="button" variant="destructive" onClick={handleLogout} disabled={isActionPending}>
              {isActionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />} Logout
          </Button>
        </div>
      </div>
      
      {fetchError && (
        <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Fetching Submissions</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Timestamp</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Unique ID</TableHead>
              <TableHead className="text-right">Signature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSubmissions.length > 0 ? (
              initialSubmissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{isClient ? new Date(sub.timestamp).toLocaleString() : ''}</TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{sub.uniqueId}</TableCell>
                  <TableCell className="text-right">
                    <Image
                        src={sub.signature}
                        alt={`Signature of ${sub.name}`}
                        width={120}
                        height={60}
                        className="inline-block bg-white p-1 rounded border object-contain"
                        data-ai-hint="signature drawing"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
                !fetchError && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No submissions yet.</TableCell>
                    </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
