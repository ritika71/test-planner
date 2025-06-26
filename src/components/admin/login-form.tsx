'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { adminLoginSchema, type AdminLoginValues } from '@/lib/schemas';
import { adminLogin } from '@/app/actions';

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (values: AdminLoginValues) => {
    setIsSubmitting(true);
    try {
      const result = await adminLogin(values.password);
      if (result.success) {
        toast({ title: 'Login successful!' });
        // Instead of a soft refresh, we do a full page reload to ensure
        // the server re-evaluates the login status and sends the data.
        window.location.reload();
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: result.error,
        });
        setIsSubmitting(false); // Re-enable button on failure
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again later.',
      });
      setIsSubmitting(false); // Re-enable button on error
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
