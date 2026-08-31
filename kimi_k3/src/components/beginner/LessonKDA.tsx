import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 3: KDA recurrent memory ============ */

const tokens = [
  { t: 'The', x: 80, c: '#94A3B8' },
  { t: 'cat', x: 160, c: '#38BDF8' },
  { t: 'ate', x: 240, c: '#94A3B8' },
  { t: 'the', x: 320, c: '#94A3B8' },
  { t: 'fish', x: 400, c: '#38BDF8' },
  { t: 'it', x: 480, c: '#00F2FE' },
  { t: 'was', x: 560, c: '#94A3B8' },
  { t: 'happy', x: 640, c: '#94A3B8' },
];

const StateGrid: React.FC<{ size?: number; label?: string; highlight?: number[] }> = ({ size = 6, label, highlight = [] }) => (
  <svg width={size * 26 + 10} height={size * 26 + (label ? 30 : 10)}>
    {Array.from({ length: size * size }, (_, i) => {
      const lit = highlight.includes(i);
      return (
        <rect
          key={i}
          x={(i % size) * 26 + 4}
          y={Math.floor(i / size) * 26 + 4}
          width={22}
          height={22}
          rx="4"
          fill={lit ? '#00F2FE' : 'rgba(255,255,255,0.09)'}
          className={lit ? 'bgn-pulse' : undefined}
        >
          {lit && <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />}
        </rect>
      );
    })}
    {label && <text x="4" y={size * 26 + 22} fill="#94A3B8" fontSize="12.5">{label}</text>}
  </svg>
);

const Scene1: React.FC = () => (
  <svg viewBox="0 0 760 270" width="100%" height="270">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">K3 must process 1 million tokens — how?</text>

    {/* tape vs notebook */}
    <g transform="translate(50,64)">
      <rect x="0" y="0" width="300" height="44" rx="8" fill="rgba(255,176,0,0.08)" stroke="rgba(255,176,0,0.4)" />
      <text x="150" y="27" fill="#FFB000" fontSize="13" fontWeight="bold" textAnchor="middle">Traditional: full recording (KV Cache)</text>
      <text x="150" y="62" fill="#94A3B8" fontSize="12" textAnchor="middle">1M K/V pairs → memory explodes ✗</text>
    </g>

    <g transform="translate(410,64)">
      <rect x="0" y="0" width="300" height="44" rx="8" fill="rgba(0,230,118,0.08)" stroke="rgba(0,230,118,0.4)" />
      <text x="150" y="27" fill="#00E676" fontSize="13" fontWeight="bold" textAnchor="middle">KDA: one ever-updating notebook ✓</text>
      <text x="150" y="62" fill="#94A3B8" fontSize="12" textAnchor="middle">fixed size, any context length</text>
    </g>

    <StateGrid size={5} highlight={[0, 7, 21]} />
    <text x="204" y="194" fill="#94A3B8" fontSize="12.5">KDA memory state S_t</text>
    <text x="204" y="212" fill="#64748B" fontSize="11.5">fixed size · any context length</text>

    <g transform="translate(560,150)">
      <circle cx="0" cy="0" r="8" fill="#00E676" className="bgn-pulse" />
      <text x="14" y="4" fill="#00E676" fontSize="12">old memory fades</text>
      <circle cx="0" cy="32" r="8" fill="#00F2FE" className="bgn-pulse" />
      <text x="14" y="36" fill="#00F2FE" fontSize="12">new knowledge in</text>
    </g>

    <text x="20" y="250" fill="#94A3B8" fontSize="13.5">
      Reading isn't memorizing — you keep updating a mental summary as you read. KDA mimics that.
    </text>
  </svg>
);

const Scene2: React.FC = () => (
  <svg viewBox="0 0 760 330" width="100%" height="330">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Recurrent state S: the model's carry-along notebook</text>

    {tokens.map((tk) => <TokenChip key={tk.t} text={tk.t} x={tk.x} y={70} w={60} color="#38BDF8" />)}

    <FlowLine x1={660} y1={92} x2={700} y2={150} color="#00E676" />
    <text x={664} y={70} fill="#94A3B8" fontSize="12" textAnchor="end">each token</text>
    <text x={664} y={86} fill="#94A3B8" fontSize="12" textAnchor="end">one update</text>

    <g transform="translate(180,110)">
      <StateGrid size={5} highlight={[0, 6, 12, 18]} label="old memory S(t−1)" />
    </g>

    <g transform="translate(330,150)">
      <text x="0" y="12" fill="#00E676" fontSize="18" fontWeight="bold">→ update →</text>
    </g>

    <g transform="translate(450,110)">
      <StateGrid size={5} highlight={[1, 7, 12, 24]} label="new memory S(t)" />
    </g>

    <text x="20" y="282" fill="#94A3B8" fontSize="13.5">
      S is a fixed-size matrix (a "grid sheet"): jot key points, erase the rest.
    </text>
    <text x="20" y="304" fill="#94A3B8" fontSize="13.5">
      Read 1 token or 1 million — this KDA state keeps the same shape.
    </text>
  </svg>
);

const Scene3: React.FC = () => (
  <svg viewBox="0 0 760 330" width="100%" height="330">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Memory update: erase old + write new</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">KDA's update rule (the delta rule) has two intuitive actions, run once per token:</text>

    <g transform="translate(60,80)">
      <text x="0" y="18" fill="#94A3B8" fontSize="13">① old memory fades a bit</text>
      <StateGrid size={4} highlight={[]} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={(i % 4) * 26 + 4}
          y={Math.floor(i / 4) * 26 + 30}
          width={22}
          height={22}
          rx="4"
          fill="rgba(255,255,255,0.09)"
        >
          <animate attributeName="fill-opacity" values="1;0.25;1" dur="3s" repeatCount="indefinite" begin={`${(i % 4) * 0.3}s`} />
        </rect>
      ))}
      <text x="0" y="142" fill="#64748B" fontSize="11.5">decayed (× forget gate α)</text>
    </g>

    <FlowLine x1={240} y1={150} x2={300} y2={150} color="#00F2FE" />
    <text x={250} y={142} fill="#00F2FE" fontSize="12" fontWeight="bold">+</text>

    <g transform="translate(330,80)">
      <text x="0" y="18" fill="#94A3B8" fontSize="13">② write the current token's correction</text>
      <TokenChip text="cat" x={10} y={30} w={60} h={34} color="#00F2FE" />
      <text x="90" y="52" fill="#94A3B8" fontSize="12">new record for 'cat'</text>
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={(i % 4) * 26 + 4}
          y={Math.floor(i / 4) * 26 + 76}
          width={22}
          height={22}
          rx="4"
          fill={i === 5 || i === 9 || i === 10 ? '#00F2FE' : 'rgba(255,255,255,0.09)'}
          className={i === 5 || i === 9 || i === 10 ? 'bgn-pulse' : undefined}
        />
      ))}
      <text x="0" y="186" fill="#64748B" fontSize="11.5">written in (strength = write gate β)</text>
    </g>

    <FlowLine x1={560} y1={150} x2={620} y2={150} color="#A78BFA" />
    <text x={590} y={118} fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">= new memory S(t)</text>
    <g transform="translate(640,120)">
      <StateGrid size={4} highlight={[5, 9, 10]} />
      <text x="0" y="120" fill="#64748B" fontSize="11">old fades + new glows</text>
    </g>

    <text x="20" y="258" fill="#94A3B8" fontSize="13.5">Formula (delta rule):</text>
    <text x="20" y="282" fill="#00E676" fontSize="13" fontFamily="monospace">S_t = (I − β·k·kᵀ) · α·S(t−1) + β·k·vᵀ</text>
    <text x="20" y="306" fill="#94A3B8" fontSize="13">— left: erase old · right: write new</text>
  </svg>
);

const Scene4: React.FC = () => (
  <svg viewBox="0 0 760 280" width="100%" height="280">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Two gates: forget gate α and write gate β</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">Notes can't be messy: two gates decide what to keep and what to write.</text>

    <g transform="translate(50,95)">
      <rect x="0" y="0" width="300" height="80" rx="8" fill="rgba(255,176,0,0.06)" stroke="rgba(255,176,0,0.35)" />
      <text x="150" y="26" fill="#FFB000" fontSize="14" fontWeight="bold" textAnchor="middle">forget gate α (0~1)</text>
      <text x="150" y="50" fill="#94A3B8" fontSize="12.5" textAnchor="middle">small α → memory fades fast</text>
      <text x="150" y="68" fill="#94A3B8" fontSize="12.5" textAnchor="middle">large α → memory lasts</text>
    </g>

    <g transform="translate(410,95)">
      <rect x="0" y="0" width="300" height="80" rx="8" fill="rgba(0,230,118,0.06)" stroke="rgba(0,230,118,0.35)" />
      <text x="150" y="26" fill="#00E676" fontSize="14" fontWeight="bold" textAnchor="middle">write gate β (0~1)</text>
      <text x="150" y="50" fill="#94A3B8" fontSize="12.5" textAnchor="middle">large β → current token written deep</text>
      <text x="150" y="68" fill="#94A3B8" fontSize="12.5" textAnchor="middle">small β → barely written</text>
    </g>

    <text x="20" y="205" fill="#94A3B8" fontSize="13.5">
      Unlike classic attention, the memory is computed per token — important tokens are
    </text>
    <text x="20" y="227" fill="#94A3B8" fontSize="13.5">
      written heavily, irrelevant ones fade out fast.
    </text>
    <text x="20" y="251" fill="#94A3B8" fontSize="13.5">
      K3 even gates forgetting per channel — each "drawer" decays on its own.
    </text>
  </svg>
);

const Scene5: React.FC = () => (
  <svg viewBox="0 0 760 285" width="100%" height="285">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">3:1 mix: memory first, occasionally consult originals</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">In K3's 93 layers, every 4 layers = 3 KDA + 1 Gated MLA (classic attention).</text>

    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        {i % 4 === 3 ? (
          <g>
            <rect x={40 + i * 86} y={95} width={70} height={52} rx="8" fill="rgba(167,139,250,0.12)" stroke="#A78BFA" strokeWidth="1.6" />
            <text x={75 + i * 86} y={118} fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">MLA</text>
            <text x={75 + i * 86} y={136} fill="#94A3B8" fontSize="10" textAnchor="middle">lookup</text>
          </g>
        ) : (
          <g>
            <rect x={40 + i * 86} y={95} width={70} height={52} rx="8" fill="rgba(0,242,254,0.12)" stroke="#00F2FE" strokeWidth="1.6" />
            <text x={75 + i * 86} y={118} fill="#00F2FE" fontSize="12" fontWeight="bold" textAnchor="middle">KDA</text>
            <text x={75 + i * 86} y={136} fill="#94A3B8" fontSize="10" textAnchor="middle">memory</text>
          </g>
        )}
      </g>
    ))}
    <text x={40} y={168} fill="#64748B" fontSize="11.5">4 layers per block — 93 layers = 69 KDA + 24 MLA (each layer also has MoE)</text>

    <g transform="translate(40,185)">
      <circle cx="10" cy="10" r="7" fill="#00F2FE" className="bgn-pulse" />
      <text x="26" y="15" fill="#94A3B8" fontSize="12.5">KDA layer: fixed recurrent state — no per-token K/V entries on this path</text>
      <circle cx="10" cy="42" r="7" fill="#A78BFA" className="bgn-pulse" />
      <text x="26" y="47" fill="#94A3B8" fontSize="12.5">MLA: global content interaction every 4th layer — complements KDA memory</text>
    </g>

    <text x="20" y="255" fill="#94A3B8" fontSize="13.5">
      Combined: fast AND accurate on long contexts.
    </text>
    <text x="20" y="277" fill="#94A3B8" fontSize="13.5">
      K3 report: KDA and NoPE-MLA split long-range memory from global content interaction.
    </text>
  </svg>
);

export const LessonKDA: BeginnerLesson = {
  id: 'kda',
  label: 'KDA memory',
  emoji: '🧠',
  title: 'Lesson 3 · KDA Recurrent Memory (Kimi Delta Attention)',
  subtitle: 'K3\'s core innovation: an ever-updated "notebook" instead of "all recordings".',
  scenes: [
    {
      title: 'K3 must process 1 million tokens — how?',
      analogy: 'Traditional models are recorders taping everything; K3 is an attentive student keeping one ever-improving notebook.',
      explain: <>A per-token KV cache becomes expensive at million-token context lengths. KDA (Kimi Delta Attention) walks through the context while updating one <b>fixed-size</b> recurrent state S_t. This constant-size claim applies to the KDA layers; K3's MLA layers still retain per-token latent KV entries for global content interaction.</>,
      visual: <Scene1 />,
      keypoint: 'Within KDA layers, recurrent-state memory does not grow with context length. K3 is hybrid: MLA layers still use a per-token latent KV cache.',
    },
    {
      title: 'Recurrent state S: the model\'s carry-along notebook',
      analogy: 'Reading a long novel you don\'t memorize every word — you keep updating the story line in your head. S is that storyline.',
      explain: <>For every token, a KDA layer updates its memory matrix S once. S keeps the same shape whether 1 token or 1 million tokens have been read; this does not describe the separate MLA cache.</>,
      visual: <Scene2 />,
    },
    {
      title: 'Memory update: erase old + write new',
      analogy: 'Note-taking in two steps: ① old notes fade overall ② jot the key point you just heard.',
      explain: <>KDA's update is the <b>delta rule</b>: first form the decayed state S̄_t, then compute the prediction residual δ_t = v_t − S̄_tᵀk_t and write the correction. The exact delta form is <b>S_t = S̄_t + β_t k_t δ_tᵀ</b>; the equivalent expanded form is shown in the visual.</>,
      visual: <Scene3 />,
      tip: 'No need to memorize the formula — just the two actions "decay old state + write the prediction correction". If δ_t is small, the update is small; a novel mismatch produces a larger write.',
    },
    {
      title: 'Two gates: forget gate α and write gate β',
      analogy: 'Two knobs: one controls how fast memory fades, the other how strongly new knowledge is written in.',
      explain: <>α (forget gate) decides how long old memory lasts; β (write gate) scales the correction written for the current token. K3 refines α down to each channel — every "drawer" decays at its own pace.</>,
      visual: <Scene4 />,
    },
    {
      title: '3:1 mix: recurrent memory plus global content interaction',
      analogy: 'Most stations update a compact notebook; every fourth station compares content across the whole sequence.',
      explain: <>K3 arranges every 4 layers as 3 KDA + 1 Gated MLA: 93 layers = 69 KDA + 24 MLA. KDA supplies position-sensitive recurrent mixing, while NoPE-MLA supplies global content interaction rather than an exact copy of the original tokens.</>,
      visual: <Scene5 />,
      keypoint: '3:1 attention mix: KDA handles efficient recurrent mixing; NoPE-MLA periodically adds global content interaction.',
    },
  ],
};
