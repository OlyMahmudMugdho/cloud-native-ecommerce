import axios from "axios";
import keycloak from "./keycloak";

// Fallback base URLs
const FALLBACK_PRODUCT_BASE_URL = "http://localhost:8081";
const FALLBACK_ORDER_BASE_URL = "http://localhost:8082";

interface ConfigResponse {
  productApiUrl?: string;
  orderApiUrl?: string;
}

let productBaseUrl = FALLBACK_PRODUCT_BASE_URL;
let orderBaseUrl = FALLBACK_ORDER_BASE_URL;

// Function to fetch config from /config endpoint
async function fetchConfig() {
  try {
    const response = await axios.get<ConfigResponse>("/config");
    const config = response.data;
    if (config.productApiUrl) productBaseUrl = config.productApiUrl;
    if (config.orderApiUrl) orderBaseUrl = config.orderApiUrl;
  } catch (error) {
    console.log("Failed to load config from /config, using fallback URLs");
  }
}

// Immediately invoke fetchConfig, but don't wait to export API instances (so code below will use updated URLs once fetched)
fetchConfig();

// Axios instances initialized with current URLs (will be fallback initially, but fetchConfig can update variables later)
const publicApi = axios.create({
  baseURL: productBaseUrl,
});

const productApi = axios.create({
  baseURL: productBaseUrl,
});

const orderApi = axios.create({
  baseURL: orderBaseUrl,
});

// Add Keycloak token interceptor to productApi
productApi.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add Keycloak token interceptor to orderApi
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
