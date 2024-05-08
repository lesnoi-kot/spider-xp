import { For } from "solid-js";
import clsx from "clsx";
import range from "lodash/range";

import { Card, CardPlaceholder, HiddenCard } from "../cards";
import * as store from "../../store";

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
          <For each={cardColumn}>{(card) => <Card {...card} />}</For>
        )}
      </For>

      <HiddenCardsStack />
    </div>
  );
}

function HiddenCardsStack() {
  const hiddenDecksCount = store.getHiddenDecksCount();

  return (
    <For each={range(hiddenDecksCount)}>
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
