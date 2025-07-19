import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import {
  getCart,
  updateCart,
  deleteCart,
  checkout,
  getProduct,
} from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { toast, Toaster } from "sonner";

export const Cart = () => {
  const { isAuthenticated, login } = useKeycloak();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const cartItems = data?.data?.items || [];

  const productQueries = useQueries({
    queries: cartItems.map((item: any) => ({
      queryKey: ["product", item.productId],
      queryFn: () => getProduct(item.productId),
      enabled: !!item.productId,
    })),
  });

  const updateMutation = useMutation({
    mutationFn: updateCart,
    onSuccess: () => {
      refetch();
      toast.success("Cart updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      queryClient.setQueryData(["cart"], null);
      toast.success("Cart cleared successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.location.href = data.data.sessionUrl;
    },
    onError: (error: any) => {
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

  if (!data?.data || cartItems.length === 0) {
    return <div>No items in cart.</div>;
  }

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

    updateMutation.mutate(payload);
  };

  const total = cartItems.reduce((acc: number, item: any, index: number) => {
    const product = productQueries[index]?.data?.data;
    return product ? acc + product.price * item.quantity : acc;
  }, 0);

  return (
    <div>
      <Toaster richColors />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.map((item: any, index: number) => {
            const productData = productQueries[index]?.data?.data;
            const isLoading = productQueries[index]?.isLoading;

            if (isLoading) {
              return (
                <div key={item.productId} className="mb-4">
                  Loading product...
                </div>
              );
            }

            if (!productData) {
              return (
                <div key={item.productId} className="mb-4 text-red-500">
                  Failed to load product info
                </div>
              );
            }

            const subtotal = productData.price * item.quantity;

            return (
              <div
                key={item.productId}
                className="flex justify-between items-center mb-4 border-b pb-2"
              >
                <div>
                  <div className="font-semibold">{productData.name}</div>
                  <div className="text-sm text-gray-600">
                    Price: ${productData.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Subtotal: ${subtotal.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity + 1)
                    }
                    size="sm"
                  >
                    +
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity - 1)
                    }
                    size="sm"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="text-right font-bold text-lg mt-4">
            Total: ${total.toFixed(2)}
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button
              onClick={() => deleteMutation.mutate()}
              variant="destructive"
            >
              Clear Cart
            </Button>
            <Button onClick={() => checkoutMutation.mutate()}>Checkout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
