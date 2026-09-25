import type { CSSProperties } from "react";
import type { Answer, Prompt, RarityCategory } from "@/lib/sets";
import { depthFacts } from "./data";

export function RadarTimer({ seconds }: { seconds: number }) {
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

export function DiveHud({
  questionSet,
  completedQuestions,
  score,
  depth,
}: {
  questionSet: Prompt[];
  completedQuestions: number;
  score: number;
  depth: number;
}) {
  return (
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
  );
}

export function DiveReadout({
  depth,
  score,
  revealedAnswer,
}: {
  depth: number;
  score: number;
  revealedAnswer: Answer | null;
}) {
  return (
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
          {revealedAnswer ? revealedAnswer.category.toUpperCase() : "--"}
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
  );
}

export function DepthRail() {
  return (
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
                <div key={metres} style={{ top: `${(metres / 4000) * 100}%` }}>
                  <i />
                  <span>{metres}m</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RarityIcon({ category }: { category: RarityCategory }) {
  return (
    <span
      className={`rarity-icon rarity-${category.replace(/ /g, "-")}`}
      aria-hidden="true"
    />
  );
}
