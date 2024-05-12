import { ComponentProps, createMemo, createSignal } from "solid-js";
import clsx from "clsx";
import { clamp } from "lodash";

import { type TableCard, cardsSorted } from "@/models";
import { dragedCards, setDragedCards, setMouseData } from "@/stores/dragdrop";
import { game, getCardsAfterCard, modifyCard } from "@/stores/game";
import { selectAudio } from "@/sfx";

import { BaseCard } from "./placeholders";
import css from "./styles.module.css";

const MAX_STACK_HEIGHT = 400; // 330
const FULL_STEP = 28;
const MIN_STEP = 7;

const [pressedCard, setPressedCard] = createSignal<string>();

document.addEventListener("mouseup", () => {
  setPressedCard(undefined);
});

export function TableCard(props: TableCard & ComponentProps<"div">) {
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

  const translate = createMemo((): string => {
    return `${props.translateX ?? 0}px ${props.translateY ?? 0}px`;
  });

  const isDragged = createMemo((): boolean => {
    return dragedCards()
      .map((card) => card.id)
      .includes(props.id);
  });

  const zIndex = createMemo((): number => {
    if (isDragged()) {
      return 100;
    }
    if (props.zIndex) {
      return props.zIndex;
    }
    return 1;
  });

  return (
    <BaseCard
      role="button"
      id={props.id}
      class={clsx(
        css[`card-${props.suit}`],
        css[`card-${props.rank}`],
        props.hidden && css["card-hidden"]
      )}
      style={{
        "margin-top": `${marginTop()}px`,
        "grid-row": "1",
        "grid-column": `${props.column + 1}`,
        translate: translate(),
        transition: props.transition,
        "z-index": zIndex(),
        visibility: props.visible === false ? "hidden" : "visible",
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
            originX: event.clientX,
            originY: event.clientY,
          });
          selectAudio.play();
        } else {
          setPressedCard(props.id);
        }
      }}
      onTransitionEnd={() => {
        // Make managing animations a little bit simpler
        modifyCard(props.id, { transition: undefined });
      }}
    />
  );
}
