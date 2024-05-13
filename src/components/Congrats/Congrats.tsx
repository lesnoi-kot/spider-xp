import { Ref } from "solid-js";
import clsx from "clsx";

import { GameOverDialog } from "@/components/dialogs/GameOverDialog";

import { Firework } from "./Firework";
import css from "./styles.module.css";

export function Congrats(props: {
  gameOverDialogRef?: Ref<HTMLDialogElement>;
}) {
  return (
    <>
      <Firework />
      <div class={clsx(css["animated-text"], css["congrats-text"])}>
        You Won!
      </div>
      <GameOverDialog ref={props.gameOverDialogRef} />
    </>
  );
}
