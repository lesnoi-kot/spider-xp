import { For } from "solid-js";
import { createStore } from "solid-js/store";
import clsx from "clsx";
import range from "lodash/range";

import { Card, CardPlaceholder, HiddenCard } from "../cards";
import * as store from "../../store";

import css from "./styles.module.css";

const [game, setGame] = createStore(
  store.newGameState({
    slots: 10,
    suitCount: 4,
    totalDecks: 8,
  })
);

export function Table() {
  return (
    <div
      class={clsx(css.table, css["table-grid"])}
      style={{
        "--slots": game.slots,
      }}
      draggable="false"
    >
      <For each={range(game.slots)}>
        {(i) => <CardPlaceholder column={i + 1} />}
      </For>

      <For each={game.table}>
        {(cardColumn, i) => (
          <div style={`grid-row: 1; grid-column: ${i() + 1};`}>
            <For each={cardColumn}>
              {(card, j) => (
                <div
                  style={`position: absolute; margin-top: ${j() * 7}px;`}
                  draggable="false"
                >
                  <Card {...card} />
                </div>
              )}
            </For>
          </div>
        )}
      </For>

      {/* <For each={state.cards}>{(card) => <Card {...card} />}</For> */}
      <HiddenCardsStack />
    </div>
  );
}

function HiddenCardsStack() {
  const hiddenDecksCount = store.getHiddenDecksCount(game);

  return (
    <For each={range(hiddenDecksCount)}>
      {(i) => (
        <div
          class={css["table-hidden-decks-place"]}
          style={`margin-left: -${i * 9}px;`}
          onClick={() => {
            console.log("gkdjgdgjfl");

            setGame((game) => store.dealCards(game));
          }}
        >
          <HiddenCard />
        </div>
      )}
    </For>
  );

  // return (
  //   <For each={state.hiddenDecks}>
  //     {(deck, i) => (
  //       <div
  //         class={css["table-hidden-decks-place"]}
  //         style={`margin-left: -${i() * 9}px;`}
  //         onClick={() => {
  //           setState2(game => store.dealCards(game));
  //         }}
  //       >
  //         <HiddenCard />
  //       </div>
  //     )}
  //   </For>
  // );
}
