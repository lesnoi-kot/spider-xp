import { nanoid } from "nanoid";
import { createStore, produce } from "solid-js/store";
import { range, shuffle, take } from "lodash";

import {
  Card,
  CardSlot,
  ReferenceableCardEntity,
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
  history: Array<Record<number, TableCard[]>>; // Moves history. Stored only for current deal.
  score: number;
  moves: number;
  uiFrozen: boolean;
};

export const HIDDEN_DECK_ID = "deck";
export const REMOVED_DECK_ID = "trash";

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
      hidden: true,
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
    history: [],
    score: 500,
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
      game.history.push({
        [fromColumn]: game.table[fromColumn].map((card) => ({ ...card })),
        [toColumn]: game.table[toColumn].map((card) => ({ ...card })),
      });

      const removedCards = game.table[fromColumn].splice(-cards.length);

      // Reveal a hidden card under the moved card
      if (game.table[fromColumn].length > 0) {
        game.table[fromColumn][game.table[fromColumn].length - 1].hidden =
          false;
      }

      game.table[toColumn].push(...removedCards);

      // Adjust column/row values in cards
      game.table[toColumn].forEach((card, row) => {
        card.column = toColumn;
        card.row = row;
      });
      game.moves++;
      game.score--;
    })
  );
  checkCardsGathered();
  return true;
}

export async function dealCards() {
  let dealtTableCards: TableCard[] = [];

  setGame(
    produce((game) => {
      game.history.length = 0;
      const dealtCards = game.deck.slice(0, game.slots.length);
      game.deck = game.deck.slice(game.slots.length);

      dealtTableCards = dealtCards.map((card, column) => {
        const tableCard: TableCard = {
          id: nanoid(),
          hidden: false,
          row: game.table[column].length,
          column,
          ...card,
        };
        game.table[column].push(tableCard);
        return tableCard;
      });
    })
  );

  if (dealtTableCards.length === 0) {
    return;
  }

  const deckPlaceBox = document
    .getElementById(HIDDEN_DECK_ID)!
    .getBoundingClientRect();
  const FLY_DURATION = 250;
  const FLY_DELAY = 100;

  loopedDealSound(getSlotsCount());

  await Promise.allSettled(
    dealtTableCards.map((card) => {
      const cardBox = document.getElementById(card.id)!.getBoundingClientRect();
      return animateCardFly({
        card,
        duration: FLY_DURATION,
        delay: FLY_DELAY * card.column,
        from: new DOMPointReadOnly(
          deckPlaceBox.x - cardBox.x,
          deckPlaceBox.y - cardBox.y
        ),
        to: new DOMPointReadOnly(0, 0),
        zIndex: 100 - card.column,
      });
    })
  );

  checkCardsGathered();
}

function checkCardsGathered() {
  game.table.forEach((stack, column) => {
    const cards = stack.slice(-SUIT_SIZE);
    if (
      cards.length === SUIT_SIZE &&
      allRevealed(cards) &&
      cardsSorted(cards)
    ) {
      setGame(
        produce((game) => {
          game.history.length = 0;
        })
      );

      const toBox = document
        .getElementById(REMOVED_DECK_ID)!
        .getBoundingClientRect();

      freezeUI();
      loopedDealSound(getSlotsCount());

      Promise.all(
        cards.map((card, i, arr) => {
          const order = arr.length - i - 1;
          const cardBox = document
            .getElementById(card.id)!
            .getBoundingClientRect();
          return animateCardFly({
            card,
            duration: 250,
            delay: 100 * order,
            from: { x: 0, y: 0 },
            to: {
              x: toBox.x - cardBox.x,
              y: toBox.y - cardBox.y,
            },
            zIndex: 10 + order,
          }).then(() => {
            setGame("score", (score) => score + 10);
          });
        })
      ).then(() => {
        setGame(
          produce((game) => {
            const [oneOfRemovedCards] = game.table[column].splice(-SUIT_SIZE);
            game.removed.push(oneOfRemovedCards);
          })
        );
        unfreezeUI();
        revealTopCards();
      });
    }
  });
}

export function undoMove() {
  if (game.history.length === 0) {
    return;
  }

  setGame(
    produce((game) => {
      const prevTableState = game.history.pop();

      for (const column in prevTableState) {
        game.table[+column] = prevTableState[+column];
      }

      game.moves++;
      game.score--;
    })
  );
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

type CardFlyAnimationParams = {
  card: TableCard;
  duration: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  zIndex?: number;
  delay?: number;
};

export async function animateCardFly({
  card,
  duration,
  from,
  to,
  zIndex,
  delay,
}: CardFlyAnimationParams) {
  modifyCard(card.id, {
    translateX: from.x,
    translateY: from.y,
    transition: undefined,
    visible: true,
  });
  if (typeof delay === "number") {
    await sleep(delay);
  }
  modifyCard(card.id, {
    translateX: to.x,
    translateY: to.y,
    transition: `translate ${duration}ms`,
    zIndex,
  });
  await sleep(duration);
  modifyCard(card.id, {
    transition: undefined,
    zIndex: undefined,
  });
}

export type Tip = {
  from: ReferenceableCardEntity[]; // Cards to take
  to: ReferenceableCardEntity; // The card to stack on
};

// Just bruteforce deez nuts
export function getTips(): Tip[] {
  const tips: Tip[] = [];

  for (let i = 0; i < game.table.length; i++) {
    const target = game.table[i].at(-1);
    const targetSlot = game.slots[i];

    for (let j = 0; j < game.table.length; j++) {
      const currStack = game.table[j];

      if (j === i || currStack.length === 0) {
        continue;
      }

      let k = currStack.length - 1;

      while (k > 0) {
        if (
          currStack[k - 1].hidden ||
          !cardsStackable(currStack[k], currStack[k - 1])
        ) {
          break;
        }

        k--; // Climb up to the top of the card stack
      }

      const from = currStack.slice(k);
      if (from.length && (!target || cardsStackable(from[0], target))) {
        tips.push({ from, to: target ?? targetSlot });
      }
    }
  }

  return shuffle(tips);
}
