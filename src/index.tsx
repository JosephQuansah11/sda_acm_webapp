// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext"; // Your unified context
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./models/auth/keycloak";

const eventLogger = (event: unknown, error: unknown) => {
  console.log("Keycloak event:", event, error);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "login-required", //check-sso
        // silentCheckSsoRedirectUri:
        //   window.location.origin + "/silent-check-sso.html",
        // pkceMethod: "S256",
      }}
      onEvent={eventLogger}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
);
