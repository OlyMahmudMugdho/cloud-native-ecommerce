import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { products, categories } from '@/api/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Products() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null as File | null,
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          products.getAll(),
          categories.getAll(),
        ]);
        setProductList(productsResponse.data || []);
        setCategoryList(categoriesResponse.data || []);
      } catch (error) {
        toast.error('Failed to load data');
        setProductList([]);
        setCategoryList([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData(); // Fetch data regardless of authentication status
  }, []); // No dependencies, runs on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to save a product');
        return;
      }

      if (isNaN(parseFloat(formData.price)) || isNaN(parseInt(formData.stock, 10))) {
        toast.error('Price and stock must be valid numbers');
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category,
      };

      const formDataToSend = new FormData();
      formDataToSend.append('product', JSON.stringify(productData));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (selectedProduct) {
        if (!isAdmin) {
          toast.error('Only admins can update products');
          return;
        }
        await products.update(selectedProduct.id, formDataToSend);
        toast.success('Product updated successfully');
      } else {
        if (!formData.image) {
          toast.error('Image is required for new products');
          return;
        }
        await products.create(formDataToSend);
        toast.success('Product created successfully');
      }

      setIsDialogOpen(false);
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null,
      });

      const response = await products.getAll();
      setProductList(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can perform this action');
      } else {
        toast.error('Failed to save product');
      }
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isAdmin) {
        toast.error('Only admins can delete products');
        return;
      }
      await products.delete(id);
      toast.success('Product deleted successfully');
      const response = await products.getAll();
      setProductList(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can delete products');
      } else {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    if (!isAdmin) {
      toast.error('Only admins can edit products');
      return;
    }
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: null,
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
        <h1 className="text-2xl font-bold">Products</h1>
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
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
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleSelectChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    required={!selectedProduct} // Image optional for updates
                  />
                  {selectedProduct && selectedProduct.image_url && (
                    <div>
                      <Label>Current Image</Label>
                      <img
                        src={selectedProduct.image_url}
                        alt="Current product image"
                        className="w-32 h-32 object-cover mt-2"
                      />
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  {selectedProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {productList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products found.{' '}
          {isAuthenticated && 'Click "Add Product" to create one.'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                {isAuthenticated && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  {isAuthenticated && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(product)}
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
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this product? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => handleDelete(product.id)}
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
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}