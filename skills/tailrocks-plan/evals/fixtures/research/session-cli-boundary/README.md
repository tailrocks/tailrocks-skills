# Session CLI boundary

The checked-in CLI exposes JSON session listing plus open and stop actions.
Poll or subscribe through that boundary; do not read the CLI's private state.
The state-update target is one second after the CLI exposes a change.
