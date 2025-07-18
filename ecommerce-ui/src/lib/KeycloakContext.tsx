import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak, { initKeycloak } from "./keycloak";

interface KeycloakContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initKeycloak().then(() => {
      setIsAuthenticated(keycloak.authenticated || false);
      // Update token periodically
      const interval = setInterval(() => {
        keycloak
          .updateToken(30)
          .then((refreshed) => {
            if (refreshed) {
              setIsAuthenticated(keycloak.authenticated || false);
            }
          })
          .catch(() => {
            setIsAuthenticated(false);
          });
      }, 10000);
      return () => clearInterval(interval);
    });
  }, []);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout();

  return (
    <KeycloakContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};