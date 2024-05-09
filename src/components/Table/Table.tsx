import { For, createEffect } from "solid-js";
import clsx from "clsx";
import range from "lodash/range";

import { TableCard, CardPlaceholder, HiddenCard } from "@/components/cards";
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

      <For each={store.game.table}>
        {(cardColumn) => (
          <For each={cardColumn}>
            {(card) => {
              return <TableCard {...card} />;
            }}
          </For>
        )}
      </For>

      <HiddenCardsStack />
    </div>
  );
}

function HiddenCardsStack() {
  return (
    <For each={range(store.getHiddenDecksCount())}>
      {(i) => (
        <div
          class={css["table-hidden-decks-place"]}
          style={`margin-left: -${i * 9}px;`}
          onClick={() => {
            store.dealCards();
          }}
        >
          <HiddenCard />
        </div>
      )}
    </For>
  );
}
