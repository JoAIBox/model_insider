import React from 'react';

export const ExpertPathAnimation: React.FC = () => (
  <div className="operator-animation" aria-label="LatentMoE operator animation">
    <div className="io-strip"><span>Input: x ∈ R^7,168</span><span>Output: y ∈ R^7,168</span></div>
    <div className="parameter-strip">Parameter context: 104.2B activated parameters per token for the whole model; per-expert parameter count not separately disclosed</div>
    <div className="animation-caption">
      Data routing: Token input <b>x (7,168)</b> feeds three branches simultaneously:
      (1) <b>2 shared experts</b> (full-width 7,168);
      (2) <b>Router</b> (W_r x computes sigmoid scores for 896 experts);
      (3) <b>Down-projection W↓</b> (7,168 → 3,584) sent to 16 selected SiTU-GLU experts (hidden 3,072).
      The routed sum is normalized via RMSNorm and up-projected W↑ (3,584 → 7,168), then added to the shared branch.
    </div>
    <div className="expert-animation-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
      <div className="operator-step" style={{ background: '#0F172A', padding: '10px', borderRadius: '6px' }}>Input x<br /><b style={{ color: '#38BDF8' }}>7,168</b></div>
      <div className="operator-step accent" style={{ background: '#0F172A', padding: '10px', borderRadius: '6px' }}>Branch 1: Router (W_r x)<br /><b style={{ color: '#10B981' }}>Top-16 of 896</b></div>
      <div className="operator-step" style={{ background: '#0F172A', padding: '10px', borderRadius: '6px' }}>Branch 2: W↓<br /><b style={{ color: '#C084FC' }}>3,584 latent</b></div>
      <div className="operator-step" style={{ background: '#0F172A', padding: '10px', borderRadius: '6px' }}>SiTU-GLU 16 Experts<br /><b style={{ color: '#F59E0B' }}>hidden 3,072</b></div>
      <div className="operator-step" style={{ background: '#0F172A', padding: '10px', borderRadius: '6px' }}>W↑ RMSNorm(u) + Shared<br /><b style={{ color: '#10B981' }}>7,168 Output</b></div>
    </div>
    <div className="shared-expert-lane" style={{ marginTop: '10px', padding: '8px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>Branch 3: 2 Shared Experts (Full-width 7,168)</span>
      <span style={{ color: '#94A3B8', marginLeft: '10px', fontSize: '0.9rem' }}>Bypasses down/up projection entirely and adds directly into final output</span>
    </div>
  </div>
);
