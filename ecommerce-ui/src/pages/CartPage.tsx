import { Cart } from "../components/Cart";

export const CartPage = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <Cart />
    </div>
  );
};