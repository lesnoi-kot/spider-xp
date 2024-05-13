import { Dialog, DialogProps } from "./Dialog";

export function AboutDialog(props: Omit<DialogProps, "title">) {
  return (
    <Dialog {...props} title="About Spider">
      <img src="/splash.png" />

      <form style="text-align: center; margin-top: 1em;" method="dialog">
        <button autofocus>OK</button>
      </form>
    </Dialog>
  );
}
