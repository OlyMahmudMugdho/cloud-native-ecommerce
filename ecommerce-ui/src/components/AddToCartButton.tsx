import React from "react";
import { Button } from "../components/ui/button";
import { addToCart, getCart } from "../lib/api";
import { useKeycloak } from "../lib/KeycloakContext";
import keycloak from "../lib/keycloak";
import { toast, Toaster } from "sonner"; // ✅ Sonner toast

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, disabled }) => {
  const { isAuthenticated, login } = useKeycloak();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add this product to your cart.");
      return;
    }

    try {
      let cartId;
      try {
        const cartResponse = await getCart();
        cartId = cartResponse.data?.id;
      } catch {
        console.log("No existing cart found, creating new one");
      }

      const payload = {
        ...(cartId && { id: cartId }),
        userId: keycloak.subject,
        items: [{ productId, quantity: 1 }],
      };

      await addToCart(payload);
      toast.success("Product added to cart!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div>
      <Toaster richColors />
      <Button onClick={handleAddToCart} disabled={disabled}>
        {isAuthenticated ? "Add to Cart" : "Login to add to cart"}
      </Button>
    </div>
  );
};
