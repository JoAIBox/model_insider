import React from 'react';

export const AttnResAnimation: React.FC = () => (
  <div className="operator-animation" aria-label="Attention Residuals animation">
    <div className="io-strip"><span>Input: b₀, b₁ … bₙ ∈ R^7,168</span><span>Output: hₗ ∈ R^7,168</span></div>
    <div className="parameter-strip">AttnRes module parameters: not separately disclosed</div>
    <div className="animation-caption">Block AttnRes keeps the current block’s partial sum as one retrieval source, then forms one attention-weighted aggregation from the embedding, earlier block summaries, and that partial sum. This is an aggregation step, not an extra branch added after the result.</div>
    <svg viewBox="0 0 760 250" role="img" aria-label="Block AttnRes aggregates embedding, earlier blocks, and the current partial sum">
      <defs>
        <marker id="attnres-source-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#A78BFA" />
        </marker>
        <marker id="attnres-output-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
        </marker>
      </defs>

      <text x="20" y="20" className="animation-label">1. Retrieval source set</text>
      <rect className="animation-box" x="20" y="30" width="160" height="42" rx="6" />
      <text x="100" y="56" textAnchor="middle" className="animation-label">Embedding b₀</text>
      <rect className="animation-box" x="20" y="82" width="160" height="42" rx="6" />
      <text x="100" y="108" textAnchor="middle" className="animation-label">Earlier block summaries</text>
      <rect className="animation-box" x="20" y="134" width="160" height="42" rx="6" />
      <text x="100" y="160" textAnchor="middle" className="animation-label">Current partial sum uₗ</text>

      <path className="attnres-path" d="M180 51 C230 51 240 92 270 108" markerEnd="url(#attnres-source-arrow)" />
      <path className="attnres-path" d="M180 103 L270 108" markerEnd="url(#attnres-source-arrow)" />
      <path className="attnres-path" d="M180 155 C230 155 240 124 270 108" markerEnd="url(#attnres-source-arrow)" />
      <circle className="attnres-particle" r="5"><animateMotion dur="2.6s" repeatCount="indefinite" path="M180 51 C230 51 240 92 270 108" /></circle>
      <circle className="attnres-particle delayed" r="5"><animateMotion dur="2.6s" begin="-0.9s" repeatCount="indefinite" path="M180 155 C230 155 240 124 270 108" /></circle>

      <text x="365" y="55" className="animation-label" textAnchor="middle">2. Attention aggregation</text>
      <rect className="animation-box accent" x="270" y="72" width="190" height="72" rx="8" />
      <text x="365" y="101" textAnchor="middle" className="animation-title">rₗ = Σ αₗ,ₖ · vₖ</text>
      <text x="365" y="124" textAnchor="middle" className="animation-label">Softmax-weighted read</text>

      <line x1="460" y1="108" x2="535" y2="108" stroke="#10B981" strokeWidth="2" markerEnd="url(#attnres-output-arrow)" />
      <text x="605" y="55" className="animation-label" textAnchor="middle">3. Final representation</text>
      <rect x="535" y="72" width="170" height="72" rx="8" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="2" />
      <text x="620" y="101" textAnchor="middle" className="animation-title">hₗ = rₗ</text>
      <text x="620" y="124" textAnchor="middle" className="animation-label">Block representation</text>

      <text x="20" y="215" className="residual-label">The sequential partial sum is a source inside the aggregation.</text>
      <text x="20" y="234" className="residual-label">It is not drawn as a second AttnRes result added after rₗ.</text>
    </svg>
  </div>
);
