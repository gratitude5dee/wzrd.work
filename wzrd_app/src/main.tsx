
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react' // Added explicit React import

// Create the root with strict mode for proper hook behavior
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
