export function IntroScreen({ onBegin }: { onBegin: () => void }) {
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
