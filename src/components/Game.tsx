import { Show, createEffect, onMount } from "solid-js";

import { isGameOver, startNewGame } from "@/stores/game";
import { winAudio } from "@/sfx";

import { Table } from "./Table";
import { AboutDialog, DifficultyDialog } from "./dialogs";
import { Congrats } from "./Congrats/Congrats";

import css from "./styles.module.css";

export function Game() {
  let difficultyDialog: HTMLDialogElement,
    aboutDialog: HTMLDialogElement,
    gameOverDialog: HTMLDialogElement;

  createEffect(() => {
    if (isGameOver()) {
      winAudio.play();
      gameOverDialog.show();
    }
  });

  onMount(() => {
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

      // Deal cards on the start
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
      <div style="background: #f5f6f7;">
        <button
          style="border: 0; box-shadow: none; background: inherit;"
          onClick={() => {
            difficultyDialog.show();
          }}
        >
          New game
        </button>
        <button
          style="border: 0; box-shadow: none; background: inherit;"
          onClick={() => {
            aboutDialog.show();
          }}
        >
          Help
        </button>
      </div>

      <DifficultyDialog ref={difficultyDialog} />
      <AboutDialog ref={aboutDialog} />

      <Show when={isGameOver()}>
        <Congrats
          gameOverDialogRef={(ref) => {
            gameOverDialog = ref;
            gameOverDialog.addEventListener("close", () => {
              if (gameOverDialog.returnValue === "yes") {
                difficultyDialog.show();
              }
            });
          }}
        />
      </Show>
      <Table />
    </div>
  );
}
