import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '@/api/api';
import { toast } from 'sonner';
import { AuthForm } from '@/components/AuthForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    try {
      setLoading(true);
      await auth.requestPasswordReset(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error('Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async ({ password }: { email: string; password: string }) => {
    if (token) {
      await auth.resetPassword(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    }
  };

  if (token) {
    return (
      <div className="container max-w-lg mx-auto px-4">
        <AuthForm
          mode="reset"
          onSubmit={handleReset}
          title="Reset Your Password"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleRequestReset}
              disabled={loading || !email}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Instructions
            </Button>
          </div>
          <Button
            variant="link"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}