import { nanoid } from "nanoid";
import { createStore, produce } from "solid-js/store";
import range from "lodash/range";
import shuffle from "lodash/shuffle";

import { Card, SUITS, TableCard, cardsStackable, getDeck } from "@/models";

export type GameConfig = {
  slots: 10;
  suitCount: 1 | 2 | 4; // easy, medium, hard
  totalDecks: 8;
};

export type GameState = {
  readonly slots: number;
  deck: Card[];
  table: TableCard[][];
  removed: Card[];
};

export const [game, setGame] = createStore(
  newGameState({
    slots: 10,
    suitCount: 1,
    totalDecks: 8,
  })
);

export function newGameState({
  slots,
  suitCount,
  totalDecks,
}: GameConfig): GameState {
  const INITIAL_CARDS_COUNT = 54;
  const allCards = shuffle(
    range(totalDecks / suitCount).flatMap(() =>
      SUITS.slice(0, suitCount).flatMap(getDeck)
    )
  );
  const initialCards = allCards.slice(0, INITIAL_CARDS_COUNT).map(
    (card, i): TableCard => ({
      id: nanoid(),
      hidden: i < INITIAL_CARDS_COUNT - slots,
      row: Math.floor(i / slots),
      column: i % slots,
      ...card,
    })
  );
  const hiddenCards = allCards.slice(INITIAL_CARDS_COUNT);

  return {
    slots,
    deck: hiddenCards,
    table: range(slots).map((column) =>
      initialCards.filter((card) => card.column === column)
    ),
    removed: [],
  };
}

export function revealTopCards(game: GameState): GameState {
  return game;
}

export function getCardsAfterCard(card: TableCard): TableCard[] {
  const cards = game.table[card.column].filter((c) => c.row >= card.row);
  return cards;
}

export function moveCards(cards: TableCard[], toColumn: number) {
  if (cards.length === 0) {
    return;
  }

  if (toColumn < 0 || toColumn >= game.slots) {
    throw new Error("Invalid column");
  }

  const fromColumn = cards[0].column;

  if (fromColumn === toColumn) {
    return;
  }

  const lastCardOfTargetColumn = game.table[toColumn].at(-1);

  if (
    lastCardOfTargetColumn &&
    !cardsStackable(cards[0], lastCardOfTargetColumn)
  ) {
    return;
  }

  setGame(
    produce((game) => {
      game.table[fromColumn] = game.table[fromColumn].slice(0, -cards.length);
      if (game.table[fromColumn].length > 0) {
        game.table[fromColumn][game.table[fromColumn].length - 1].hidden =
          false;
      }

      game.table[toColumn].push(...cards);
      game.table[toColumn].forEach((card, row) => {
        card.column = toColumn;
        card.row = row;
      });
    })
  );
}

export function dealCards() {
  setGame(
    produce((game) => {
      const dealtCards = game.deck.slice(0, game.slots);
      game.deck = game.deck.slice(game.slots);

      dealtCards.forEach((card, i) => {
        game.table[i].push({
          id: nanoid(),
          hidden: false,
          row: game.table[i].length,
          column: i,
          ...card,
        });
      });
    })
  );
}

export function getHiddenDecksCount(): number {
  return Math.floor(game.deck.length / game.slots);
}
