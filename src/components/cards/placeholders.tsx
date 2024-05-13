import { splitProps, type ComponentProps } from "solid-js";
import clsx from "clsx";

import { Card as CardModel, CardSlot } from "@/models";

import css from "./styles.module.css";

export function BaseCard(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div {...rest} class={clsx(css["card-shape"], css["card"], local.class)} />
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

export function Card(props: ComponentProps<typeof BaseCard> & CardModel) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <BaseCard
      {...rest}
      class={clsx(
        css[`card-${props.suit}`],
        css[`card-${props.rank}`],
        local.class
      )}
    />
  );
}
