"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { Answer, Prompt, RarityCategory } from "@/lib/sets";

type Phase = "intro" | "playing" | "complete";
type PlayedAnswer = {
  prompt: Prompt;
  answer: Answer | null;
  text: string;
};

const depthFacts = [
  { metres: 0, fact: "Sunlight reaches the surface layer." },
  { metres: 200, fact: "The twilight zone begins here." },
  { metres: 332, fact: "Deepest scuba dive ever recorded." },
  { metres: 600, fact: "Emperor penguins can dive this deep." },
  { metres: 1000, fact: "Most sunlight has disappeared." },
  { metres: 3800, fact: "The Titanic rests in the abyss." },
];

const rarityPresentation: Record<
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

export function DiveGame({ questionSet }: { questionSet: Prompt[] }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [revealedAnswer, setRevealedAnswer] = useState<Answer | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [pendingCorrection, setPendingCorrection] = useState<Answer | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timedOutAnswer, setTimedOutAnswer] = useState<string | null>(null);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [seconds, setSeconds] = useState(25);
  const answerTextRef = useRef("");
  const [playedAnswers, setPlayedAnswers] = useState<PlayedAnswer[]>([]);

  const prompt = questionSet[questionIndex];
  const completedQuestions = playedAnswers.length;

  useEffect(() => {
    if (phase !== "playing" || submitted || timerExpired) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerExpired(true);
          submitAnswer(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, questionIndex, submitted, timerExpired]);

  function begin() {
    setPhase("playing");
    setQuestionIndex(0);
    setDepth(0);
    setScore(0);
    setAnswerText("");
    answerTextRef.current = "";
    setRevealedAnswer(null);
    setLookupError(false);
    setDidYouMean(null);
    setPendingCorrection(null);
    setSubmitted(false);
    setTimerExpired(false);
    setTimedOutAnswer(null);
    setSeconds(25);
    setPlayedAnswers([]);
  }

  function submitAnswer(fromTimer = false) {
    if (submitted) return;
    const submittedText = fromTimer ? answerTextRef.current : answerText;
    const normalizedInput = normalizeAnswer(submittedText);
    if (!normalizedInput) {
      if (fromTimer) {
        setTimedOutAnswer(submittedText);
        setSubmitted(true);
        recordPlayedAnswer({ prompt, answer: null, text: submittedText });
      } else setLookupError(true);
      return;
    }
    const rawInput = normalizeRawAnswer(submittedText);
    const answer =
      prompt.answers.find(
        (item) => normalizeRawAnswer(item.label) === rawInput,
      ) ?? null;
    const fuzzyAnswer =
      answer ??
      prompt.answers.find((item) => isCloseAnswer(submittedText, item.label));
    const wasAutocorrected = !answer && Boolean(fuzzyAnswer);
    if (!fuzzyAnswer) {
      if (fromTimer) {
        setTimedOutAnswer(submittedText);
        setSubmitted(true);
        recordPlayedAnswer({ prompt, answer: null, text: submittedText });
      } else setLookupError(true);
      return;
    }
    if (wasAutocorrected) {
      if (!fromTimer && pendingCorrection?.label !== fuzzyAnswer.label) {
        setAnswerText(fuzzyAnswer.label);
        answerTextRef.current = fuzzyAnswer.label;
        setDidYouMean(fuzzyAnswer.label);
        setPendingCorrection(fuzzyAnswer);
        setLookupError(false);
        return;
      }
      setAnswerText(fuzzyAnswer.label);
      answerTextRef.current = fuzzyAnswer.label;
      setDidYouMean(null);
      setPendingCorrection(null);
    } else {
      setDidYouMean(null);
      setPendingCorrection(null);
    }
    setRevealedAnswer(fuzzyAnswer);
    setTimedOutAnswer(null);
    setLookupError(false);
    setSubmitted(true);
    setDepth((current) => current + fuzzyAnswer.points * 10);
    setScore((current) => current + fuzzyAnswer.points);
    recordPlayedAnswer({
      prompt,
      answer: fuzzyAnswer,
      text: fuzzyAnswer.label,
    });
  }

  function recordPlayedAnswer(entry: PlayedAnswer) {
    setPlayedAnswers((current) => {
      const next = [...current];
      next[questionIndex] = entry;
      return next;
    });
  }

  function nextQuestion() {
    window.setTimeout(() => {
      if (questionIndex === questionSet.length - 1) {
        setPhase("complete");
      } else {
        setQuestionIndex((current) => current + 1);
        setAnswerText("");
        answerTextRef.current = "";
        setRevealedAnswer(null);
        setLookupError(false);
        setDidYouMean(null);
        setPendingCorrection(null);
        setSubmitted(false);
        setTimerExpired(false);
        setTimedOutAnswer(null);
        setSeconds(25);
      }
    }, 250);
  }

  return (
    <main
      className={`game-shell phase-${phase} ${submitted ? `answer-submitted rarity-depth-${revealedAnswer?.points ?? 0}` : ""}`}
      style={
        { "--rail-shift": `${Math.min(depth * 0.8, 2800)}px` } as CSSProperties
      }
    >
      <header className="topbar">
        <div className="wordmark">
          K<span>R</span>ILLION
        </div>
        <nav className="top-actions" aria-label="Game navigation">
          <button
            className="how-to-play-button"
            type="button"
            onClick={() => setHowToPlayOpen(true)}
          >
            HOW TO PLAY
          </button>
        </nav>
      </header>

      {phase === "intro" && <IntroScreen onBegin={begin} />}
      {phase === "playing" && (
        <section className="game-layout" aria-live="polite">
          <div className="dive-hud">
            <div className="hud-card">
              <span>DEPTH</span>
              <strong>{depth.toLocaleString()}m</strong>
            </div>
            <div className="hud-rarity">
              <div className="rarity-meter">
                {questionSet.map((item, index) => (
                  <i
                    key={index}
                    className={index < completedQuestions ? "lit" : ""}
                  />
                ))}
              </div>
            </div>
            <div className="hud-card score-card">
              <span>SCORE</span>
              <strong>{score}</strong>
            </div>
          </div>
          <aside className="intro">
            <div className="eyebrow">THE DAILY DIVE</div>
            <h1>Rare answers sink deeper.</h1>
            <p className="intro-copy">
              Seven prompts. Twenty-five seconds each. Find the answer nobody
              else thought of.
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
                onNext={nextQuestion}
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
              <button
                className="descend-button"
                type="button"
                onClick={nextQuestion}
              >
                {questionIndex === questionSet.length - 1
                  ? "FINISH"
                  : "DESCEND"}{" "}
                ▼
              </button>
            </section>
          )}
          {(!submitted || didYouMean) && (
            <div className="answer-bar">
              <RadarTimer seconds={seconds} />
              <form
                className="answer-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitAnswer();
                }}
              >
                <label className="answer-label" htmlFor="answer">
                  YOUR ANSWER
                </label>
                <div className="answer-input-row">
                  <input
                    id="answer"
                    value={answerText}
                    onChange={(event) => {
                      answerTextRef.current = event.target.value;
                      setAnswerText(event.target.value);
                      setDidYouMean(null);
                      setPendingCorrection(null);
                    }}
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
                  <span className="did-you-mean">
                    Did you mean, {didYouMean}?
                  </span>
                )}
                {lookupError && (
                  <span className="lookup-error">
                    ERROR / NOT IN DATABASE — TRY ANOTHER ANSWER
                  </span>
                )}
              </form>
            </div>
          )}
          <aside className="dive-readout">
            <div className="readout-label">CURRENT DEPTH</div>
            <div className="depth">
              {depth}
              <span>m</span>
            </div>
            <div className="depth-line" />
            <div className="readout-stat">
              <span>SCORE</span>
              <strong>{String(score).padStart(4, "0")}</strong>
            </div>
            <div className="readout-stat">
              <span>RARITY</span>
              <strong>
                {revealedAnswer
                  ? `${revealedAnswer.category.toUpperCase()}`
                  : "--"}
              </strong>
            </div>
            <div className="rarity-legend" aria-label="Rarity levels">
              {(
                [
                  "plankton",
                  "schooler",
                  "rare",
                  "deep pull",
                  "one in a krillion",
                ] as RarityCategory[]
              ).map((category) => (
                <div key={category}>
                  <RarityIcon category={category} />
                  <span>{category}</span>
                </div>
              ))}
            </div>
          </aside>
          <div className="krill-marker" aria-hidden="true">
            ✺
          </div>
          <div className="depth-rail" aria-hidden="true">
            <div className="depth-window">
              <div className="depth-track">
                <div className="depth-facts">
                  {depthFacts.map((item) => (
                    <div
                      key={item.metres}
                      style={{ top: `${(item.metres / 4000) * 100}%` }}
                    >
                      <strong>{item.metres.toLocaleString()}m</strong>
                      <span>{item.fact}</span>
                    </div>
                  ))}
                </div>
                <div className="depth-scale">
                  {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000].map(
                    (metres) => (
                      <div
                        key={metres}
                        style={{ top: `${(metres / 4000) * 100}%` }}
                      >
                        <i />
                        <span>{metres}m</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {phase === "complete" && (
        <ResultScreen
          depth={depth}
          score={score}
          playedAnswers={playedAnswers}
          questionSet={questionSet}
          onRestart={begin}
        />
      )}
      {howToPlayOpen && <HowToPlay onClose={() => setHowToPlayOpen(false)} />}
    </main>
  );
}

function RadarTimer({ seconds }: { seconds: number }) {
  const progress = `${((25 - seconds) / 25) * 360}deg`;
  return (
    <div
      className="radar-timer"
      style={{ "--radar-progress": progress } as CSSProperties}
      aria-label={`${seconds} seconds remaining`}
    >
      <span className="radar-sweep" />
      <span className="radar-dot" />
      <strong>{seconds}</strong>
    </div>
  );
}

const ignoredAnswerWords = new Set(["the", "a", "an", "in"]);

function normalizeRawAnswer(value: string) {
  return value.trim().toLowerCase().split(/\s+/).join(" ");
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !ignoredAnswerWords.has(word))
    .join(" ");
}

function isCloseAnswer(input: string, candidate: string) {
  const inputWords = normalizeAnswer(input).split(/\s+/).filter(Boolean);
  const candidateWords = normalizeAnswer(candidate)
    .split(/\s+/)
    .filter(Boolean);
  return (
    inputWords.length === candidateWords.length &&
    inputWords.every(
      (word, index) => editDistance(word, candidateWords[index]) <= 2,
    )
  );
}

function editDistance(left: string, right: string) {
  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    for (let index = 0; index < current.length; index += 1)
      previous[index] = current[index];
  }
  return previous[right.length];
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="how-to-play-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <section className="how-to-play-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close how to play"
        >
          ×
        </button>
        <div className="eyebrow">DIVE BRIEFING</div>
        <h2 id="how-to-play-title">HOW TO PLAY</h2>
        <p>
          Answer each prompt before the radar runs out. The rarer your answer,
          the further the krill sinks.
        </p>
        <div className="how-to-play-rules">
          <span>01</span>
          <strong>TYPE AN ANSWER</strong>
          <small>Answers must be in the current set.</small>
          <span>02</span>
          <strong>CHASE RARITY</strong>
          <small>
            Plankton, schooler, rare, deep pull, or one in a krillion.
          </small>
          <span>03</span>
          <strong>DESCEND</strong>
          <small>Every point travels ten metres.</small>
        </div>
      </section>
    </div>
  );
}

function SubmissionReveal({
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

function IntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="start-screen">
      <div className="pixel-boat" aria-hidden="true">
        <span className="boat-flag" />
        <span className="boat-cabin" />
        <span className="boat-hull" />
      </div>
      <div className="eyebrow">THE ENDLESS DIVE</div>
      <h1>
        <span className="glitch-title" data-text="KRILLION">
          KRILLION
        </span>
      </h1>
      <p className="start-tagline">
        dive after dive · rarer answers sink deeper
      </p>
      <span className="start-depth-line">OPEN THE DIVE LOG ∞</span>
      <button className="primary-button" onClick={onBegin}>
        ▼ &nbsp; BEGIN DESCENT &nbsp; ▼
      </button>
    </section>
  );
}

function ResultScreen({
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

function RarityIcon({ category }: { category: RarityCategory }) {
  return (
    <span
      className={`rarity-icon rarity-${category.replace(/ /g, "-")}`}
      aria-hidden="true"
    />
  );
}
