import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardScreenProps {
  activityFeedEnabled: boolean;
  state: "default" | "empty" | "loading";
}

export function DashboardScreen({ activityFeedEnabled, state }: DashboardScreenProps) {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Live activity feed</span>
            <div
              role="switch"
              aria-checked={activityFeedEnabled}
              className={`h-5 w-9 cursor-pointer rounded-full transition-colors ${
                activityFeedEnabled ? "bg-primary" : "bg-input"
              }`}
            >
              <div
                className={`h-4 w-4 translate-y-0.5 rounded-full bg-background shadow transition-transform ${
                  activityFeedEnabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>
          <p data-mask="last-synced" className="mt-4 text-xs text-muted-foreground">
            Last synced just now
          </p>
          {state === "empty" ? <p className="mt-6 text-sm">No activity yet.</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
