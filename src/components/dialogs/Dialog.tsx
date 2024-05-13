import { ComponentProps } from "solid-js";
import clsx from "clsx";

import css from "./styles.module.css";

export type DialogProps = ComponentProps<"dialog"> & {
  title: string;
};

export function Dialog({ title, children, ...rest }: DialogProps) {
  return (
    <dialog class={clsx(css.dialog, "window")} {...rest}>
      <div class="title-bar">
        <div class="title-bar-text">{title}</div>
        <div class="title-bar-controls">
          <form method="dialog">
            <button aria-label="Close"></button>
          </form>
        </div>
      </div>
      <div class="window-body">{children}</div>
    </dialog>
  );
}
