import type { Answer, Prompt } from "@/lib/sets";

export type Phase = "intro" | "playing" | "complete";

export type PlayedAnswer = {
  prompt: Prompt;
  answer: Answer | null;
  text: string;
};
