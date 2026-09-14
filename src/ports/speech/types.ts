export const WHISPER_MODEL = "Xenova/whisper-tiny.en";
export const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

export type WhisperProgress = {
  status: "idle" | "downloading" | "ready" | "error";
  percent: number;
  detail: string;
};

export type SpeakProgress = WhisperProgress;
