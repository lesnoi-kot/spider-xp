import { For } from "solid-js";
import clsx from "clsx";

import { TableCard, CardPlaceholder } from "@/components/cards";
import { ScoreBoard } from "@/components/ScoreBoard";
import * as store from "@/stores/game";

import { HiddenDecks, RemovedDecks } from "./decks";
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

      <HiddenDecks />
      <RemovedDecks />

      <For each={store.game.table.flatMap((stack) => stack)}>
        {(card) => <TableCard {...card} />}
      </For>
    </div>
  );
}
