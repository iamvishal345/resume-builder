import { RouterProvider } from "react-router-dom";
import { router } from "./routes/root";
import "./App.css";
import ErrorBoundary from "./routes/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} fallbackElement={<div>loading...</div>} />
    </ErrorBoundary>
  );
}

export default App;

/**
 * Flow
 * Choose a theme
 * Keep showing previews with all the forms (horizontal stepper)
 *
 */
