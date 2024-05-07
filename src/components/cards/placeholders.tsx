import clsx from "clsx";

import css from "./styles.module.css";

export function CardPlaceholder({ column }: { column: number }) {
  return (
    <div
      class={clsx(css["card-shape"], css["card"], css["card-placeholder"])}
      style={{
        "grid-row": `1`,
        "grid-column": `${column}`,
      }}
    />
  );
}

type HiddenCardProps = {};

export function HiddenCard({}: HiddenCardProps) {
  return (
    <div class={clsx(css["card-shape"], css["card"], css["card-hidden"])} />
  );
}
