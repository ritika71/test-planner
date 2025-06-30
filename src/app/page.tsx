import { SignForm } from '@/components/sign-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full w-fit">
            <Plane className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-3xl font-headline">Trip Sign-up: Surat Getaway</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Planning a trip out of Surat! Colleagues who agree to join, please fill this form to confirm your spot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignForm />
        </CardContent>
      </Card>
    </main>
  );
}
