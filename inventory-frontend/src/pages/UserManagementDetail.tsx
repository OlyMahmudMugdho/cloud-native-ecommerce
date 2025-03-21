import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export default function UserManagementDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isAdmin } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await users.getOne(id!);
        setUser(response.data);
      } catch (error) {
        toast.error('Failed to load user details');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, isAdmin]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Please Login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to login to view user details.</p>
            <Link to="/login">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Only admins can view user details.</p>
            <Link to="/products">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Back to Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The user you’re looking for doesn’t exist.</p>
            <Link to="/user-management">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Back to User Management
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Email</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Role</h2>
            <p className="text-muted-foreground">{user.role}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Verified</h2>
            <p className="text-muted-foreground">{user.is_verified ? 'Yes' : 'No'}</p>
          </div>
          <Link to="/user-management">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Back to User Management
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}