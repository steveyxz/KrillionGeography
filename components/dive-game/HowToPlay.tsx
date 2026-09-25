export function HowToPlay({ onClose }: { onClose: () => void }) {
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
