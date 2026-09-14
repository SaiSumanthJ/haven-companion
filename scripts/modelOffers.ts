import { fitsComfortably } from "../src/ports/model/adapters/ollamaSelect.ts";

const GB = 1024 * 1024 * 1024;

export type ModelOffer = {
  pull: string;
  label: string;
  sizeBytes: number;
  note: string;
};

export const MODEL_OFFERS: ModelOffer[] = [
  {
    pull: "gemma3:1b",
    label: "Gemma 3 1B",
    sizeBytes: 0.82 * GB,
    note: "Smallest real chat model. Use this on 8GB machines.",
  },
  {
    pull: "llama3.2:3b",
    label: "Llama 3.2 3B",
    sizeBytes: 2.1 * GB,
    note: "Light and quick. A good spare on small laptops.",
  },
  {
    pull: "gemma3:4b",
    label: "Gemma 3 4B",
    sizeBytes: 3.4 * GB,
    note: "Best everyday companion on 16GB machines.",
  },
  {
    pull: "llama3.1:8b",
    label: "Llama 3.1 8B",
    sizeBytes: 4.9 * GB,
    note: "Stronger talk. Still safe on 16GB when other apps are closed.",
  },
  {
    pull: "gemma3:12b",
    label: "Gemma 3 12B",
    sizeBytes: 8.3 * GB,
    note: "Richer replies. Needs about 24GB of RAM.",
  },
  {
    pull: "gemma3:27b",
    label: "Gemma 3 27B",
    sizeBytes: 17.5 * GB,
    note: "Large local companion. Needs about 32GB of RAM.",
  },
  {
    pull: "gemma4:26b",
    label: "Gemma 4 26B",
    sizeBytes: 28 * GB,
    note: "Strongest public pick here. Needs about 64GB of RAM and ~28GB of disk.",
  },
];

export function offersForMachine(totalMemoryBytes: number): ModelOffer[] {
  return MODEL_OFFERS.filter((offer) => fitsComfortably(offer.sizeBytes, totalMemoryBytes));
}

export function recommendOffers(totalMemoryBytes: number): {
  recommended: ModelOffer | null;
  alternatives: ModelOffer[];
} {
  const fitting = offersForMachine(totalMemoryBytes);
  const recommended = fitting.at(-1) ?? null;
  const alternatives = fitting.filter((offer) => offer.pull !== recommended?.pull).slice(-2);
  return { recommended, alternatives };
}
