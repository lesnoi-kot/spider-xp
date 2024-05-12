import { noHintAudio } from "@/sfx";
import { game } from "@/stores/game";

export function ScoreBoard() {
  return (
    <div
      role="button"
      style="font-size: 1rem; display: flex; flex-direction: column; place-content: center; height: 95px; width: 200px; background: green; color: white; border: 1px solid black; cursor: pointer; text-align: center;"
      onClick={() => {
        noHintAudio.play();
      }}
    >
      <div>
        <span style="display: inline-block; text-align: right;">Score:</span>
        &nbsp;
        <span>{game.score}</span>
      </div>
      <div>
        <span style="display: inline-block; text-align: right;">Moves:</span>
        &nbsp;
        <span>{game.moves}</span>
      </div>
    </div>
  );
}
