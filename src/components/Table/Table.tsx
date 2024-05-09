import { For } from "solid-js";
import clsx from "clsx";
import range from "lodash/range";

import { TableCard, CardPlaceholder, HiddenCard } from "@/components/cards";
import * as store from "@/stores/game";

import css from "./styles.module.css";

export function Table() {
  return (
    <div
      class={clsx(css.table, css["table-grid"])}
      style={{
        "--slots": store.game.slots,
      }}
      draggable="false"
    >
      <For each={range(store.game.slots)}>
        {(i) => <CardPlaceholder column={i + 1} />}
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
