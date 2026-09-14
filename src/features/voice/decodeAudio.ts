function toMono(buffer: AudioBuffer): AudioBuffer {
  if (buffer.numberOfChannels === 1) return buffer;
  const length = buffer.length;
  const mono = new OfflineAudioContext(1, length, buffer.sampleRate).createBuffer(
    1,
    length,
    buffer.sampleRate,
  );
  const out = mono.getChannelData(0);
  const mix = 1 / buffer.numberOfChannels;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      out[i] += data[i] * mix;
    }
  }
  return mono;
}

export async function blobToWhisperSamples(
  blob: Blob,
  maxSeconds = 0,
): Promise<Float32Array> {
  const bytes = await blob.arrayBuffer();
  const decodeCtx = new AudioContext();
  const decoded = await decodeCtx.decodeAudioData(bytes.slice(0));
  await decodeCtx.close();
  const mono = toMono(decoded);
  const frames = Math.max(1, Math.ceil(mono.duration * 16000));
  const offline = new OfflineAudioContext(1, frames, 16000);
  const source = offline.createBufferSource();
  source.buffer = mono;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);
  if (maxSeconds > 0 && samples.length > maxSeconds * 16000) {
    return samples.slice(samples.length - Math.floor(maxSeconds * 16000));
  }
  return samples;
}

export function pickRecorderMime(): string | undefined {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
}
