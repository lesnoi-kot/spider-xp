import { TableCard } from "@/models";
import { getSlotsCount, modifyCard } from "@/stores/game";
import { sleep } from "@/utils";

export async function animateCardDeal(card: TableCard, from: DOMRect) {
  const FLY_DURATION = 250;
  const el = await mounted(card.id);
  const cardBox = el.getBoundingClientRect();
  modifyCard(card.id, {
    translateX: from.x - cardBox.x,
    translateY: from.y - cardBox.y,
    visible: true,
    zIndex: getSlotsCount() - card.column,
  });

  await sleep(120 * card.column);
  modifyCard(card.id, {
    translateX: 0,
    translateY: 0,
    transition: `translate ${FLY_DURATION}ms`,
  });
  await sleep(FLY_DURATION);
  modifyCard(card.id, {
    transition: undefined,
    zIndex: undefined,
  });
}

async function mounted(idSelector: string): Promise<HTMLElement> {
  let el: HTMLElement | null;
  while (!(el = document.getElementById(idSelector))) {
    await sleep(25);
  }
  return el;
}
