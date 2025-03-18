import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '@/api/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (token) {
          await auth.verifyEmail(token);
          setStatus('success');
          toast.success('Email verified successfully');
        }
      } catch (error) {
        setStatus('error');
        toast.error('Failed to verify email');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="container max-w-lg mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-lg text-center">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg text-center">Your email has been verified!</p>
              <Button onClick={() => navigate('/login')}>
                Continue to Login
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-lg text-center">
                Failed to verify your email. The link may be invalid or expired.
              </p>
              <Button onClick={() => navigate('/register')}>
                Back to Registration
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}