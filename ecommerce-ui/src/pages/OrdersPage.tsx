import { Orders } from "../components/Orders";

export const OrdersPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Orders</h1>
      <Orders />
    </div>
  );
};