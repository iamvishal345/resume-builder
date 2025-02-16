import React from "react";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import ReactDOM from "react-dom/client";
import App from "./App";

// Styles
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline>
        <App />
      </CssBaseline>
    </GeistProvider>
  </React.StrictMode>
);
