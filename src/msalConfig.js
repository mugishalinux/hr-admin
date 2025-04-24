// src/msalConfig.js
export const msalConfig = {
    auth: {
      clientId: "961d5f0e-f6cb-4f3c-a98d-d31acfc32fd7",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: "http://localhost:3000",
    },
    cache: {
      cacheLocation: "localStorage", // enables token storage
      storeAuthStateInCookie: false,
    },
  };
   export const loginRequest = {
    scopes: ["User.Read"], // includes profile & photo access
  };
   export const graphConfig = {
    photoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value",
    profileEndpoint: "https://graph.microsoft.com/v1.0/me",
  };
 