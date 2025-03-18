import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { auth } from '@/api/api';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async ({ email, password }: { email: string; password: string }) => {
    await auth.register(email, password);
    toast.success('Registration successful! Please check your email for verification.');
    navigate('/login');
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