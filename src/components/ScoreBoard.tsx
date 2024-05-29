import { createMemo } from "solid-js";

import { hintAudio, noHintAudio } from "@/sfx";
import { game, getTips, type Tip } from "@/stores/game";

import css from "./styles.module.css";

function* infiniteTipsGenerator(tips: Tip[]) {
  if (tips.length === 0) {
    return null;
  }

  while (true) {
    for (const tip of tips) {
      yield tip;
    }
  }
}

export function ScoreBoard() {
  let clickBlocked = false;

  const tips = createMemo(() => {
    const tips = getTips();
    return infiniteTipsGenerator(tips);
  });

  return (
    <div
      role="button"
      class={css.scoreboard}
      onClick={() => {
        if (clickBlocked || game.uiFrozen) {
          return;
        }

        const { value: tip } = tips().next();
        if (!tip) {
          noHintAudio.play();
          return;
        }

        clickBlocked = true;

        hintAudio.pause();
        hintAudio.currentTime = 0;
        hintAudio.play();

        animateTip(tip).finally(() => {
          clickBlocked = false;
        });
      }}
    >
      <span style="text-align: right">Score:</span>
      <span>{game.score}</span>
      <span>Moves:</span>
      <span>{game.moves}</span>
    </div>
  );
}

const invertKeyframe = [{ filter: "invert(100%)" }];
const invertOptions = {
  duration: 500,
  iterations: 1,
  easing: "step-start",
};

function animateTip({ from, to }: Tip) {
  const elTo = document.getElementById(to.id);

  return Promise.all([
    ...from.map((card) => {
      const elFrom = document.getElementById(card.id);
      return elFrom?.animate(invertKeyframe, invertOptions).finished;
    }),
    elTo?.animate(invertKeyframe, { ...invertOptions, delay: 250 }).finished,
  ]);
}
