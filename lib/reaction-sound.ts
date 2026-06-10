import type { UpdateReactionType } from "./types/update";

const FREQUENCIES: Record<UpdateReactionType, number> = {
  like: 587,
  love: 784,
  insightful: 988,
};

export function playReactionSound(type: UpdateReactionType, added: boolean) {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = FREQUENCIES[type];
    gain.gain.value = added ? 0.12 : 0.08;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(added ? 0.12 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (added ? 0.18 : 0.12));

    osc.start(now);
    osc.stop(now + (added ? 0.18 : 0.12));
    osc.onended = () => void ctx.close();
  } catch {
    // Audio is optional
  }
}
