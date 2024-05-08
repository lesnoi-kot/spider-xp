import { nanoid } from "nanoid";
import { createStore, produce } from "solid-js/store";
import range from "lodash/range";
import shuffle from "lodash/shuffle";

export const SUIT_SIZE = 13;
export const SUITS = ["spades", "hearts", "clubs", "diamonds"] as const;
export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type TableCard = Card & {
  id: string;
  row: number;
  column: number;
  hidden: boolean;
};

export type GameConfig = {
  slots: 10;
  suitCount: 1 | 2 | 4; // easy, medium, hard
  totalDecks: 8;
};

export type GameState = {
  readonly slots: number;
  deck: Card[];
  table: TableCard[][];
};

export function newGameState({
  slots,
  suitCount,
  totalDecks,
}: GameConfig): GameState {
  const allCards = shuffle(
    range(totalDecks / suitCount).flatMap(() =>
      SUITS.slice(0, suitCount).flatMap(getDeck)
    )
  );
  const initialCards = allCards.slice(0, 54).map(
    (card, i): TableCard => ({
      id: nanoid(),
      hidden: i < 54 - slots,
      row: ~~(i / slots),
      column: i % slots,
      ...card,
    })
  );
  const hiddenCards = allCards.slice(54);

  return {
    slots,
    deck: hiddenCards,
    table: range(slots).map((column) =>
      initialCards.filter((card) => card.column === column)
    ),
  };
}

export function getDeck(suit: Suit): Card[] {
  return RANKS.map((rank) => ({ suit, rank }));
}

function cardsStackable(from: TableCard, to: TableCard): boolean {
  return (
    from.suit === to.suit && RANKS.indexOf(from.rank) < RANKS.indexOf(to.rank)
  );
}

export function areCardsSorted(cards: TableCard[]): boolean {
  if (cards.length === 0) {
    return false;
  }

  let [bottomCard] = cards;

  for (const topCard of cards.slice(1)) {
    if (!cardsStackable(topCard, bottomCard)) {
      return false;
    }
    bottomCard = topCard;
  }

  return true;
}

export function revealTopCards(game: GameState): GameState {
  return game;
}

export const [game, setGame] = createStore(
  newGameState({
    slots: 10,
    suitCount: 4,
    totalDecks: 8,
  })
);

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
