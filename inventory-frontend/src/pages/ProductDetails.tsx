import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '@/api/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { id } = useParams<{ id: string }>();
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
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-background border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Product Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The product you’re looking for doesn’t exist.</p>
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-background border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full max-w-xs h-auto rounded-lg object-cover border border-border"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Name</h2>
                <p className="text-muted-foreground">{product.name}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Price</h2>
                <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Stock</h2>
                <p className="text-muted-foreground">{product.stock}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Category</h2>
                <p className="text-muted-foreground">{product.category}</p>
              </div>
            </div>
          </div>
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