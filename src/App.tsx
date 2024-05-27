import { ErrorBoundary } from "solid-js";

import { Game } from "./components/Game";

export function App() {
  return (
    <ErrorBoundary
      fallback={(err) => (
        <div style="font-size: xxx-large; color: aquamarine;">
          {String(err)}
        </div>
      )}
    >
      <Game />
    </ErrorBoundary>
  );
}
