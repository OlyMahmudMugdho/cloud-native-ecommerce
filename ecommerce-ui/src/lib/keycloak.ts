import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://lemur-15.cloud-iam.com/auth",
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
      onLoad: "check-sso",
      checkLoginIframe: false,
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