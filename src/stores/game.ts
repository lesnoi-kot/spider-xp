import { nanoid } from "nanoid";
import { createStore, produce } from "solid-js/store";
import range from "lodash/range";
import shuffle from "lodash/shuffle";
import { take } from "lodash";

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
import { sleep } from "@/utils";
import { loopedDealSound } from "@/sfx";

export type GameConfig = {
  slots: 10;
  suitCount: 1 | 2 | 4; // easy, medium, hard
  totalDecks: number;
};

export type GameState = {
  readonly slots: CardSlot[];
  deck: Card[]; // Shuffled cards list to take a card from
  table: TableCard[][]; // Cards of each column
  removed: Card[]; // King cards of removed decks
  score: number;
  moves: number;
  uiFrozen: boolean;
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

  // Number of hidden cards on the table at the start
  const INITIAL_CARDS_COUNT = 54 - slots;

  const initialCards = take(allCards, INITIAL_CARDS_COUNT).map(
    (card, i): TableCard => ({
      id: nanoid(),
      hidden: false,
      row: Math.floor(i / slots),
      column: i % slots,
      ...card,
    })
  );

  return {
    slots: range(slots).map(() => ({ id: nanoid() })),
    deck: allCards.slice(INITIAL_CARDS_COUNT),
    table: range(slots).map((column) =>
      initialCards.filter((card) => card.column === column)
    ),
    removed: [],
    score: 0,
    moves: 0,
    uiFrozen: false,
  };
}

export const NULL_GAME = newGameState({
  slots: 10,
  suitCount: 1,
  totalDecks: 0,
});

export const [game, setGame] = createStore(NULL_GAME);

export function startNewGame(level: "easy" | "medium" | "difficult") {
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
      const removedCards = game.table[fromColumn].splice(-cards.length);
      if (game.table[fromColumn].length > 0) {
        game.table[fromColumn][game.table[fromColumn].length - 1].hidden =
          false;
      }

      game.table[toColumn].push(...removedCards);
      game.table[toColumn].forEach((card, row) => {
        card.column = toColumn;
        card.row = row;
      });
      game.moves += 1;
    })
  );
  checkCardsGathered();

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

export function checkCardsGathered() {
  game.table.forEach((stack, column) => {
    const cards = stack.slice(-SUIT_SIZE);
    if (
      cards.length === SUIT_SIZE &&
      allRevealed(cards) &&
      cardsSorted(cards)
    ) {
      const to = document.getElementById("trash")!.getBoundingClientRect();

      freezeUI();
      loopedDealSound(getSlotsCount());
      Promise.all(
        cards.map((card, i, arr) =>
          animateCardRemoval(card, arr.length - i - 1, to).then(() => {
            setGame(
              produce((game) => {
                game.score += 100;
              })
            );
          })
        )
      ).then(() => {
        setGame(
          produce((game) => {
            const [onOfRemovedCards] = game.table[column].splice(-SUIT_SIZE);
            game.removed.push(onOfRemovedCards);
          })
        );
        unfreezeUI();
        revealTopCards();
      });
    }
  });
}

export function isGameOver() {
  return (
    game.removed.length !== 0 &&
    game.table.every((stack) => stack.length === 0) &&
    game.deck.length === 0
  );
}

export function getSlotsCount(): number {
  return game.slots.length;
}

export function getHiddenDecksCount(): number {
  return Math.floor(game.deck.length / getSlotsCount());
}

export function getRemovedDecksCount(): number {
  return game.removed.length;
}

export function freezeUI() {
  setGame(
    produce((game) => {
      game.uiFrozen = true;
    })
  );
}

export function unfreezeUI() {
  setGame(
    produce((game) => {
      game.uiFrozen = false;
    })
  );
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

export async function animateCardRemoval(
  card: TableCard,
  order: number,
  to: DOMRect
) {
  const FLY_DURATION = 200;
  const cardBox = document.getElementById(card.id)!.getBoundingClientRect();
  modifyCard(card.id, {
    translateX: 0,
    translateY: 0,
    transition: undefined,
  });

  await sleep(100 * order);
  modifyCard(card.id, {
    translateX: to.x - cardBox.x,
    translateY: to.y - cardBox.y,
    transition: `translate ${FLY_DURATION}ms`,
    zIndex: 10 + order,
  });
  await sleep(FLY_DURATION);
}
