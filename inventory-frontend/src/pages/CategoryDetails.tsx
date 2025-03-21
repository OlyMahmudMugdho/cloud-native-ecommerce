import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryDetails() {
  const { id } = useParams<{ id: string }>(); // Get the category ID from the URL
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await categories.getOne(id!);
        setCategory(response.data);
      } catch (error) {
        toast.error('Failed to load category details');
        setCategory(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Link to="/categories">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Category Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Name</h2>
          <p>{category.name}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <p>{category.description}</p>
        </div>
        <Link to="/categories">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Back to Categories
          </Button>
        </Link>
      </div>
    </div>
  );
}