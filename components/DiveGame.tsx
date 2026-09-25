"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { Answer, Prompt } from "@/lib/sets";
import { HowToPlay } from "./dive-game/HowToPlay";
import { IntroScreen } from "./dive-game/IntroScreen";
import { PlayingScreen } from "./dive-game/PlayingScreen";
import { ResultScreen } from "./dive-game/ResultScreen";
import type { Phase, PlayedAnswer } from "./dive-game/types";
import {
  isCloseAnswer,
  normalizeAnswer,
  normalizeRawAnswer,
} from "./dive-game/answerUtils";

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
        <PlayingScreen
          questionSet={questionSet}
          questionIndex={questionIndex}
          prompt={prompt}
          completedQuestions={completedQuestions}
          depth={depth}
          score={score}
          submitted={submitted}
          revealedAnswer={revealedAnswer}
          timedOutAnswer={timedOutAnswer}
          answerText={answerText}
          seconds={seconds}
          didYouMean={didYouMean}
          lookupError={lookupError}
          onAnswerChange={(value) => {
            answerTextRef.current = value;
            setAnswerText(value);
            setDidYouMean(null);
            setPendingCorrection(null);
          }}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
        />
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
