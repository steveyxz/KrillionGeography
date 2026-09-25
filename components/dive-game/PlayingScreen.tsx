import type { Answer, Prompt } from "@/lib/sets";
import { AnswerBar } from "./AnswerBar";
import { DiveHud, DiveReadout, DepthRail } from "./GameHud";
import { SubmissionReveal } from "./SubmissionReveal";

export function PlayingScreen({
  questionSet,
  questionIndex,
  prompt,
  completedQuestions,
  depth,
  score,
  submitted,
  revealedAnswer,
  timedOutAnswer,
  answerText,
  seconds,
  didYouMean,
  lookupError,
  onAnswerChange,
  onSubmit,
  onNext,
}: {
  questionSet: Prompt[];
  questionIndex: number;
  prompt: Prompt;
  completedQuestions: number;
  depth: number;
  score: number;
  submitted: boolean;
  revealedAnswer: Answer | null;
  timedOutAnswer: string | null;
  answerText: string;
  seconds: number;
  didYouMean: string | null;
  lookupError: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}) {
  return (
    <section className="game-layout" aria-live="polite">
      <DiveHud
        questionSet={questionSet}
        completedQuestions={completedQuestions}
        score={score}
        depth={depth}
      />
      <aside className="intro">
        <div className="eyebrow">THE DAILY DIVE</div>
        <h1>Rare answers sink deeper.</h1>
        <p className="intro-copy">
          Seven prompts. Twenty-five seconds each. Find the answer nobody else
          thought of.
        </p>
        <div className="rule" />
        <p className="microcopy">
          THE WATER IS COLD
          <br />
          THE LIGHT IS FADING
          <br />
          DESCEND WITH CARE
        </p>
      </aside>
      <section className={`play-area ${submitted ? "reveal-area" : ""}`}>
        {submitted && revealedAnswer ? (
          <SubmissionReveal
            answer={revealedAnswer}
            onNext={onNext}
            isLast={questionIndex === questionSet.length - 1}
          />
        ) : (
          <article className="prompt-card" key={questionIndex}>
            <div className="prompt-category">DIVE DEEP</div>
            <h2>{prompt.question}</h2>
          </article>
        )}
      </section>
      {submitted && timedOutAnswer !== null && (
        <section className="timeout-reveal" aria-live="assertive">
          <span>NOTHING LANDED:</span>
          <strong>{timedOutAnswer || "(empty)"}</strong>
          <button className="descend-button" type="button" onClick={onNext}>
            {questionIndex === questionSet.length - 1 ? "FINISH" : "DESCEND"} ▼
          </button>
        </section>
      )}
      {(!submitted || didYouMean) && (
        <AnswerBar
          seconds={seconds}
          answerText={answerText}
          submitted={submitted}
          didYouMean={didYouMean}
          lookupError={lookupError}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
        />
      )}
      <DiveReadout
        depth={depth}
        score={score}
        revealedAnswer={revealedAnswer}
      />
      <div className="krill-marker" aria-hidden="true">
        ✺
      </div>
      <DepthRail />
    </section>
  );
}
