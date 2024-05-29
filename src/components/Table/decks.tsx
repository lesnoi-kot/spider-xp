import { For } from "solid-js";
import range from "lodash/range";

import { HiddenCard, Card } from "@/components/cards";
import * as store from "@/stores/game";

import css from "./styles.module.css";

export function HiddenDecks() {
  const CARD_GAP = 18;
  let clickBlocked = false;

  async function dealHandler() {
    if (clickBlocked) {
      return;
    }

    try {
      clickBlocked = true;
      store.freezeUI();
      await store.dealCards();
    } finally {
      clickBlocked = false;
      store.unfreezeUI();
    }
  }

  return (
    <>
      <For each={range(store.getHiddenDecksCount())}>
        {(i) => (
          <div
            role="button"
            class={css["hidden-deck"]}
            style={`margin-left: -${i * CARD_GAP}px;`}
            onClick={dealHandler}
          >
            <HiddenCard />
          </div>
        )}
      </For>

      {/* Special placeholder card hidden cards are dealt from */}
      <div
        id={store.HIDDEN_DECK_ID}
        style={{
          "margin-left": `-${store.getHiddenDecksCount() * CARD_GAP}px`,
          visibility: "hidden",
        }}
        class={css["hidden-deck"]}
      >
        <HiddenCard />
      </div>
    </>
  );
}

export function RemovedDecks() {
  const CARD_GAP = 24;

  return (
    <>
      <For each={store.game.removed}>
        {(card, i) => (
          <div
            style={{ "margin-right": `-${i() * CARD_GAP}px` }}
            class={css["removed-deck"]}
          >
            <Card {...card} />
          </div>
        )}
      </For>

      {/* Special placeholder card where collected cards are removed to */}
      <div
        id={store.REMOVED_DECK_ID}
        style={{
          "margin-right": `-${store.getRemovedDecksCount() * CARD_GAP}px`,
          visibility: "hidden",
        }}
        class={css["removed-deck"]}
      >
        <Card suit="spades" rank="K" />
      </div>
    </>
  );
}
