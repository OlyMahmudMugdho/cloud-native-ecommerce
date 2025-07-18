import axios from "axios";
import keycloak from "./keycloak";

// Axios instance for product-related endpoints
const productApi = axios.create({
  baseURL: "http://localhost:8081",
});

// Axios instance for order-related endpoints
const orderApi = axios.create({
  baseURL: "http://localhost:8082",
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

// Product-related API calls
export const getProducts = () => productApi.get("/products/info");
export const getProduct = (id: string) => productApi.get(`/products/info/${id}`);
export const getCart = () => productApi.get("/products/cart");
export const addToCart = (cartData: any) => productApi.post("/products/cart", cartData);
export const updateCart = (cartData: any) => productApi.put("/products/cart", cartData);
export const deleteCart = () => productApi.delete("/products/cart");

// Order-related API calls
export const checkout = () => orderApi.post("/orders/checkout");
export const getOrders = () => orderApi.get("/orders");
export const getOrder = (id: string) => orderApi.get(`/orders/${id}`);

export { productApi, orderApi };