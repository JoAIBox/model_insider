import React from 'react';

export const ExpertPathAnimation: React.FC = () => (
  <div className="operator-animation" aria-label="LatentMoE operator animation">
    <div className="io-strip"><span>Input: x ∈ R^7,168</span><span>Output: y ∈ R^7,168</span></div>
    <div className="parameter-strip">Parameter context: 104.2B activated parameters per token for the whole model; per-expert parameter count not separately disclosed</div>
    <div className="animation-caption">Internal computation: z = W↓x ∈ R^3,584 → router selects 16 of 896 experts → weighted aggregate u → RMSNorm(u) → W↑. In parallel, two full-width shared experts process x; both paths are added.</div>
    <div className="expert-animation-grid">
      <div className="operator-step">x<br /><b>7,168</b></div><div className="operator-step-arrow">→</div>
      <div className="operator-step">W↓<br /><b>3,584</b></div><div className="operator-step-arrow">→</div>
      <div className="operator-step accent">Router<br /><b>16 / 896</b></div><div className="operator-step-arrow">→</div>
      <div className="operator-step">SiTU-GLU<br /><b>hidden 3,072</b></div><div className="operator-step-arrow">→</div>
      <div className="operator-step">Aggregate + RMSNorm<br /><b>W↑ → 7,168</b></div>
    </div>
    <div className="shared-expert-lane"><span>2 shared experts at full width</span><i /></div>
  </div>
);
