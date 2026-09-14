import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@huggingface/transformers",
    "kokoro-js",
    "onnxruntime-node",
    "phonemizer",
    "sharp",
    "unpdf",
    "mammoth",
  ],
};

export default nextConfig;
