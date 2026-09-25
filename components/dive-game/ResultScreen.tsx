import type { Prompt, RarityCategory } from "@/lib/sets";
import type { PlayedAnswer } from "./types";
import { rarityPresentation } from "./data";

export function ResultScreen({
  depth,
  score,
  playedAnswers,
  questionSet,
  onRestart,
}: {
  depth: number;
  score: number;
  playedAnswers: PlayedAnswer[];
  questionSet: Prompt[];
  onRestart: () => void;
}) {
  const overall = getOverallRarity(score);
  return (
    <section className="result-screen">
      <header className="results-header">
        <div>
          <div className="eyebrow">KRILLION / DIVE COMPLETE</div>
          <strong>{score}</strong>
          <span>+{depth.toLocaleString()}m</span>
        </div>
        <div className="overall-rarity">
          <img src={rarityPresentation[overall.category].image} alt="" />
          <b>{overall.title}</b>
          <small>{overall.range}</small>
        </div>
      </header>
      <div className="results-body">
        <div className="results-table-heading">
          <span>THE CATCH</span>
          <span>ANSWER / RARITY</span>
        </div>
        {questionSet.map((prompt, index) => {
          const entry = playedAnswers[index] ?? {
            prompt,
            answer: null,
            text: "",
          };
          return (
            <details className="question-result" key={index}>
              <summary>
                <span className="question-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="question-copy">
                  <small>{entry.prompt.question}</small>
                  <strong>
                    {entry.answer?.label ||
                      `Nothing landed: ${entry.text || "(empty)"}`}
                  </strong>
                </span>
                <span className="question-points">
                  {entry.answer ? `+${entry.answer.points}` : "0"}
                </span>
              </summary>
              <div className="accepted-answers">
                {[...entry.prompt.answers]
                  .sort(
                    (left, right) =>
                      left.points - right.points ||
                      left.label.localeCompare(right.label),
                  )
                  .map((answer) => (
                    <div key={answer.label}>
                      <img
                        src={rarityPresentation[answer.category].image}
                        alt=""
                      />
                      <span>{answer.label}</span>
                      <b
                        className={`points-${answer.category.replace(/ /g, "-")}`}
                      >
                        {answer.points}
                      </b>
                    </div>
                  ))}
              </div>
            </details>
          );
        })}
      </div>
      <button className="primary-button" onClick={onRestart}>
        DIVE AGAIN ↻
      </button>
    </section>
  );
}

function getOverallRarity(score: number) {
  if (score >= 450)
    return {
      category: "one in a krillion" as RarityCategory,
      title: "ONE IN A KRILLION",
      range: "450+",
    };
  if (score >= 351)
    return {
      category: "deep pull" as RarityCategory,
      title: "DEEP CUT",
      range: "351-449",
    };
  if (score >= 251)
    return {
      category: "rare" as RarityCategory,
      title: "RARE",
      range: "251-350",
    };
  if (score >= 151)
    return {
      category: "schooler" as RarityCategory,
      title: "SCHOOLER",
      range: "151-250",
    };
  return {
    category: "plankton" as RarityCategory,
    title: "PLANKTON",
    range: "0-150",
  };
}
