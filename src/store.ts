import range from "lodash/range";
import shuffle from "lodash/shuffle";
import { nanoid } from "nanoid";

export const SUIT_SIZE = 13;
export const SUITS = ["spades", "hearts", "clubs", "diamonds"] as const;
export const RANKS = [
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
  "A",
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
      row: 1,
      column: 1 + (i % 10),
      ...card,
    })
  );
  const hiddenCards = allCards.slice(54);

  return {
    slots,
    deck: hiddenCards,
    table: range(1, slots + 1).map((column) =>
      initialCards.filter((card) => card.column === column)
    ),
  };
}

// function toDeck(card: Card, row: number, column: number, hidden: boolean): TableCard {
//   return { ...card, id: nanoid(), row, column, hidden };
// }

export function getDeck(suit: Suit): Card[] {
  return RANKS.map((rank) => ({ suit, rank }));
}

export function dealCards(game: GameState): GameState {
  const dealtCards = game.deck.slice(0, game.slots);
  game.deck = game.deck.slice(game.slots);

  dealtCards.forEach((card, i) => {
    game.table[i].push({
      id: nanoid(),
      hidden: true,
      row: 1,
      column: i + 1,
      ...card,
    });
  });

  return game;
}

export function getHiddenDecksCount(game: GameState): number {
  return Math.floor(game.deck.length / game.slots);
}
