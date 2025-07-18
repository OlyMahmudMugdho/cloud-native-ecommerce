import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCart, updateCart, deleteCart, checkout } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

export const Cart = () => {
  const { isAuthenticated, login } = useKeycloak();
  const [alert, setAlert] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const { data, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: updateCart,
    onSuccess: () => {
      console.log("Cart updated successfully");
      refetch();
      setAlert({
        title: "Success",
        description: "Cart updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to update cart",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      console.log("Cart deleted successfully");
      refetch();
      setAlert({
        title: "Success",
        description: "Cart cleared successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (data) => {
      console.log("Checkout successful:", data.data);
      setAlert({
        title: "Success",
        description: "Redirecting to checkout...",
      });
      window.location.href = data.data.sessionUrl;
    },
    onError: (error: any) => {
      console.error("Checkout failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setAlert({
        title: "Error",
        description: error.response?.data?.message || "Checkout failed",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div>
        Please <Button onClick={login}>login</Button> to view your cart.
      </div>
    );
  }

  if (!data?.data) return <div>No items in cart.</div>;

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      setAlert({
        title: "Error",
        description: "Quantity cannot be less than 1",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      id: data.data.id,
      userId: keycloak.subject,
      items: [{ productId, quantity }],
    };
    console.log("Update cart payload:", payload);
    updateMutation.mutate(payload);
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
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {data.data.items.map((item: any) => (
            <div key={item.productId} className="flex justify-between mb-2">
              <span>Product ID: {item.productId}</span>
              <div>
                <Button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                  size="sm"
                >
                  +
                </Button>
                <span className="mx-2">{item.quantity}</span>
                <Button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  size="sm"
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
              </div>
            </div>
          ))}
          <Button
            onClick={() => {
              console.log("Attempting to delete cart");
              deleteMutation.mutate();
            }}
            variant="destructive"
          >
            Clear Cart
          </Button>
          <Button
            onClick={() => {
              console.log("Attempting checkout");
              checkoutMutation.mutate();
            }}
            className="ml-2"
          >
            Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};