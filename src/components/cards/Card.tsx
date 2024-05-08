import { createMemo, createSignal, onMount } from "solid-js";
import clsx from "clsx";

import {
  game,
  type Card,
  type TableCard,
  getCardsAfterCard,
  moveCards,
  areCardsSorted,
} from "../../store";

import css from "./styles.module.css";

const NULL_POSITION = { X: 0, Y: 0, originX: 0, originY: 0 };

const [dragedCards, setDragedCards] = createSignal<TableCard[]>([]);
const [mouseData, setMouseData] =
  createSignal<typeof NULL_POSITION>(NULL_POSITION);

document.addEventListener("mousemove", (event) => {
  if (dragedCards().length === 0) {
    return;
  }

  setMouseData((data) => ({
    ...data,
    X: event.clientX - data.originX,
    Y: event.clientY - data.originY,
  }));
});

document.addEventListener("mouseup", () => {
  const handCards = dragedCards();
  if (handCards.length === 0) {
    return;
  }

  const targetColumn = findMaxOverlapRectIndex(
    mergeDOMRects(
      handCards.map((card) =>
        document.getElementById(card.id)!.getBoundingClientRect()
      )
    ),
    game.table.map((slot) =>
      mergeDOMRects(
        slot
          .filter((card) => !handCards.includes(card))
          .map((card) =>
            document.getElementById(card.id)!.getBoundingClientRect()
          )
      )
    )
  );

  setDragedCards([]);
  setMouseData(NULL_POSITION);

  if (targetColumn !== -1) {
    moveCards(handCards, targetColumn);
  }
});

export function Card(card: TableCard) {
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

function calculateOverlapArea(rect1: DOMRect, rect2: DOMRect): number {
  const xOverlap = Math.max(
    0,
    Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
      Math.max(rect1.x, rect2.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(rect1.y + rect1.height, rect2.y + rect2.height) -
      Math.max(rect1.y, rect2.y)
  );
  return xOverlap * yOverlap;
}

function findMaxOverlapRectIndex(inputRect: DOMRect, rects: DOMRect[]): number {
  let maxOverlapArea = 0;
  let maxOverlapIndex = -1;

  rects.forEach((rect, index) => {
    const overlapArea = calculateOverlapArea(inputRect, rect);
    if (overlapArea > maxOverlapArea) {
      maxOverlapArea = overlapArea;
      maxOverlapIndex = index;
    }
  });

  return maxOverlapIndex;
}

function mergeDOMRects(rects: DOMRect[]): DOMRect {
  if (rects.length === 0) {
    return new DOMRect(-1, -1, 0, 0);
  }

  let minX = rects[0].x;
  let minY = rects[0].y;
  let maxX = rects[0].x + rects[0].width;
  let maxY = rects[0].y + rects[0].height;

  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}
