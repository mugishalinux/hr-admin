// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./App";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { AuthProvider } from "react-auth-kit";

// ReactDOM.render(
//   <React.StrictMode>
//     <AuthProvider
//       authType={"cookie"}
//       authName={"_auth"}
//       cookieDomain={window.location.hostname}
//       cookieSecure={false}
//     >
//       <DarkModeContextProvider>
//         <App />
//       </DarkModeContextProvider>
//     </AuthProvider>
//   </React.StrictMode>,
//   document.getElementById("root")
// );




import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";


const Root = () => {
 const [msalInstance, setMsalInstance] = useState(null);


 // Initialize MSAL instance asynchronously
 useEffect(() => {
   const initMsal = async () => {
     try {
       const instance = new PublicClientApplication(msalConfig);


       // Ensure initialization is complete before setting the instance
       await instance.initialize();
       setMsalInstance(instance);
     } catch (error) {
       console.error("Error initializing MSAL instance:", error);
     }
   };


   initMsal();
 }, []);


 // Wait until MSAL is initialized before rendering the app
 if (!msalInstance) {
   return <div>Loading...</div>;
 }


 return (
   <MsalProvider instance={msalInstance}>
     <React.StrictMode>
    <AuthProvider
      authType={"cookie"}
      authName={"_auth"}
      cookieDomain={window.location.hostname}
      cookieSecure={false}
    >
      <DarkModeContextProvider>
        <App />
      </DarkModeContextProvider>
    </AuthProvider>
  </React.StrictMode>
   </MsalProvider>
 );
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
