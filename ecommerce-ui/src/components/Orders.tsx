import { useQuery, useQueries } from "@tanstack/react-query";
import { getOrders, getProduct } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useKeycloak } from "../lib/KeycloakContext";
import { Button } from "./ui/button";

export const Orders = () => {
  const { isAuthenticated, login } = useKeycloak();

  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isAuthenticated,
  });

  // Collect all productIds from all orders' items (flatten)
  const productIds = data?.data
    ? Array.from(
        new Set(
          data.data.flatMap((order: any) =>
            order.items.map((item: any) => item.productId)
          )
        )
      )
    : [];

  // Fetch product details for all productIds
  const productQueries = useQueries({
    queries: productIds.map((productId: string) => ({
      queryKey: ["product", productId],
      queryFn: () => getProduct(productId),
      enabled: !!productId,
    })),
  });

  // Create a map from productId to product data for quick lookup
  const productMap = new Map(
    productQueries
      .filter((q) => q.data?.data)
      .map((q) => [q.data!.data.id, q.data!.data])
  );

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
              {order.items.map((item: any) => {
                const product = productMap.get(item.productId);
                return (
                  <li key={item.productId}>
                    Product:{" "}
                    {product
                      ? product.name
                      : `Loading name for ${item.productId}...`}{" "}
                    (ID: {item.productId}), Quantity: {item.quantity}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
