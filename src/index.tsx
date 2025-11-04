// src/main.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext"; // Your unified context
// import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
// import React from "react";
import { KeycloakSecurityProvider } from "./models/auth/KeycloakSecurityProvider";

// const eventLogger = (event: unknown, error: unknown) => {
//   console.log("Keycloak event:", event, error);
// };
const keycloak = new Keycloak({
  url: "http://localhost:8081",
  realm: "sda_acm",
  clientId: "sda_acm_client",
});


ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  /* <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      }}
      onEvent={eventLogger}
    >*/

  // {/* </ReactKeycloakProvider> */ }
  //  {/* </React.StrictMode>,  */ }

  <KeycloakSecurityProvider keycloak={keycloak} >
    <AuthProvider>
      <App />
    </AuthProvider>
  </KeycloakSecurityProvider >
);
