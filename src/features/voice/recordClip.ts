import { pickRecorderMime } from "@/features/voice/decodeAudio";

export async function openMicRecorder(): Promise<{
  recorder: MediaRecorder;
  stream: MediaStream;
  chunks: Blob[];
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const mime = pickRecorderMime();
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();
  return { recorder, stream, chunks };
}

export function stopRecorder(recorder: MediaRecorder, chunks: Blob[]): Promise<Blob> {
  return new Promise((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    };
    if (recorder.state !== "inactive") recorder.stop();
    else resolve(new Blob(chunks));
  });
}
