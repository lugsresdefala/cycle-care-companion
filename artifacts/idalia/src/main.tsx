import React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import { ClerkProvider } from "@clerk/clerk-react";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import App from "./App.tsx";
import "./index.css";

// Resolve the publishable key from the current host so the same build serves
// both the dev domain and the production custom domain. Falls back to the env
// var when the host doesn't map to a custom domain.
const PUBLISHABLE_KEY = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Empty in dev (Clerk talks to the dev FAPI directly), auto-populated in prod
// where Clerk must route through the /api/__clerk proxy. Must be passed
// unconditionally — gating it breaks the production proxy.
const CLERK_PROXY_URL = import.meta.env.VITE_CLERK_PROXY_URL;

if (!PUBLISHABLE_KEY) {
  console.error(
    "[idalia] VITE_CLERK_PUBLISHABLE_KEY is not set. Auth-gated features will not work.",
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-ignore */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} proxyUrl={CLERK_PROXY_URL}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
