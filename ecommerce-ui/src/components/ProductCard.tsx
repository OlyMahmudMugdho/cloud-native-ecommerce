import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { addToCart, getCart } from "../lib/api";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isAuthenticated, login } = useKeycloak();
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    try {
      let cartId;
      try {
        const cartResponse = await getCart();
        cartId = cartResponse.data?.id;
      } catch (error) {
        console.log("No existing cart found, creating new one");
      }

      const payload = {
        ...(cartId && { id: cartId }),
        userId: keycloak.subject,
        items: [{ productId: product.id, quantity: 1 }],
      };

      console.log("Add to cart payload:", payload);
      const response = await addToCart(payload);
      console.log("Add to cart response:", response.data);
      setAlert({
        title: "Success",
        description: "Added to cart!",
      });
    } catch (error: any) {
      console.error("Failed to add to cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      {alert && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 max-w-xl mx-auto">
          <Alert variant={alert.variant || "default"}>
            {alert.variant === "destructive" ? <AlertCircleIcon /> : <CheckCircle2Icon />}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        </div>
      )}
      <Card className="w-64">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{product.description}</p>
          <p className="font-bold">${product.price}</p>
          <p>Stock: {product.stock}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddToCart}>Add to Cart</Button>
        </CardFooter>
      </Card>
    </div>
  );
};