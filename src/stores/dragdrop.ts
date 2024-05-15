import { createEffect, createSignal } from "solid-js";
import { produce } from "solid-js/store";

import type { TableCard } from "@/models";
import { moveAudio } from "@/sfx";

import { game, moveCards, setGame } from "./game";

export const NULL_POSITION = { originX: 0, originY: 0 };
export type PositionData = typeof NULL_POSITION;

export const [dragedCards, setDragedCards] = createSignal<TableCard[]>([]);
export const [mouseData, setMouseData] =
  createSignal<PositionData>(NULL_POSITION);

createEffect(() => {
  const handCards = dragedCards();
  if (handCards.length === 0) {
    return;
  }

  // Shift cards on click
  setGame(
    produce((game) => {
      handCards.forEach((card) => {
        Object.assign(game.table[card.column][card.row], {
          translateX: -1,
          translateY: -1,
        });
      });
    })
  );
});

document.addEventListener("pointermove", (event) => {
  const handCards = dragedCards();
  if (handCards.length === 0) {
    return;
  }

  const X = event.clientX - mouseData().originX;
  const Y = event.clientY - mouseData().originY;

  setGame(
    produce((game) => {
      handCards.forEach((card) => {
        Object.assign(game.table[card.column][card.row], {
          translateX: X,
          translateY: Y,
        });
      });
    })
  );
});

document.addEventListener("pointerup", () => {
  const handCards = dragedCards();
  if (handCards.length === 0) {
    return;
  }

  const targetColumns = findMaxOverlapRectIndexes(
    mergeDOMRects(
      handCards.map((card) =>
        document.getElementById(card.id)!.getBoundingClientRect()
      )
    ),
    game.table.map((stack, slot) =>
      mergeDOMRects(
        stack
          .filter((card) => !handCards.includes(card))
          .slice(-1)
          .map((card) =>
            document.getElementById(card.id)!.getBoundingClientRect()
          )
          .concat(
            document
              .getElementById(game.slots[slot].id)!
              .getBoundingClientRect()
          )
      )
    )
  );

  setDragedCards([]);
  setMouseData(NULL_POSITION);

  setGame(
    produce((game) => {
      handCards.forEach((card) => {
        Object.assign(game.table[card.column][card.row], {
          translateX: 0,
          translateY: 0,
          // transition: "translate 150ms",
        });
      });
    })
  );

  for (const targetColumn of targetColumns) {
    if (moveCards(handCards, targetColumn)) {
      moveAudio.play();
      break;
    }
  }
});

/* Geometry helpers */
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

function findMaxOverlapRectIndexes(
  inputRect: DOMRect,
  rects: DOMRect[]
): number[] {
  const overlaps = rects
    .map((rect, index) => {
      const overlapArea = calculateOverlapArea(inputRect, rect);
      return { index, overlapArea };
    })
    .filter((overlap) => overlap.overlapArea > 0)
    .sort((a, b) => b.overlapArea - a.overlapArea);

  return overlaps.map((overlap) => overlap.index);
}

function mergeDOMRects(rects: DOMRect[]): DOMRect {
  if (rects.length === 0) {
    return new DOMRect(-999, -999, 0, 0);
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
