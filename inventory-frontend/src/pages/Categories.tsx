import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { categories } from '@/api/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Categories() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categories.getAll();
        setCategoryList(response.data || []);
      } catch (error) {
        toast.error('Failed to fetch categories');
        setCategoryList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories(); // Public access, no auth check
  }, []); // No dependencies, runs on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to save a category');
        return;
      }

      if (selectedCategory) {
        if (!isAdmin) {
          toast.error('Only admins can update categories');
          return;
        }
        await categories.update(selectedCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categories.create(formData);
        toast.success('Category created successfully');
      }

      setIsDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });

      const response = await categories.getAll();
      setCategoryList(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can perform this action');
      } else {
        toast.error('Failed to save category');
      }
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isAdmin) {
        toast.error('Only admins can delete categories');
        return;
      }
      await categories.delete(id);
      toast.success('Category deleted successfully');
      const response = await categories.getAll();
      setCategoryList(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can delete categories');
      } else {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleEdit = (category: Category) => {
    if (!isAdmin) {
      toast.error('Only admins can edit categories');
      return;
    }
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  {selectedCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {categoryList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No categories found.{' '}
          {isAuthenticated && 'Click "Add Category" to create one.'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryList.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link to={`/categories/${category.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isAuthenticated && isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this category? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleDelete(category.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}