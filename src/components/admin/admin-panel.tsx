'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, downloadCsv } from '@/app/actions';
import type { Submission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface AdminPanelProps {
  initialSubmissions: Submission[];
}

export default function AdminPanel({ initialSubmissions }: AdminPanelProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDownload = async () => {
    try {
      const csvData = await downloadCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `signease-submissions-${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Success', description: 'CSV download started.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', 'description': 'Failed to download CSV.' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Submissions</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download CSV</Button>
          <form action={adminLogout}>
            <Button variant="destructive"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </form>
        </div>
      </div>
      
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
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No submissions yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
