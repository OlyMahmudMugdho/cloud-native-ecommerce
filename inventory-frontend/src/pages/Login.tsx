import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { auth } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    const response = await auth.login(email, password);
    login(response.data.token);
    toast.success('Successfully logged in');
    navigate('/products');
  };

  return (
    <div className="container max-w-lg mx-auto px-4">
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        title="Welcome Back"
      />
    </div>
  );
}