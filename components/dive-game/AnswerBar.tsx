import { RadarTimer } from "./GameHud";

export function AnswerBar({
  seconds,
  answerText,
  submitted,
  didYouMean,
  lookupError,
  onAnswerChange,
  onSubmit,
}: {
  seconds: number;
  answerText: string;
  submitted: boolean;
  didYouMean: string | null;
  lookupError: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="answer-bar">
      <RadarTimer seconds={seconds} />
      <form
        className="answer-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="answer-label" htmlFor="answer">
          YOUR ANSWER
        </label>
        <div className="answer-input-row">
          <input
            id="answer"
            value={answerText}
            onChange={(event) => onAnswerChange(event.target.value)}
            autoComplete="off"
            autoFocus
            disabled={submitted}
          />
          {!submitted && (
            <button className="submit-button" type="submit">
              SUBMIT ↵
            </button>
          )}
        </div>
        {didYouMean && (
          <span className="did-you-mean">Did you mean, {didYouMean}?</span>
        )}
        {lookupError && (
          <span className="lookup-error">
            ERROR / NOT IN DATABASE — TRY ANOTHER ANSWER
          </span>
        )}
      </form>
    </div>
  );
}
