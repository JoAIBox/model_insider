import React from 'react';

export const AttnResAnimation: React.FC = () => (
  <div className="operator-animation" aria-label="Attention Residuals animation">
    <div className="io-strip"><span>Input: b₀, b₁ … bₙ ∈ R^7,168</span><span>Output: hₗ ∈ R^7,168</span></div>
    <div className="parameter-strip">AttnRes module parameters: not separately disclosed</div>
    <div className="animation-caption">Internal computation: a learnable layer query scores RMSNorm-normalized source states; Softmax converts scores to input-dependent weights; the weighted sum becomes the residual read for the current layer. The weights are not disclosed as fixed values.</div>
    <svg viewBox="0 0 560 175" role="img" aria-label="AttnRes reads several prior representations into the current layer">
      <path className="attnres-path" d="M120 32 C270 32 305 76 430 88" />
      <path className="attnres-path" d="M120 86 C260 86 310 86 430 88" />
      <path className="attnres-path" d="M120 140 C270 140 305 100 430 88" />
      <path className="standard-residual-path" d="M120 157 C270 171 355 148 470 118" />
      <circle className="attnres-particle" r="5"><animateMotion dur="2.6s" repeatCount="indefinite" path="M120 32 C270 32 305 76 430 88" /></circle>
      <circle className="attnres-particle delayed" r="5"><animateMotion dur="2.6s" begin="-0.9s" repeatCount="indefinite" path="M120 140 C270 140 305 100 430 88" /></circle>
      <rect className="animation-box" x="20" y="13" width="100" height="38" rx="6" /><text x="70" y="37" textAnchor="middle" className="animation-label">Embedding b₀</text>
      <rect className="animation-box" x="20" y="67" width="100" height="38" rx="6" /><text x="70" y="91" textAnchor="middle" className="animation-label">Prior blocks</text>
      <rect className="animation-box" x="20" y="121" width="100" height="38" rx="6" /><text x="70" y="145" textAnchor="middle" className="animation-label">Current partial sum</text>
      <rect className="animation-box accent" x="430" y="58" width="110" height="60" rx="8" /><text x="485" y="84" textAnchor="middle" className="animation-title">Current layer</text><text x="485" y="102" textAnchor="middle" className="animation-label">selective read</text>
      <circle cx="470" cy="118" r="7" className="residual-add-node" /><text x="470" y="121" textAnchor="middle" className="residual-add-label">+</text>
      <text x="260" y="169" textAnchor="middle" className="residual-label">standard residual skip x</text>
    </svg>
  </div>
);
