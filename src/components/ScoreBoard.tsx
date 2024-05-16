import { createMemo } from "solid-js";

import { hintAudio, noHintAudio } from "@/sfx";
import { game, getTips } from "@/stores/game";

import css from "./styles.module.css";

export function ScoreBoard() {
  const tips = createMemo(() => {
    const tips = getTips();

    function* tipsGenerator() {
      if (tips.length === 0) {
        return null;
      }

      while (true) {
        for (const tip of tips) {
          yield tip;
        }
      }
    }

    return tipsGenerator();
  });

  return (
    <div
      role="button"
      class={css.scoreboard}
      onClick={() => {
        const { value: tip } = tips().next();

        if (!tip) {
          noHintAudio.play();
          return;
        }

        hintAudio.pause();
        hintAudio.currentTime = 0;
        hintAudio.play();
        tip.from.forEach((card) => {
          const elFrom = document.getElementById(card.id);
          elFrom?.animate([{ filter: "invert(100%)" }], {
            duration: 500,
            iterations: 1,
            easing: "step-start",
          });
        });

        const elTo = document.getElementById(tip.to.id);
        elTo?.animate([{ filter: "invert(100%)" }], {
          duration: 500,
          iterations: 1,
          delay: 250,
          easing: "step-start",
        });
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
