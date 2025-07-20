import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL, // Replace with your Keycloak server URL
  realm: import.meta.env.VITE_REALM,
  clientId: import.meta.env.VITE_CLIENT_ID,
});

let isInitialized = false;

export const initKeycloak = async () => {
  if (isInitialized) {
    return keycloak;
  }
  try {
    await keycloak.init({
      onLoad: "check-sso", // Use check-sso to avoid forcing login
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
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