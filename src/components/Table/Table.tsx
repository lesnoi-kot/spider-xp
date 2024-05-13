import { For } from "solid-js";
import clsx from "clsx";
import range from "lodash/range";

import {
  TableCard,
  CardPlaceholder,
  HiddenCard,
  animateCardDeal,
  Card,
} from "@/components/cards";
import { ScoreBoard } from "@/components/ScoreBoard";
import * as store from "@/stores/game";
import { loopedDealSound } from "@/sfx";

import css from "./styles.module.css";

export function Table() {
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
      <RemovedCardsStack />

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
          role="button"
          id={i === store.getHiddenDecksCount() - 1 ? "deck" : undefined}
          class={css["table-hidden-decks-place"]}
          style={`margin-left: -${i * 18}px; cursor: pointer;`}
          onClick={() => {
            if (clickBlocked) {
              return;
            }
            clickBlocked = true;

            const deckPlaceBox = document
              .getElementById("deck")!
              .getBoundingClientRect();
            store.freezeUI();
            const newCardsOnTable = store.dealCards({ visible: false });
            loopedDealSound(store.getSlotsCount());

            Promise.allSettled(
              newCardsOnTable.map((card) => animateCardDeal(card, deckPlaceBox))
            ).then(() => {
              clickBlocked = false;
              store.unfreezeUI();
            });
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
    <>
      <For each={store.game.removed}>
        {(card, i) => (
          <div
            style={{ "margin-right": `-${i() * 24}px` }}
            class={css["table-removed-decks-place"]}
          >
            <Card {...card} />
          </div>
        )}
      </For>
      <div
        id="trash"
        style={{
          "margin-right": `-${store.getRemovedDecksCount() * 24}px`,
          visibility: "hidden",
        }}
        class={css["table-removed-decks-place"]}
      >
        <Card suit="spades" rank="K" />
      </div>
    </>
  );
}
