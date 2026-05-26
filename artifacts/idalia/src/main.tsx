import React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!PUBLISHABLE_KEY) {
  console.error(
    "[idalia] VITE_CLERK_PUBLISHABLE_KEY is not set. Auth-gated features will not work.",
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-ignore */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY ?? "pk_test_placeholder"}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
