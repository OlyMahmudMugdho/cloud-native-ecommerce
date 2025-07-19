import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../lib/api";
import { AddToCartButton } from "../components/AddToCartButton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error || !data?.data) {
    toast.error("Failed to load product details");
    return <div className="p-4">Error loading product details</div>;
  }

  const product: Product = data.data;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover rounded-md"
            />
            <div className="flex flex-col gap-4">
              <p className="text-xl font-semibold text-green-600">${product.price}</p>
              <p><strong>Description:</strong> {product.description}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>ID:</strong> {product.id}</p>
              <AddToCartButton productId={product.id} disabled={product.stock === 0} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
