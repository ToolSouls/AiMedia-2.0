import { ConfirmationHost } from "@/components/shared/controls";
import { Toaster } from "@/components/ui/sonner";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./ui.css";
import "./workspace.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster richColors position="top-right" />
    <ConfirmationHost />
  </>,
);
