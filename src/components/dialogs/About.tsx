import { Dialog } from "./Dialog";

export function AboutDialog({ id }: { id?: string }) {
  return (
    <Dialog title="About Spider" id={id}>
      <img src="/splash.png" />

      <form style="text-align: center; margin-top: 1em;" method="dialog">
        <button autofocus>OK</button>
      </form>
    </Dialog>
  );
}
