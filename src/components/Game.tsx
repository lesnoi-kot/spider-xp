import { Show, createEffect, onMount } from "solid-js";

import { isGameOver, startNewGame } from "@/stores/game";
import { winAudio } from "@/sfx";

import { Table } from "./Table";
import { AboutDialog, DifficultyDialog } from "./dialogs";
import { Congrats } from "./Congrats/Congrats";

import css from "./styles.module.css";

const DIFFICULTY_DIALOG_ID = "difficulty-dialog";
const ABOUT_DIALOG_ID = "about-dialog";

export function Game() {
  let difficultyDialog: HTMLDialogElement, aboutDialog: HTMLDialogElement;

  createEffect(() => {
    if (isGameOver()) {
      winAudio.play();
    }
  });

  onMount(() => {
    difficultyDialog = document.getElementById(
      DIFFICULTY_DIALOG_ID
    ) as HTMLDialogElement;
    aboutDialog = document.getElementById(ABOUT_DIALOG_ID) as HTMLDialogElement;

    difficultyDialog.addEventListener("close", () => {
      const dialogResult = difficultyDialog.returnValue;

      switch (dialogResult) {
        case "easy":
          startNewGame("easy");
          break;
        case "medium":
          startNewGame("medium");
          break;
        case "difficult":
          startNewGame("difficult");
          break;
        default:
          return;
      }

      setTimeout(() => {
        document.getElementById("deck")?.click();
      }, 50);
    });

    difficultyDialog.show();
  });

  return (
    <div
      class={css["game"]}
      style="position: relative; display: flex; flex-direction: column; width: fit-content; place-content: center;"
    >
      <div>
        <button
          onClick={() => {
            difficultyDialog.show();
          }}
        >
          new game
        </button>
        <button
          onClick={() => {
            aboutDialog.show();
          }}
        >
          about
        </button>
      </div>
      <DifficultyDialog id={DIFFICULTY_DIALOG_ID} />
      <AboutDialog id={ABOUT_DIALOG_ID} />

      <Show when={true || isGameOver()}>
        <Congrats />
      </Show>
      <Table />
    </div>
  );
}
