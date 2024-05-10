import { For, createEffect } from "solid-js";
import clsx from "clsx";
import range from "lodash/range";

import {
  TableCard,
  CardPlaceholder,
  HiddenCard,
  animateCardDeal,
} from "@/components/cards";
import { ScoreBoard } from "@/components/ScoreBoard";
import * as store from "@/stores/game";

import css from "./styles.module.css";

export function Table() {
  createEffect(() => {
    if (store.isGameFinished()) {
      alert("Ta daaaaaaam!");
    }
  });

  return (
    <div
      class={clsx(css.table, css["table-grid"])}
      style={{
        "--slots": store.getSlotsCount(),
      }}
      draggable="false"
    >
      <For each={store.game.slots}>
        {(slot, i) => <CardPlaceholder gridColumn={i() + 1} id={slot.id} />}
      </For>

      <div style="grid-row: 3; grid-column: 5 / 7;">
        <ScoreBoard />
      </div>

      <HiddenCardsStack />

      <For each={store.game.table.flatMap((stack) => stack)}>
        {(card) => <TableCard {...card} />}
      </For>
    </div>
  );
}

function HiddenCardsStack() {
  let clickBlocked = false;

  return (
    <For each={range(store.getHiddenDecksCount())}>
      {(i) => (
        <div
          id={i === store.getHiddenDecksCount() - 1 ? "deck" : undefined}
          class={css["table-hidden-decks-place"]}
          style={`margin-left: -${i * 18}px;`}
          onClick={async (event) => {
            if (clickBlocked) {
              return;
            }
            clickBlocked = true;

            const deckPlaceBox = event.target.getBoundingClientRect();
            const newCardsOnTable = store.dealCards({ visible: false });

            await Promise.allSettled(
              newCardsOnTable.map((card) => animateCardDeal(card, deckPlaceBox))
            );
            clickBlocked = false;
          }}
        >
          <HiddenCard />
        </div>
      )}
    </For>
  );
}

function RemovedCardsStack() {
  return (
    <For each={range(store.getHiddenDecksCount())}>
      {(i) => (
        <div
          // class={css["table-hidden-decks-place"]}
          style={`margin-left: ${i * 18}px;`}
        >
          <HiddenCard />
        </div>
      )}
    </For>
  );
}
