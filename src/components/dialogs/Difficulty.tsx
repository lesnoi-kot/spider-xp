import { Dialog } from "./Dialog";

export function DifficultyDialog({ id }: { id: string }) {
  return (
    <Dialog id={id} title="Difficulty" width={290}>
      <form
        style="display: flex; flex-direction: column; gap: 1.25rem;"
        method="dialog"
      >
        <p>Select the game difficulty level that you want:</p>
        <div style="display: flex; flex-direction: column; margin-left: 1.5em;">
          <div class="field-row" style="gap: 4px;">
            <SuitsRowImage count={1} />
            <input
              id="difficulty-easy"
              type="radio"
              name="difficulty"
              value="easy"
              checked
            />
            <label for="difficulty-easy">Easy: One Suit</label>
          </div>
          <div class="field-row" style="gap: 4px;">
            <SuitsRowImage count={2} />
            <input
              id="difficulty-medium"
              type="radio"
              name="difficulty"
              value="medium"
            />
            <label for="difficulty-medium">Medium: Two Suit</label>
          </div>
          <div class="field-row" style="gap: 4px;">
            <SuitsRowImage count={4} />
            <input
              id="difficulty-difficult"
              type="radio"
              name="difficulty"
              value="difficult"
            />
            <label for="difficulty-difficult">Difficult: Four Suit</label>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 2rem;">
          <button
            type="submit"
            autofocus
            onClick={(event) => {
              const currDialog = document.getElementById(
                id
              ) as HTMLDialogElement;
              const form = event.currentTarget.form;

              if (currDialog && form) {
                const { value } = form.elements.namedItem(
                  "difficulty"
                ) as RadioNodeList;
                currDialog.returnValue = value;
                event.currentTarget.value = value;
                event.currentTarget.form?.reset();
              }
            }}
          >
            OK
          </button>
          <button>Cancel</button>
        </div>
      </form>
    </Dialog>
  );
}

function SuitsRowImage({ count }: { count: number }) {
  const IMAGE_SIZE = 48;
  const SUIT_ICON_SIZE = 12;
  const width = count * SUIT_ICON_SIZE;
  const offset = IMAGE_SIZE - width;
  return (
    <img
      style={`
        width: ${width}px;
        height: 10px;
        object-fit: none;
        object-position: -${offset}px;
        margin-left: ${offset}px;
      `}
      src="/suits.png"
    />
  );
}
