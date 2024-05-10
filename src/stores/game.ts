import { nanoid } from "nanoid";
import { createStore, produce } from "solid-js/store";
import range from "lodash/range";
import shuffle from "lodash/shuffle";

import {
  Card,
  CardSlot,
  SUITS,
  SUIT_SIZE,
  TableCard,
  allRevealed,
  cardsSorted,
  cardsStackable,
  getDeck,
} from "@/models";

export type GameConfig = {
  slots: 10;
  suitCount: 1 | 2 | 4; // easy, medium, hard
  totalDecks: number;
};

export type GameState = {
  readonly slots: CardSlot[];
  deck: Card[];
  table: TableCard[][];
  removed: Card[];
};

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
    (card, i, currCards): TableCard => ({
      id: nanoid(),
      hidden: currCards.length - i > slots,
      row: Math.floor(i / slots),
      column: i % slots,
      ...card,
    })
  );
  const hiddenCards = allCards.slice(INITIAL_CARDS_COUNT);

  return {
    slots: range(slots).map(() => ({ id: nanoid() })),
    deck: hiddenCards,
    table: range(slots).map((column) =>
      initialCards.filter((card) => card.column === column)
    ),
    removed: [],
  };
}

export const NULL_GAME = newGameState({
  slots: 10,
  suitCount: 1,
  totalDecks: 0,
});

export const [game, setGame] = createStore(
  newGameState({
    slots: 10,
    suitCount: 1,
    totalDecks: 8,
  })
);

export function startNewGame(level: "easy" | "medium" | "hard") {
  setGame(
    newGameState({
      slots: 10,
      suitCount: level === "easy" ? 1 : level === "medium" ? 2 : 4,
      totalDecks: 8,
    })
  );
}

export function revealTopCards() {
  setGame(
    produce((game) => {
      game.table.forEach((stack) => {
        if (stack.length > 0) {
          stack[stack.length - 1].hidden = false;
        }
      });
    })
  );
}

export function getCardsAfterCard(card: TableCard): TableCard[] {
  const cards = game.table[card.column].filter((c) => c.row >= card.row);
  return cards;
}

export function moveCards(cards: TableCard[], toColumn: number): boolean {
  if (cards.length === 0) {
    throw new Error("Can't move zero cards");
  }

  if (toColumn < 0 || toColumn >= game.slots.length) {
    throw new Error("Invalid column");
  }

  const fromColumn = cards[0].column;

  if (fromColumn === toColumn) {
    return false;
  }

  const lastCardOfTargetColumn = game.table[toColumn].at(-1);

  if (
    lastCardOfTargetColumn &&
    !cardsStackable(cards[0], lastCardOfTargetColumn)
  ) {
    return false;
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
  checkCardsGathered();
  revealTopCards();

  return true;
}

export function dealCards(extra?: Partial<TableCard>): TableCard[] {
  let result: TableCard[] = [];

  setGame(
    produce((game) => {
      const dealtCards = game.deck.slice(0, game.slots.length);
      game.deck = game.deck.slice(game.slots.length);

      result = dealtCards.map((card, column) => {
        const tableCard: TableCard = {
          id: nanoid(),
          hidden: false,
          row: game.table[column].length,
          column: column,
          ...extra,
          ...card,
        };

        game.table[column].push(tableCard);
        return tableCard;
      });
    })
  );

  return result;
}

// export function takeFromDeck(): Card[] {}

export function checkCardsGathered() {
  setGame(
    produce((game) => {
      game.table.forEach((stack, column) => {
        const cards = stack.slice(-SUIT_SIZE);
        if (
          cards.length === SUIT_SIZE &&
          allRevealed(cards) &&
          cardsSorted(cards)
        ) {
          game.table[column].splice(-SUIT_SIZE);
        }
      });
    })
  );
}

export function isGameFinished() {
  return (
    game.table.every((stack) => stack.length === 0) && game.deck.length === 0
  );
}

export function getSlotsCount(): number {
  return game.slots.length;
}

export function getHiddenDecksCount(): number {
  return Math.floor(game.deck.length / getSlotsCount());
}

export function modifyCard(id: string, input: Partial<TableCard>) {
  setGame(
    produce((game) => {
      const card = game.table.flatMap((x) => x).find((card) => card.id === id);

      if (card) {
        Object.assign(card, input);
      }
    })
  );
}
