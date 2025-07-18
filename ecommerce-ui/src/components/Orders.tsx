import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useKeycloak } from "../lib/KeycloakContext";
import { Button } from "./ui/button";

export const Orders = () => {
  const { isAuthenticated, login } = useKeycloak();
  const { data } = useQuery({ queryKey: ["orders"], queryFn: getOrders, enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div>
        Please <Button onClick={login}>login</Button> to view your orders.
      </div>
    );
  }

  if (!data?.data) return <div>No orders found.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      {data.data.map((order: any) => (
        <Card key={order.id} className="mb-4">
          <CardHeader>
            <CardTitle>Order #{order.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Status: {order.status}</p>
            <p>Total: ${order.totalAmount}</p>
            <p>Items:</p>
            <ul>
              {order.items.map((item: any) => (
                <li key={item.productId}>
                  Product ID: {item.productId}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};