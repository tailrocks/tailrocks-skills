import type { ComponentType } from "react";

import { SettingsScreen } from "@/components/screens/settings-screen";
import { settingsFixtures } from "@/design/fixtures/settings";

export interface ScreenEntry {
  /** Renders one state from its fixture — the same component the real route ships. */
  readonly component: ComponentType<{ state: string }>;
  readonly states: readonly string[];
}

// The single enumeration the index route, the state route, and the visual
// suite all walk. A state missing here is a state the suite silently skips.
export const registry = {
  settings: {
    component: ({ state }) => (
      <SettingsScreen {...settingsFixtures[state as keyof typeof settingsFixtures]} />
    ),
    states: Object.keys(settingsFixtures),
  },
} satisfies Record<string, ScreenEntry>;
