import { useQuery, useMutation } from "@tanstack/react-query";
import { getCart, updateCart, deleteCart, checkout } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { toast, Toaster } from "sonner"; // ✅ Import toast

export const Cart = () => {
  const { isAuthenticated, login } = useKeycloak();

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
      toast.success("Cart updated successfully"); // ✅ toast
    },
    onError: (error: any) => {
      console.error("Failed to update cart:", error);
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      console.log("Cart deleted successfully");
      refetch();
      toast.success("Cart cleared successfully");
    },
    onError: (error: any) => {
      console.error("Failed to delete cart:", error);
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (data) => {
      console.log("Checkout successful:", data.data);
      toast.success("Redirecting to checkout...");
      window.location.href = data.data.sessionUrl;
    },
    onError: (error: any) => {
      console.error("Checkout failed:", error);
      toast.error(error.response?.data?.message || "Checkout failed");
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
      toast.error("Quantity cannot be less than 1");
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
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {data.data.items.map((item: any) => (
            <div key={item.productId} className="flex justify-between mb-2">
              <span>Product Name: {item.productId}</span>
              <div>
                <Toaster richColors />
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
            onClick={() => deleteMutation.mutate()}
            variant="destructive"
          >
            Clear Cart
          </Button>
          <Button
            onClick={() => checkoutMutation.mutate()}
            className="ml-2"
          >
            Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
