
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Wait for fonts before rendering to prevent layout shift
document.fonts.ready.then(() => {
  const root = document.getElementById("root")!;
  root.style.visibility = "visible";
  createRoot(root).render(<App />);
});

// Hide root until ready (set inline so it applies before any CSS)
const root = document.getElementById("root")!;
root.style.visibility = "hidden";
