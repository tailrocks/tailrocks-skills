import { createFileRoute, notFound } from "@tanstack/react-router";

import { registry } from "@/design/registry";

export const Route = createFileRoute("/design/$screen/$state")({
  component: DesignScreen,
});

function DesignScreen() {
  const { screen, state } = Route.useParams();
  const entry = registry[screen as keyof typeof registry];
  if (!entry || !entry.states.includes(state)) throw notFound();
  const Component = entry.component;
  return <Component state={state} />;
}
