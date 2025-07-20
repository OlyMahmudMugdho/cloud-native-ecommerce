import axios from "axios";
import keycloak from "./keycloak";

// Axios instance for public endpoints that don't require authentication
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
});

// Axios instance for product-related endpoints that require authentication
const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_API_URL,
});

// Axios instance for order-related endpoints
const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_API_URL,
});

// Add Keycloak token to productApi requests
productApi.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add Keycloak token to orderApi requests
orderApi.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public API calls (no authentication required)
export const getProducts = () => publicApi.get("/products/info");
export const getProduct = (id: string) => publicApi.get(`/products/info/${id}`);

// Protected API calls (authentication required)
export const getCart = () => productApi.get("/products/cart");
export const addToCart = (cartData: any) => productApi.post("/products/cart", cartData);
export const updateCart = (cartData: any) => productApi.put("/products/cart", cartData);
export const deleteCart = () => productApi.delete("/products/cart");

// Order-related API calls
export const checkout = () => orderApi.post("/orders/checkout");
export const getOrders = () => orderApi.get("/orders");
export const getOrder = (id: string) => orderApi.get(`/orders/${id}`);

export { productApi, orderApi, publicApi };