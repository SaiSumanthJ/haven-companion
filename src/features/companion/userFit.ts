import type { Personality } from "./personalities";

const PERSONALITY_IDS: Personality[] = [
  "intj", "intp", "entj", "entp", "infj", "infp", "enfj", "enfp",
  "istj", "isfj", "estj", "esfj", "istp", "isfp", "estp", "esfp", "skip",
];

export type AgeBand = "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "skip";
export type Gender = "man" | "woman" | "nonbinary" | "skip";
export type Pronouns = "he" | "she" | "they" | "skip";
export type Place = "us" | "uk" | "ca" | "au" | "elsewhere" | "skip";
export type Household = "alone" | "with-others" | "skip";
export type Hour = "nights" | "days" | "mixed" | "skip";
export type Role = "friend" | "romantic" | "close" | "skip";
export type Pace = "slow" | "match" | "direct" | "skip";
export type Talk = "calm" | "direct" | "playful" | "tease" | "skip";
export type Questions = "they-lead" | "ask-some" | "skip";
export type Care = "words" | "presence" | "notice" | "space" | "affection" | "skip";

export type UserFit = {
  callMe: string;
  personality: Personality;
  ageBand: AgeBand;
  gender: Gender;
  pronouns: Pronouns;
  place: Place;
  household: Household;
  hour: Hour;
  role: Role;
  pace: Pace;
  talk: Talk;
  questions: Questions;
  care: Care;
};

type Choice<T extends string> = { id: T; label: string };

export const AGE_BANDS: Choice<AgeBand>[] = [
  { id: "18-24", label: "18–24" },
  { id: "25-34", label: "25–34" },
  { id: "35-44", label: "35–44" },
  { id: "45-54", label: "45–54" },
  { id: "55+", label: "55+" },
  { id: "skip", label: "Skip" },
];

export const GENDERS: Choice<Gender>[] = [
  { id: "man", label: "Man" },
  { id: "woman", label: "Woman" },
  { id: "nonbinary", label: "Non-binary" },
  { id: "skip", label: "Skip" },
];

export const PRONOUNS: Choice<Pronouns>[] = [
  { id: "he", label: "He / him" },
  { id: "she", label: "She / her" },
  { id: "they", label: "They / them" },
  { id: "skip", label: "Skip" },
];

export const PLACES: Choice<Place>[] = [
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "au", label: "Australia" },
  { id: "elsewhere", label: "Elsewhere" },
  { id: "skip", label: "Skip" },
];

export const HOUSEHOLDS: Choice<Household>[] = [
  { id: "alone", label: "Mostly alone" },
  { id: "with-others", label: "Live with others" },
  { id: "skip", label: "Skip" },
];

export const HOURS: Choice<Hour>[] = [
  { id: "nights", label: "Nights" },
  { id: "days", label: "Days" },
  { id: "mixed", label: "Mixed" },
  { id: "skip", label: "Skip" },
];

export const ROLES: Choice<Role>[] = [
  { id: "friend", label: "Friend" },
  { id: "close", label: "Closer than a friend" },
  { id: "romantic", label: "Romantic" },
  { id: "skip", label: "Skip" },
];

export const PACES: Choice<Pace>[] = [
  { id: "slow", label: "Slow" },
  { id: "match", label: "Match my pace" },
  { id: "direct", label: "Direct" },
  { id: "skip", label: "Skip" },
];

export const TALKS: Choice<Talk>[] = [
  { id: "calm", label: "Calm" },
  { id: "direct", label: "Straight" },
  { id: "playful", label: "Playful" },
  { id: "tease", label: "Warm tease" },
  { id: "skip", label: "Skip" },
];

export const QUESTIONS: Choice<Questions>[] = [
  { id: "they-lead", label: "I lead" },
  { id: "ask-some", label: "Ask a little" },
  { id: "skip", label: "Skip" },
];

export const CARES: Choice<Care>[] = [
  { id: "words", label: "Hear it said" },
  { id: "presence", label: "Just stay with me" },
  { id: "notice", label: "Notice the small things" },
  { id: "space", label: "Leave me room" },
  { id: "affection", label: "Affectionate words" },
  { id: "skip", label: "Skip" },
];

export function emptyFit(): UserFit {
  return {
    callMe: "", personality: "skip", ageBand: "skip", gender: "skip", pronouns: "skip",
    place: "skip", household: "skip", hour: "skip", role: "skip", pace: "skip",
    talk: "skip", questions: "skip", care: "skip",
  };
}

function pick<T extends string>(value: unknown, allowed: readonly T[]): T {
  const fallback = "skip" as T;
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parseFit(raw: unknown): UserFit {
  const src = raw && typeof raw === "object" ? (raw as Partial<UserFit>) : {};
  return {
    callMe: typeof src.callMe === "string" ? src.callMe.trim().slice(0, 40) : "",
    personality: pick(src.personality, PERSONALITY_IDS),
    ageBand: pick(src.ageBand, AGE_BANDS.map((item) => item.id)),
    gender: pick(src.gender, GENDERS.map((item) => item.id)),
    pronouns: pick(src.pronouns, PRONOUNS.map((item) => item.id)),
    place: pick(src.place, PLACES.map((item) => item.id)),
    household: pick(src.household, HOUSEHOLDS.map((item) => item.id)),
    hour: pick(src.hour, HOURS.map((item) => item.id)),
    role: pick(src.role, ROLES.map((item) => item.id)),
    pace: pick(src.pace, PACES.map((item) => item.id)),
    talk: pick(src.talk, TALKS.map((item) => item.id)),
    questions: pick(src.questions, QUESTIONS.map((item) => item.id)),
    care: pick(src.care, CARES.map((item) => item.id)),
  };
}
