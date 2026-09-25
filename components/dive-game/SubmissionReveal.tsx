import type { Answer } from "@/lib/sets";
import { rarityPresentation } from "./data";

export function SubmissionReveal({
  answer,
  onNext,
  isLast,
}: {
  answer: Answer;
  onNext: () => void;
  isLast: boolean;
}) {
  const presentation = rarityPresentation[answer.category];
  return (
    <section className="submission-reveal" aria-live="assertive">
      <img className="reveal-creature" src={presentation.image} alt="" />
      <div
        className={`reveal-category reveal-${answer.category.replace(/ /g, "-")}`}
      >
        {presentation.title}
      </div>
      <div className="reveal-answer">“{answer.label}”</div>
      <div className="reveal-score">
        +{answer.points} PTS <span>•</span> sink {answer.points * 10}m
      </div>
      <p className="reveal-caption">{presentation.copy}</p>
      <button className="descend-button" type="button" onClick={onNext}>
        {isLast ? "FINISH" : "DESCEND"} ▼
      </button>
    </section>
  );
}
