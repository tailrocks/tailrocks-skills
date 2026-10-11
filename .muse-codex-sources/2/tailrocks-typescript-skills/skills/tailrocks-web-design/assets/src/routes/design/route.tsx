import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

// Design routes render only in dev or when the visual suite sets
// VITE_DESIGN_ROUTES=1 against a production build. Nothing else sets it.
export const Route = createFileRoute("/design")({
  beforeLoad: () => {
    if (!import.meta.env.DEV && import.meta.env.VITE_DESIGN_ROUTES !== "1") {
      throw notFound();
    }
  },
  component: () => <Outlet />,
});
