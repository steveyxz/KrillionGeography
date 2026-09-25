import type { RarityCategory } from "@/lib/sets";

export const depthFacts = [
  { metres: 0, fact: "Sunlight reaches the surface layer." },
  { metres: 200, fact: "The twilight zone begins here." },
  { metres: 332, fact: "Deepest scuba dive ever recorded." },
  { metres: 600, fact: "Emperor penguins can dive this deep." },
  { metres: 1000, fact: "Most sunlight has disappeared." },
  { metres: 3800, fact: "The Titanic rests in the abyss." },
];

export const rarityPresentation: Record<
  RarityCategory,
  { title: string; copy: string; image: string }
> = {
  plankton: {
    title: "PLANKTON",
    copy: "The answer everyone blurts out.",
    image: "/images/plankton.png",
  },
  schooler: {
    title: "SCHOOLER",
    copy: "Solid - swims with the school.",
    image: "/images/schooler.png",
  },
  rare: {
    title: "RARE",
    copy: "Genuinely uncommon. Nice pull.",
    image: "/images/rare.png",
  },
  "deep pull": {
    title: "DEEP CUT",
    copy: "True obscurity. Few go this deep.",
    image: "/images/deep_cut.png",
  },
  "one in a krillion": {
    title: "ONE IN A KRILLION",
    copy: "Almost nothing reaches this far.",
    image: "/images/one_in_a_krillion.png",
  },
};
