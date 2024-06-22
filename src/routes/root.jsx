import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { EditorPageError } from "@pages/Editor";

export const router = createBrowserRouter([
  { path: "/", Component: React.lazy(() => import("@pages/HomePage")) },
  {
    path: "/editor",
    Component: React.lazy(() => import("@pages/Editor")),
    errorElement: <EditorPageError />,

    children: [
      {
        path: "personal-details",
        Component: React.lazy(() => import("@pages/Editor/PersonalDetails")),
      },
      {
        path: "work-history",
        Component: React.lazy(() => import("@pages/Editor/WorkHistory")),
      },
      {
        path: "education",
        Component: React.lazy(() => import("@pages/Editor/Education")),
      },
      {
        path: "skills",
        Component: React.lazy(() => import("@pages/Editor/Skills")),
      },
      {
        path: "summary",
        Component: React.lazy(() => import("@pages/Editor/Summary")),
      },
      {
        path: "additional-sections",
        Component: React.lazy(() => import("@pages/Editor/AdditionalSections")),
      },
    ],
  },
]);
