export type Personality =
  | "intj"
  | "intp"
  | "entj"
  | "entp"
  | "infj"
  | "infp"
  | "enfj"
  | "enfp"
  | "istj"
  | "isfj"
  | "estj"
  | "esfj"
  | "istp"
  | "isfp"
  | "estp"
  | "esfp"
  | "skip";

type Choice = { id: Personality; label: string };

export const PERSONALITY_GROUPS: Array<{ title: string; options: Choice[] }> = [
  {
    title: "Analysts",
    options: [
      { id: "intj", label: "INTJ · Architect" },
      { id: "intp", label: "INTP · Logician" },
      { id: "entj", label: "ENTJ · Commander" },
      { id: "entp", label: "ENTP · Debater" },
    ],
  },
  {
    title: "Diplomats",
    options: [
      { id: "infj", label: "INFJ · Advocate" },
      { id: "infp", label: "INFP · Mediator" },
      { id: "enfj", label: "ENFJ · Protagonist" },
      { id: "enfp", label: "ENFP · Campaigner" },
    ],
  },
  {
    title: "Sentinels",
    options: [
      { id: "istj", label: "ISTJ · Logistician" },
      { id: "isfj", label: "ISFJ · Defender" },
      { id: "estj", label: "ESTJ · Executive" },
      { id: "esfj", label: "ESFJ · Consul" },
    ],
  },
  {
    title: "Explorers",
    options: [
      { id: "istp", label: "ISTP · Virtuoso" },
      { id: "isfp", label: "ISFP · Adventurer" },
      { id: "estp", label: "ESTP · Entrepreneur" },
      { id: "esfp", label: "ESFP · Entertainer" },
    ],
  },
];

export const PERSONALITIES: Choice[] = [
  ...PERSONALITY_GROUPS.flatMap((group) => group.options),
  { id: "skip", label: "Skip" },
];
