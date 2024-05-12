import { ParentProps, Ref } from "solid-js";
import clsx from "clsx";

import css from "./styles.module.css";

export type DialogProps = ParentProps<{
  id?: string;
  title: string;
  width?: number;
  ref?: Ref<HTMLDialogElement>;
}>;

export function Dialog({ id, title, width, ref, children }: DialogProps) {
  return (
    <dialog
      id={id}
      ref={ref}
      class={clsx(css.dialog, "window")}
      style={{
        width: width ? `${width}px` : "fit-content",
      }}
    >
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
