import { Dialog, DialogProps } from "./Dialog";

export function GameOverDialog(props: Omit<DialogProps, "title" | "style">) {
  return (
    <Dialog
      {...props}
      title="Game Over"
      style={{
        width: "250px",
        inset: "auto 0 0 auto",
        margin: "4px",
      }}
    >
      <form
        style="display: flex; flex-direction: column; gap: .5em;"
        method="dialog"
      >
        <p>Congratulations, you won!</p>
        <p>Do you want to start another game?</p>
        <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1em;">
          <button type="submit" value="yes" autofocus>
            Yes
          </button>
          <button type="submit" value="no">
            No
          </button>
        </div>
      </form>
    </Dialog>
  );
}
