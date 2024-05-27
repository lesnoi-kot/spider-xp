import { Ref, createEffect } from "solid-js";
import clsx from "clsx";

import { GameOverDialog } from "@/components/dialogs/GameOverDialog";
import { winAudio } from "@/sfx";

import { Firework } from "./Firework";
import css from "./styles.module.css";

export function Congrats(props: {
  gameOverDialogRef?: Ref<HTMLDialogElement>;
}) {
  createEffect(() => {
    winAudio.play();
  });

  return (
    <>
      <Firework />
      <div class={clsx(css["animated-text"], css["congrats-text"])}>
        You Won!
      </div>
      <GameOverDialog ref={props.gameOverDialogRef} open />
    </>
  );
}
