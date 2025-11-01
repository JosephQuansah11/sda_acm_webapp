import Keycloak from 'keycloak-js';

export interface LocationState {
  from?: string;
}

const keycloak = new Keycloak({
  url:  "http://localhost:8081",
  realm: "sda_acm",
  clientId: "sda_acm_client",
});

export default keycloak;
