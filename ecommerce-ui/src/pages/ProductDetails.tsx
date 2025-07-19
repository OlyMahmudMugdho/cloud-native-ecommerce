import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { getProduct, getCart } from "../lib/api";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { AddToCartButton } from "../components/AddToCartButton";

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
  // const { isAuthenticated, login } = useKeycloak();
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error || !data?.data) return <div>Error loading product details</div>;

  const product: Product = data.data;

  return (
    <div className="relative container mx-auto p-4 min-h-screen">
      {alert && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 max-w-xl mx-auto">
          <Alert variant={alert.variant || "default"}>
            {alert.variant === "destructive" ? <AlertCircleIcon /> : <CheckCircle2Icon />}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        </div>
      )}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full md:w-1/2 h-64 object-cover rounded-md"
          />
          <div className="flex-1">
            <p className="text-lg font-semibold">Price: ${product.price}</p>
            <p className="mt-2"><strong>Description:</strong> {product.description}</p>
            <p className="mt-2"><strong>Category:</strong> {product.category}</p>
            <p className="mt-2"><strong>Stock:</strong> {product.stock}</p>
            <p className="mt-2"><strong>ID:</strong> {product.id}</p>
            <AddToCartButton productId={product.id} disabled={product.stock === 0} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};