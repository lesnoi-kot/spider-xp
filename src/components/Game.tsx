import clsx from "clsx";
import { Show, createSignal, onMount } from "solid-js";

import { isGameOver, startNewGame, undoMove } from "@/stores/game";

import { Congrats } from "./Congrats/Congrats";
import { Table } from "./Table";
import { AboutDialog, DifficultyDialog } from "./dialogs";

import css from "./styles.module.css";

export function Game() {
  let gameContainerRef: HTMLDivElement;
  const [gameOverVisible, setGameOverVisible] = createSignal(false);
  let difficultyDialog: HTMLDialogElement,
    aboutDialog: HTMLDialogElement,
    gameOverDialog: HTMLDialogElement;

  function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      gameContainerRef.requestFullscreen();
    }
  }

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

    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyF":
          toggleFullScreen();
          break;
        case "KeyZ":
          if (event.ctrlKey) {
            undoMove();
          }
          break;
        default:
          break;
      }
    });

    difficultyDialog.show();
  });

  return (
    <div
      /* @ts-ignore */
      ref={gameContainerRef}
      class={clsx(css["game"], "window")}
    >
      <div class="title-bar">
        <div class="title-bar-text">Spider</div>
      </div>
      <div class={clsx("window-body", css["game-body"])}>
        <div>
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
              setGameOverVisible((value) => !value);
            }}
          >
            Game Over
          </button>
          <button
            style="border: 0; box-shadow: none; background: inherit;"
            onClick={() => {
              undoMove();
            }}
          >
            Undo (Ctrl-Z)
          </button>
          <button
            style="border: 0; box-shadow: none; background: inherit;"
            onClick={toggleFullScreen}
          >
            Fullscreen (F)
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

        {/* @ts-ignore */}
        <DifficultyDialog ref={difficultyDialog} />
        {/* @ts-ignore */}
        <AboutDialog ref={aboutDialog} />

        <Show when={gameOverVisible() || isGameOver()}>
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
    </div>
  );
}
