import clsx from "clsx";

import type { Card, TableCard } from "../../store";

import css from "./styles.module.css";

let currEl: HTMLDivElement | null = null;

document.addEventListener("mousemove", (event) => {
  if (!currEl) {
    return;
  }

  const { x, y } = currEl.getBoundingClientRect();
  console.log(event.clientX, event.clientY, x, y);

  currEl.style.translate = `${event.clientX - x}px ${event.clientY - y}px`;
  // currEl.style.left = `${event.clientX}px`;
  // currEl.style.top = `${event.clientY}px`;
});

document.addEventListener("mouseup", () => {
  if (currEl) {
    currEl.style.left = "";
    currEl.style.top = "";
    currEl.style.translate = "";
  }
  currEl = null;
});

export function Card({ id, suit, rank, row, column, hidden }: TableCard) {
  return (
    <div
      class={clsx(
        css["card-shape"],
        css.card,
        css[`card-${suit}`],
        css[`card-${rank}`],
        hidden && css["card-hidden"]
      )}
      style={{
        "grid-row": `${row}`,
        "grid-column": `${column}`,
      }}
      // draggable="false"
      draggable="true"
      onMouseDown={(event) => {
        // console.log("onMouseDown", event.);
        // currEl = event.currentTarget;
      }}
      onDragStart={(event) => {
        console.log("drag", event);
        event.dataTransfer?.setData("text/plain", id);
      }}
      onDrop={(event) => {
        event.preventDefault();

        console.log("drop", event.dataTransfer?.getData("text/plain"));
      }}
      onDragOver={(event) => {
        event.preventDefault();
        console.log("dragOver", event);
      }}
    />
  );
}
