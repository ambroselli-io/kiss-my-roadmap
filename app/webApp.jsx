import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider, useRouteError } from "react-router-dom";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";
import Projects, { loader as projectsLoader, action as projectsAction } from "./routes/_index";
import Project, { loader as projectLoader, action as projectAction } from "./routes/project.$projectId";

function webLoader() {
  return { forWeb: true };
}

function Root() {
  return (
    <>
      <Outlet />
      {import.meta.env.PROD === "production" && (
        <>
          <script defer data-domain="froadmap.com" src="https://plausible.io/js/script.js"></script>
        </>
      )}
    </>
  );
}

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: webLoader,
    children: [
      {
        element: <Projects />,
        loader: projectsLoader,
        action: projectsAction,
        index: true,
        errorElement: <ErrorPage />,
      },
      {
        path: "project/:projectId",
        element: <Project />,
        loader: projectLoader,
        action: projectAction,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
