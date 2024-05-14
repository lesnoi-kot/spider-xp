export const dealAudio = new Audio("/sounds/deal.wav");
export const hintAudio = new Audio("/sounds/hint.wav");
export const moveAudio = new Audio("/sounds/move.wav");
export const noHintAudio = new Audio("/sounds/no_hint.wav");
export const selectAudio = new Audio("/sounds/select.wav");
export const winAudio = new Audio("/sounds/win.wav");

export function loopedDealSound(repeats: number) {
  dealAudio.loop = true;
  setTimeout(() => {
    dealAudio.pause();
    dealAudio.currentTime = 0;
    dealAudio.loop = false;
  }, dealAudio.duration * repeats * 1000);

  dealAudio.play();
}
