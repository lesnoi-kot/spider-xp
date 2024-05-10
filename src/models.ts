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
  hidden: boolean; // Show the "spider" backside

  transition?: string;
  translateX?: number;
  translateY?: number;
  visible?: boolean;
  zIndex?: number;
};

export type CardSlot = {
  id: string;
};

export function getDeck(suit: Suit): Card[] {
  return RANKS.map((rank) => ({ suit, rank }));
}

export function cardsStackable(from: Card, to: Card): boolean {
  return (
    from.suit === to.suit &&
    RANKS.indexOf(to.rank) - RANKS.indexOf(from.rank) === 1
  );
}

export function cardsSorted(cards: Card[]): boolean {
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

export function allRevealed(cards: TableCard[]) {
  return cards.every((card) => !card.hidden);
}
