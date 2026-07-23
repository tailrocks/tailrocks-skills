export type State = {
  kind: string;
  value?: unknown;
};

export function transition(state: State, event: { type: string }): State {
  if (event.type === "finish") return { kind: "done", value: state.value };
  return state;
}
