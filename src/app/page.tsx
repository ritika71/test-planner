import { SignForm } from '@/components/sign-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full w-fit">
            <PartyPopper className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-3xl font-headline">Let's Get a 'Yes!' for a Company Trip!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Let's show the management team how much we want a company getaway! We're collecting signatures to propose an amazing team trip out of Surat. The more of us who sign, the stronger our request will be. Add your name below to show your support and help us get the green light!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground mb-6 space-y-2 text-base">
            <p>Imagine trading office chairs for open air ☀️ and team meetings for team adventures 🗺️.</p>
            <p>Your signature can help convince the management team! Let's do this! 💪</p>
          </div>
          <Separator className="mb-8" />
          <SignForm />
        </CardContent>
      </Card>
    </main>
  );
}
