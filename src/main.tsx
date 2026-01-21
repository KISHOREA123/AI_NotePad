import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import test utility for development
import "./utils/testAI.ts";

createRoot(document.getElementById("root")!).render(<App />);
