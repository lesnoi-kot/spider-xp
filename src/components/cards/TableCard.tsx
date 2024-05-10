import { ComponentProps, createMemo, createSignal, mergeProps } from "solid-js";
import clsx from "clsx";
import { clamp } from "lodash";

import { type TableCard, cardsSorted } from "@/models";
import {
  NULL_POSITION,
  dragedCards,
  mouseData,
  setDragedCards,
  setMouseData,
} from "@/stores/dragdrop";
import { game, getCardsAfterCard } from "@/stores/game";

import { BaseCard } from "./placeholders";
import css from "./styles.module.css";

const MAX_STACK_HEIGHT = 330;
const FULL_STEP = 28;
const MIN_STEP = 7;

const [pressedCard, setPressedCard] = createSignal<string>();

document.addEventListener("mouseup", () => {
  setPressedCard(undefined);
});

export function TableCard(props: TableCard & ComponentProps<"div">) {
  const position = createMemo(() => {
    if (dragedCards().find((card) => card.id === props.id)) {
      return mouseData();
    }

    return NULL_POSITION;
  });

  const marginTop = createMemo((): number => {
    const stack = game.table[props.column];
    const stackLen = stack.length;
    const step = Math.floor(
      clamp(MAX_STACK_HEIGHT / stackLen, MIN_STEP, FULL_STEP)
    );

    let margin = 0;
    for (let i = 0; i < stack.length; i++) {
      const card = stack[i];
      if (card.id === props.id) {
        break;
      }

      if (card.id === pressedCard()) {
        margin += FULL_STEP;
      } else {
        margin += card.hidden ? MIN_STEP : step;
      }
    }

    return margin;
  });

  return (
    <BaseCard
      id={props.id}
      class={clsx(
        css[`card-${props.suit}`],
        css[`card-${props.rank}`],
        props.hidden && css["card-hidden"]
      )}
      style={{
        "margin-top": `${
          pressedCard() == props.id ? marginTop() : marginTop()
        }px`,
        "grid-row": "1",
        "grid-column": `${props.column + 1}`,
        translate: `${position().X}px ${position().Y}px`,
        "z-index": position() === NULL_POSITION ? undefined : "10",
      }}
      draggable="false"
      onMouseDown={(event) => {
        if (props.hidden || event.button !== 0) {
          return;
        }

        const handCards = getCardsAfterCard(props);

        if (cardsSorted(handCards)) {
          setDragedCards(handCards);
          setMouseData({
            X: -1,
            Y: -1,
            originX: event.clientX,
            originY: event.clientY,
          });
        } else {
          setPressedCard(props.id);
        }
      }}
    />
  );
}
