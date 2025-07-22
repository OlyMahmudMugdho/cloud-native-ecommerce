import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export const Home = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    retry: 1, // Retry once
    retryDelay: 1000, // 1-second delay between retries
    staleTime: 0, // Ensure fresh data
  });

  // Debug query state
  console.log("Query state:", { isLoading, isError, data, error: error?.message });

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-left">Products</h1>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div>Loading products...</div>
        </div>
      ) : isError || !data?.data?.products || !Array.isArray(data.data.products) || data.data.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          {/* Log error details for debugging */}
          {console.error("Error details:", {
            error: error?.message,
            status: error?.response?.status,
            data,
          })}
          <p className="text-red-500 mb-4">
            {error?.response?.status === 504
              ? "Server timed out (Gateway Timeout). Please try again."
              : "Unable to load products. Please try again."}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries(["products"])}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {data.data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};