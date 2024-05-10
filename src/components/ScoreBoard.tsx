export function ScoreBoard() {
  return (
    <div
      role="button"
      style="display: flex; flex-direction: column; place-content: center; height: 95px; width: 200px; background: green; color: white; border: 1px solid black; cursor: pointer; text-align: center;"
    >
      <div>Score: 500</div>
      <div>Moves: 0</div>
    </div>
  );
}
