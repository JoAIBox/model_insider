import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows } from './BeginnerAcademy';

/* ============ Lesson 5: AttnRes attention residuals ============ */

/** 9 rows: word embedding + block 1..8 (each block ≈ 12 layers) */
const LayerStack: React.FC<{ active: number; showAttnRes: boolean }> = ({ active, showAttnRes }) => {
  const labels = ['embedding', 'block 1', 'block 2', 'block 3', 'block 4', 'block 5', 'block 6', 'block 7', 'block 8'];
  const n = labels.length;
  return (
    <svg viewBox="0 0 760 320" width="100%" height="320">
      <BgnArrows />
      <text x="20" y="28" fill="#E2E8F0" fontSize="16" fontWeight="bold">
        {showAttnRes ? 'AttnRes: the current block directly "sees" the embedding and all previous blocks' : 'Classic residual: each layer only takes information from the previous one'}
      </text>

      {labels.map((lb, i) => {
        const y = 60 + i * 26;
        const isActive = i === active;
        return (
          <g key={i}>
            <rect
              x={60}
              y={y}
              width={100}
              height={20}
              rx="5"
              fill={isActive ? 'rgba(0,242,254,0.35)' : 'rgba(255,255,255,0.07)'}
              stroke={isActive ? '#00F2FE' : 'rgba(255,255,255,0.15)'}
              strokeWidth={isActive ? 2 : 1}
            />
            <text x={110} y={y + 14} fill={isActive ? '#00F2FE' : '#94A3B8'} fontSize="11" textAnchor="middle">{lb}</text>
          </g>
        );
      })}
      <text x={60} y={60 + n * 26 + 14} fill="#64748B" fontSize="11">K3: 93 layers in 8 blocks, ~12 layers each</text>

      {/* classic residual: chain only */}
      {!showAttnRes &&
        Array.from({ length: n - 1 }, (_, i) => (
          <line
            key={i}
            x1={205}
            y1={70 + i * 26}
            x2={205}
            y2={86 + i * 26}
            stroke="rgba(255,176,0,0.5)"
            strokeWidth="2"
            className="bgn-flow-line"
          />
        ))}
      {!showAttnRes && (
        <>
          <text x={215} y={140} fill="#FFB000" fontSize="12">chain only —</text>
          <text x={215} y={158} fill="#FFB000" fontSize="12">info thins out</text>
        </>
      )}

      {/* attnres: fan-in from embedding + all previous blocks */}
      {showAttnRes &&
        Array.from({ length: active }, (_, i) => (
          <path
            key={i}
            d={`M 160 ${70 + i * 26 + 10} C 290 ${70 + i * 26 + 10}, 290 ${70 + active * 26 + 10}, 180 ${70 + active * 26 + 10}`}
            fill="none"
            stroke={`rgba(0,242,254,${0.9 - (active - i) * 0.08})`}
            strokeWidth="1.8"
            className="bgn-flow-line"
            markerEnd="url(#bgn-arrow)"
          />
        ))}
      {showAttnRes && (
        <>
          <text x={310} y={150} fill="#00F2FE" fontSize="12">fan-in: embedding +</text>
          <text x={310} y={168} fill="#00F2FE" fontSize="12">&amp; all earlier blocks</text>
        </>
      )}

      <g transform="translate(460,70)">
        <rect x="0" y="0" width="300" height="220" rx="10" fill="rgba(13,17,33,0.6)" stroke="rgba(255,255,255,0.1)" />
        <text x="155" y="26" fill="#E2E8F0" fontSize="13.5" fontWeight="bold" textAnchor="middle">Telephone-game analogy</text>
        {!showAttnRes ? (
          <>
            <text x="155" y="58" fill="#94A3B8" fontSize="12.5" textAnchor="middle">"The cat ate fish" passed 8 times:</text>
            <text x="155" y="82" fill="#FFB000" fontSize="13" textAnchor="middle">cat ate fish → some animal ate →</text>
            <text x="155" y="104" fill="#FFB000" fontSize="13" textAnchor="middle">→ something about animals → garbled</text>
            <text x="155" y="140" fill="#94A3B8" fontSize="12.5" textAnchor="middle">each layer only hears the previous retelling,</text>
            <text x="155" y="162" fill="#94A3B8" fontSize="12.5" textAnchor="middle">information gets distorted (dilution)</text>
          </>
        ) : (
          <>
            <text x="155" y="58" fill="#94A3B8" fontSize="12.5" textAnchor="middle">AttnRes lets the current block</text>
            <text x="155" y="82" fill="#00F2FE" fontSize="13" textAnchor="middle">see the embedding &amp; all previous blocks</text>
            <text x="155" y="104" fill="#94A3B8" fontSize="12.5" textAnchor="middle">each layer learns a "preference vector" and</text>
            <text x="155" y="126" fill="#94A3B8" fontSize="12.5" textAnchor="middle">blends the block summaries by preference</text>
            <text x="155" y="160" fill="#00E676" fontSize="12.5" textAnchor="middle">saves ~25% training compute (1.25×)</text>
            <text x="155" y="182" fill="#00E676" fontSize="12.5" textAnchor="middle">&lt;2% inference latency overhead</text>
          </>
        )}
      </g>
    </svg>
  );
};

const Scene1: React.FC = () => (
  <div>
    <LayerStack active={5} showAttnRes={false} />
    <p style={{ color: '#94A3B8', fontSize: '13.5px', marginTop: '8px' }}>
      K3 has 93 layers. Classic residual connections just pass "previous output + this layer's work" downward — deep layers only ever see the last layer's processed result.
    </p>
  </div>
);

const Scene2: React.FC = () => (
  <div>
    <LayerStack active={5} showAttnRes={true} />
    <p style={{ color: '#94A3B8', fontSize: '13.5px', marginTop: '8px' }}>
      This is <b>Attention Residuals (AttnRes)</b>: every layer has a learned "preference vector" (pseudo-query w) that scores and blends the summaries of "embedding + all previous blocks" — replacing the fixed +1 residual.
    </p>
  </div>
);

const Scene3: React.FC = () => (
  <svg viewBox="0 0 760 300" width="100%" height="300">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Learned weights: the network picks which "notes" to reopen</text>

    {['emb', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map((t, i) => (
      <g key={i}>
        <rect x={40 + i * 92} y={80} width={72} height={40} rx="8" fill={i === 7 ? 'rgba(0,242,254,0.3)' : 'rgba(255,255,255,0.07)'} stroke={i === 7 ? '#00F2FE' : 'rgba(255,255,255,0.15)'} strokeWidth={i === 7 ? 2 : 1} />
        <text x={76 + i * 92} y={104} fill={i === 7 ? '#00F2FE' : '#94A3B8'} fontSize="12" textAnchor="middle" fontWeight={i === 7 ? 700 : 400}>{t}</text>
      </g>
    ))}

    {/* attention weights */}
    {[
      { from: 0, w: 0.08, x: 112 },
      { from: 1, w: 0.08, x: 204 },
      { from: 2, w: 0.12, x: 296 },
      { from: 3, w: 0.16, x: 388 },
      { from: 4, w: 0.16, x: 480 },
      { from: 5, w: 0.18, x: 572 },
      { from: 6, w: 0.22, x: 664 },
    ].map((a) => (
      <g key={a.from}>
        <path d={`M ${a.x} 120 C ${a.x} 160, 580 150, 620 132`} fill="none" stroke="#00F2FE" strokeWidth={1.2 + a.w * 6} opacity={0.35 + a.w} className="bgn-flow-line" />
        <text x={a.x - 30} y={172} fill="#00F2FE" fontSize="11" fontFamily="monospace">{Math.round(a.w * 100)}%</text>
      </g>
    ))}

    <g transform="translate(40,190)">
      <rect x="0" y="0" width="680" height="56" rx="8" fill="rgba(0,242,254,0.08)" stroke="rgba(0,242,254,0.3)" />
      <text x="340" y="22" fill="#E2E8F0" fontSize="12.5" textAnchor="middle">
        h_l = ∑ α_k · b_k (Selective Cross-Layer Aggregation)
      </text>
      <text x="340" y="44" fill="#64748B" fontSize="11.5" textAnchor="middle">
        (w_l parameter is trained, while weights α adapt dynamically to each token's representation)
      </text>
    </g>

    <text x="20" y="270" fill="#94A3B8" fontSize="13.5">
      The pseudo-query w_l selectively attends to whichever earlier block representations are most relevant,
    </text>
    <text x="20" y="292" fill="#94A3B8" fontSize="13.5">
      like a reader flipping directly to the specific notes needed for the current concept.
    </text>
  </svg>
);

export const LessonAttnRes: BeginnerLesson = {
  id: 'attnres',
  label: 'Attention residuals',
  emoji: '🔗',
  title: 'Lesson 5 · Attention Residuals (AttnRes)',
  subtitle: 'Fixing "too deep to remember" — information no longer fades away.',
  scenes: [
    {
      title: 'Problem: layers so deep, information gets "lost in the game of telephone"',
      analogy: 'Telephone game: a phrase passes through 93 people and comes out garbled. Classic models only pass the previous layer\'s output downward.',
      explain: <>K3 has 93 layers. Classic residual connections merely add "previous layer output + this layer's work" — every layer treated the same, so deep information gets diluted.</>,
      visual: <Scene1 />,
    },
    {
      title: 'Solution: every block looks directly at the embedding and earlier blocks',
      analogy: 'Carry the full meeting notes: you may flip back to page 1 anytime, not just trust the last row\'s retelling.',
      explain: <>AttnRes replaces the fixed +1 residual with <b>attention-based weighted sums</b>. Each layer learns a "preference vector" (pseudo-query <b>w</b>) used to score and blend the summaries of "embedding + all previous blocks". K3 uses the <b>Block version</b>: 93 layers in 8 blocks (~12 layers each), so attention runs between block summaries — much cheaper.</>,
      visual: <Scene2 />,
      keypoint: 'AttnRes lets every block reach any historical block directly — "selective memory" along the depth dimension.',
    },
    {
      title: 'Dynamic content attention: the network picks which "notes" to reopen',
      analogy: 'You don\'t study evenly — key chapters get revisited often, irrelevant ones skimmed. AttnRes evaluates dynamic content attention: layer pseudo-query w_l scores each earlier block\'s actual token representation.',
      explain: <>AttnRes computes dynamic content attention: <b>α_&#123;l,k&#125; = softmax(w_lᵀ · RMSNorm(b_k))</b>. Rather than static weights or always favoring adjacent blocks, the attention dynamically routes the most relevant block representations (e.g. shallow lexical features or intermediate reasoning states) directly to the current layer.</>,
      visual: <Scene3 />,
      tip: 'Cost is tiny: <2% inference latency overhead on typical loads, while saving ~25% training compute for the same loss (1.25×).',
    },
  ],
};
