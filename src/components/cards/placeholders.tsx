import { splitProps, type ComponentProps } from "solid-js";
import clsx from "clsx";

import css from "./styles.module.css";
import { CardSlot } from "@/models";

export function BaseCard(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class={clsx(css["card-shape"], css["card"], local.class)} {...rest} />
  );
}

export function CardPlaceholder({
  id,
  gridColumn,
}: { gridColumn: number } & CardSlot) {
  return (
    <BaseCard
      id={id}
      class={css["card-placeholder"]}
      style={{
        "grid-row": 1,
        "grid-column": gridColumn,
      }}
    />
  );
}

export function HiddenCard() {
  return <BaseCard class={css["card-hidden"]} />;
}

export function RemovedCard() {
  return <BaseCard class={clsx(css["card-spades"], css["card-K"])} />;
}
