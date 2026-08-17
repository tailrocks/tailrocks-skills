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
          {/* Custom region: inline 24-point trend sparkline. Evaluated
              Badge, Progress, and the chart primitives — none renders an
              inline trend at text height; drawn with a plain SVG path. */}
          <svg className="mt-4 h-4 w-24" viewBox="0 0 96 16" aria-label="Activity trend">
            <path d="M0 12 L16 9 L32 11 L48 5 L64 7 L80 3 L96 4" fill="none" stroke="currentColor" />
          </svg>
          {state === "empty" ? <p className="mt-6 text-sm">No activity yet.</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
