import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryDetails() {
  const { id } = useParams<{ id: string }>();
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
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Category Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The category you’re looking for doesn’t exist.</p>
            <Link to="/categories">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Back to Categories
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
          <CardTitle className="text-2xl text-foreground">Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Name</h2>
            <p className="text-muted-foreground">{category.name}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Description</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <Link to="/categories">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Back to Categories
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}