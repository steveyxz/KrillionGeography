import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
  rarityPoints,
  type Answer,
  type Prompt,
  type RarityCategory,
} from "@/lib/sets";

const resourcesDirectory = path.join(process.cwd(), "resources");

function isRarityCategory(value: unknown): value is RarityCategory {
  return typeof value === "string" && value in rarityPoints;
}

function parseQuestionSet(value: unknown, source: string): Prompt[] {
  if (!Array.isArray(value) || value.length !== 7) {
    throw new Error(`${source} must contain exactly 7 questions`);
  }

  return value.map((prompt, promptIndex) => {
    if (
      !prompt ||
      typeof prompt !== "object" ||
      typeof (prompt as Prompt).question !== "string" ||
      !Array.isArray((prompt as Prompt).answers) ||
      (prompt as Prompt).answers.length === 0
    ) {
      throw new Error(
        `${source} has an invalid question at index ${promptIndex}`,
      );
    }

    const typedPrompt = prompt as Prompt;
    const answers = typedPrompt.answers.map((answer, answerIndex): Answer => {
      if (
        !answer ||
        typeof answer !== "object" ||
        typeof answer.label !== "string" ||
        !isRarityCategory(answer.category) ||
        typeof answer.points !== "number" ||
        answer.points !== rarityPoints[answer.category]
      ) {
        throw new Error(
          `${source} has an invalid answer at question ${promptIndex}, index ${answerIndex}`,
        );
      }
      return answer;
    });

    return { ...typedPrompt, answers };
  });
}

async function readQuestionSet(id: string): Promise<Prompt[]> {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("Invalid question-set id");
  const source = path.join(resourcesDirectory, `${id}.json`);
  const contents = await readFile(source, "utf8");
  return parseQuestionSet(JSON.parse(contents) as unknown, source);
}

export async function listQuestionSetIds() {
  const files = await readdir(resourcesDirectory);
  return files
    .map((file) => /^([A-Za-z0-9_-]+)\.json$/.exec(file)?.[1])
    .filter((id): id is string => Boolean(id));
}

export const getQuestionSet = unstable_cache(
  async (id: string) => readQuestionSet(id),
  ["question-set"],
  { revalidate: 60, tags: ["question-sets"] },
);

export { parseQuestionSet };
