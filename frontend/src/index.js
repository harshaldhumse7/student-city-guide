import React from "react";
import ReactDOM from "react-dom/client";

// Import Tailwind and global styles first
import "./styles/index.css";      // Tailwind CSS and base styles
import "./styles/styles.css";     // Custom component-specific styles

import App from "./App";

// Create root and render App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
