import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { categories } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoryNew() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to add a category');
        return;
      }
      if (!isAdmin) {
        toast.error('Only admins can add categories');
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
      };

      await categories.create(categoryData);
      toast.success('Category added successfully');
      navigate('/categories');
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can add categories');
      } else {
        toast.error('Failed to add category');
      }
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in</h1>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin access required</h1>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link to="/categories">Back to Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Add New Category</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex space-x-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white flex-1">
              Add Category
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/categories">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}