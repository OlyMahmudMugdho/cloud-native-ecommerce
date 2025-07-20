import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { KeycloakProvider } from "./lib/KeycloakContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <KeycloakProvider>
    <App />
  </KeycloakProvider>
);