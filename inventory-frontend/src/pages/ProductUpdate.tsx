import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { products, categories } from '@/api/api';
import { toast } from 'sonner';
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
import { Loader2 } from 'lucide-react';

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

export default function ProductUpdate() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productResponse, categoriesResponse] = await Promise.all([
          products.getOne(id!),
          categories.getAll(),
        ]);
        const fetchedProduct = productResponse.data;
        if (!fetchedProduct) {
          toast.error('Product not found');
          navigate('/products');
          return;
        }
        setProduct(fetchedProduct);
        setCategoryList(categoriesResponse.data || []);
        setFormData({
          name: fetchedProduct.name,
          description: fetchedProduct.description,
          price: fetchedProduct.price.toString(),
          stock: fetchedProduct.stock.toString(),
          category: fetchedProduct.category,
          image: null,
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error('Failed to load product data');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
        toast.error('Please log in to update a product');
        return;
      }
      if (!isAdmin) {
        toast.error('Only admins can update products');
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

      await products.update(id!, formDataToSend);
      toast.success('Product updated successfully');
      navigate('/products');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can update products');
      } else {
        toast.error('Failed to update product');
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
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Product</h1>
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
            <Select value={formData.category} onValueChange={handleSelectChange} required>
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
            />
            {product.image_url && (
              <div>
                <Label>Current Image</Label>
                <img
                  src={product.image_url}
                  alt="Current product image"
                  className="w-32 h-32 object-cover mt-2 mx-auto"
                />
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white flex-1">
              Update Product
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}