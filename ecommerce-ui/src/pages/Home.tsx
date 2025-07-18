import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export const Home = () => {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: getProducts });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.data.products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};