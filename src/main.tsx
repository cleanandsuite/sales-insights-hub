import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { installAutoRefreshGuard } from "./lib/autoRefreshGuard";

// Ensure auto-refresh cannot re-enable itself and cause refresh-token storms
installAutoRefreshGuard();

createRoot(document.getElementById("root")!).render(
  <App />
);