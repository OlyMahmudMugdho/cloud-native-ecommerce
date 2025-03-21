import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>(); // Get the product ID from the URL
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await products.getOne(id!);
        setProduct(response.data);
      } catch (error) {
        toast.error('Failed to load product details');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Product Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Name</h2>
          <p>{product.name}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <p>{product.description}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Price</h2>
          <p>${product.price.toFixed(2)}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Stock</h2>
          <p>{product.stock}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Category</h2>
          <p>{product.category}</p>
        </div>
        {product.image_url && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Image</h2>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-64 h-64 object-cover rounded"
            />
          </div>
        )}
        <Link to="/products">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Back to Products
          </Button>
        </Link>
      </div>
    </div>
  );
}