const QUIET_MS = 1100;
const MAX_MS = 28_000;
const SPEECH_RMS = 0.045;

export function watchTalkEnd(stream: MediaStream, onQuiet: () => void): () => void {
  const audio = new AudioContext();
  const source = audio.createMediaStreamSource(stream);
  const analyser = audio.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let heard = false;
  let quietAt = 0;
  const started = Date.now();
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    onQuiet();
  }

  const id = window.setInterval(() => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const sample of data) {
      const norm = (sample - 128) / 128;
      sum += norm * norm;
    }
    const rms = Math.sqrt(sum / data.length);
    const now = Date.now();
    if (rms > SPEECH_RMS) {
      heard = true;
      quietAt = 0;
    } else if (heard) {
      if (!quietAt) quietAt = now;
      if (now - quietAt >= QUIET_MS) finish();
    }
    if (now - started >= MAX_MS) finish();
  }, 80);

  return () => {
    done = true;
    window.clearInterval(id);
    void audio.close();
  };
}
