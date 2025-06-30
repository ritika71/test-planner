import { SignForm } from '@/components/sign-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full w-fit">
            <PartyPopper className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-3xl font-headline">Adventure Awaits: Company Trip Sign-Up!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Get ready for an unforgettable adventure! We're planning an amazing company getaway from Surat to relax, recharge, and make some great memories together. If you're in for some fun, fill out the form below to secure your spot. Let's make this trip legendary!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignForm />
        </CardContent>
      </Card>
    </main>
  );
}
