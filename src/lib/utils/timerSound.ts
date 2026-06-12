declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type ToneOptions = {
  frequency: number;
  startTime: number;
  duration: number;
  volume?: number;
};

export function playTimerDing(): void {
  try {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;

    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();

    function playTone({ frequency, startTime, duration, volume = 0.22 }: ToneOptions): void {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.05);
    }

    const startTime = context.currentTime;

    playTone({
      frequency: 880,
      startTime,
      duration: 0.45,
    });

    playTone({
      frequency: 659.25,
      startTime: startTime + 0.3,
      duration: 0.55,
    });
  } catch {
    // O áudio é opcional e pode ser bloqueado pelo navegador
    // até que exista uma interação do usuário.
  }
}
