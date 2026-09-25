export type Answer = {
  label: string;
  category: RarityCategory;
  points: number;
};

export type RarityCategory =
  | "plankton"
  | "schooler"
  | "rare"
  | "deep pull"
  | "one in a krillion";

export const rarityPoints: Record<RarityCategory, number> = {
  plankton: 10,
  schooler: 30,
  rare: 60,
  "deep pull": 85,
  "one in a krillion": 100,
};

export type Prompt = {
  question: string;
  answers: Answer[];
};
