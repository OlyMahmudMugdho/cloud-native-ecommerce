import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface AuthFormProps {
  mode: 'login' | 'register' | 'reset';
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  title: string;
}

export function AuthForm({ mode, onSubmit, title }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } catch (error: any) {
      toast.error(error.response?.data || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-background border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="bg-background text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      className="bg-background text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Reset Password'}
              </Button>
              {mode === 'login' && (
                <div className="text-center space-y-2">
                  <Button
                    variant="link"
                    className="text-sm text-blue-500 hover:text-blue-600"
                    onClick={() => navigate('/register')}
                  >
                    Don't have an account? Sign Up
                  </Button>
                  <Button
                    variant="link"
                    className="text-sm text-blue-500 hover:text-blue-600 block mx-auto"
                    onClick={() => navigate('/reset-password')}
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
              {mode === 'register' && (
                <Button
                  variant="link"
                  className="text-sm text-blue-500 hover:text-blue-600 w-full"
                  onClick={() => navigate('/login')}
                >
                  Already have an account? Sign In
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}