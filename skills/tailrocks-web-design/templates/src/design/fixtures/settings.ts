import type { SettingsScreenProps } from "@/components/screens/settings-screen";

// Deterministic, realistic, typed with the screen's own props. Every
// derived string in a baseline flows from a value here.
export const settingsFixtures = {
  default: {
    state: "default",
    profile: {
      displayName: "Ada Lovelace",
      email: "ada@example.com",
    },
    notifications: { productUpdates: true, weeklyDigest: false },
  },
  empty: {
    state: "empty",
    profile: { displayName: "", email: "new-user@example.com" },
    notifications: { productUpdates: false, weeklyDigest: false },
  },
  loading: {
    state: "loading",
    profile: { displayName: "", email: "" },
    notifications: { productUpdates: false, weeklyDigest: false },
  },
  error: {
    state: "error",
    profile: {
      // The too-long and unicode values: truncation is designed, not discovered.
      displayName: "Fjörður Þorláksdóttir-Montgomery of Aldershot-upon-Thames",
      email: "fjordur@example.com",
    },
    notifications: { productUpdates: true, weeklyDigest: true },
    errorMessage: "Could not save: the profile service returned 503.",
  },
} satisfies Record<string, SettingsScreenProps>;
