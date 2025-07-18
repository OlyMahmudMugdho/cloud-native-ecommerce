import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8088", // Replace with your Keycloak server URL
  realm: "cloud-native-ecommerce",
  clientId: "react-app",
});

let isInitialized = false;

export const initKeycloak = async () => {
  if (isInitialized) {
    return keycloak;
  }
  try {
    await keycloak.init({
      onLoad: "check-sso", // Use check-sso to avoid forcing login
      checkLoginIframe: false, // Disable iframe check for compatibility
    });
    isInitialized = true;
    // Handle token refresh
    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            console.log("Token refreshed");
          }
        })
        .catch((error) => {
          console.error("Failed to refresh token", error);
        });
    };
  } catch (error) {
    console.error("Keycloak init failed", error);
    isInitialized = false;
  }
  return keycloak;
};

export const getKeycloak = () => keycloak;

export default keycloak;