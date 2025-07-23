import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { auth } from '@/api/api';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async ({ email, password }: { email: string; password: string }) => {
    try {
      await auth.register(email, password);
      toast.success('Registration successful! Please check your email for your OTP.');
      navigate('/verify');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4">
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        title="Create an Account"
      />
    </div>
  );
}