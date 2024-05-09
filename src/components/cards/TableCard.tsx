import { createMemo } from "solid-js";
import clsx from "clsx";

import { type TableCard, areCardsSorted } from "@/models";
import {
  NULL_POSITION,
  dragedCards,
  mouseData,
  setDragedCards,
  setMouseData,
} from "@/stores/dragdrop";
import { getCardsAfterCard } from "@/stores/game";

import css from "./styles.module.css";

export function TableCard(card: TableCard) {
  const { id, suit, rank, row, column, hidden } = card;

  const position = createMemo(() => {
    if (dragedCards().find((card) => card.id === id)) {
      return mouseData();
    }

    return NULL_POSITION;
  });

  return (
    <div
      id={id}
      class={clsx(
        css["card-shape"],
        css.card,
        css[`card-${suit}`],
        css[`card-${rank}`],
        hidden && css["card-hidden"]
      )}
      style={{
        "margin-top": `${row * (hidden ? 7 : 7)}px`,
        "grid-row": "1",
        "grid-column": `${column + 1}`,
        translate: `${position().X}px ${position().Y}px`,
        "z-index": position() === NULL_POSITION ? undefined : "10",
      }}
      draggable="false"
      onMouseDown={(event) => {
        if (card.hidden || event.button !== 0) {
          return;
        }

        const handCards = getCardsAfterCard(card);

        if (!areCardsSorted(handCards)) {
          return;
        }

        setDragedCards(handCards);
        setMouseData({
          X: -1,
          Y: -1,
          originX: event.clientX,
          originY: event.clientY,
        });
      }}
    />
  );
}
