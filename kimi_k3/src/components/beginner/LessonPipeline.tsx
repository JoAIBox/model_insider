import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 6: the full pipeline ============ */

const Scene1: React.FC = () => (
  <svg viewBox="0 0 760 330" width="100%" height="330">
    <BgnArrows />
    <text x="20" y="30" fill="#E2E8F0" fontSize="18" fontWeight="bold">K3 end-to-end: input → 93-layer backbone → output</text>

    <TokenChip text="input" x={15} y={70} w={64} h={42} color="#38BDF8" />
    <FlowLine x1={87} y1={91} x2={135} y2={91} color="#38BDF8" />

    {/* layer 0 align */}
    <g>
      <rect x={140} y={66} width={100} height={50} rx="8" fill="rgba(56,189,248,0.10)" stroke="#38BDF8" strokeWidth="1.6" />
      <text x={190} y={88} fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">Layer 0</text>
      <text x={190} y={105} fill="#94A3B8" fontSize="10" textAnchor="middle">text+image align</text>
    </g>
    <FlowLine x1={248} y1={91} x2={296} y2={91} />

    {/* backbone block x3 */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${300 + i * 152}, 50)`}>
        <rect x="0" y="0" width="140" height="84" rx="10" fill="rgba(0,242,254,0.05)" stroke="rgba(0,242,254,0.3)" />
        <text x="70" y="20" fill="#00F2FE" fontSize="12" fontWeight="bold" textAnchor="middle">Block {i + 1}</text>
        {[
          { t: 'KDA', c: '#00F2FE' },
          { t: 'KDA', c: '#00F2FE' },
          { t: 'KDA', c: '#00F2FE' },
          { t: 'MLA', c: '#A78BFA' },
        ].map((s, j) => (
          <g key={j}>
            <rect x={10 + j * 31} y={30} width={26} height={22} rx="5" fill={`${s.c}18`} stroke={s.c} strokeWidth="1.2" />
            <text x={23 + j * 31} y={44} fill={s.c} fontSize="9.5" fontWeight="bold" textAnchor="middle">{s.t}</text>
          </g>
        ))}
        <text x="70" y="72" fill="#94A3B8" fontSize="10" textAnchor="middle">each: 3×KDA + 1×MLA</text>
        <text x="70" y="92" fill="#64748B" fontSize="9.5" textAnchor="middle">(layers also hold MoE)</text>
      </g>
    ))}
    <text x={500} y={160} fill="#64748B" fontSize="10.5">… 93 layers total</text>

    <FlowLine x1={760 - 40} y1={91} x2={300} y2={160} width={0} />

    {/* output head */}
    <g transform="translate(610,150)">
      <rect x="0" y="0" width="130" height="52" rx="8" fill="rgba(0,230,118,0.08)" stroke="#00E676" strokeWidth="1.6" />
      <text x="65" y="22" fill="#00E676" fontSize="12" fontWeight="bold" textAnchor="middle">output head</text>
      <text x="65" y="42" fill="#94A3B8" fontSize="10" textAnchor="middle">scores 160K vocab</text>
    </g>

    {/* probability bar */}
    <g transform="translate(60,210)">
      <text x="0" y="12" fill="#94A3B8" fontSize="12">probability per candidate token:</text>
      {[
        { t: 'it', p: 0.05, c: '#64748B' },
        { t: 'dog', p: 0.08, c: '#64748B' },
        { t: 'cat', p: 0.62, c: '#00F2FE' },
        { t: 'fish', p: 0.18, c: '#38BDF8' },
        { t: '…', p: 0.07, c: '#64748B' },
      ].map((w, i) => (
        <g key={i} transform={`translate(${i * 130}, 24)`}>
          <rect x="0" y="0" width="26" height="26" rx="6" fill={`${w.c}1c`} stroke={w.c} strokeWidth="1.4" />
          <text x="13" y="18" fill={w.c} fontSize="13" fontWeight="bold" textAnchor="middle">{w.t}</text>
          <rect x="34" y="8" width={Math.round(w.p * 90)} height="10" rx="4" fill={w.c} opacity={0.75} className={w.p > 0.5 ? 'bgn-pulse' : undefined} />
          <text x={36 + Math.round(w.p * 90)} y="17" fill="#94A3B8" fontSize="11" fontFamily="monospace">{w.p.toFixed(2)}</text>
        </g>
      ))}
      <text x="0" y="66" fill="#00F2FE" fontSize="12.5" fontWeight="bold">the model most wants to say "cat" (62%)</text>
    </g>

    <text x="20" y="292" fill="#94A3B8" fontSize="13.5">
      Whole flow: token vectors → 93 layers of "attention exchange + expert processing"
    </text>
    <text x="20" y="314" fill="#94A3B8" fontSize="13.5">
      → output head scores each token in the 160K vocabulary.
    </text>
  </svg>
);

const Scene2: React.FC = () => (
  <svg viewBox="0 0 760 290" width="100%" height="290">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Generation: token-by-token "chain completion"</text>

    <rect x="20" y="60" width="720" height="52" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
    <TokenChip text="The" x={40} y={68} w={44} h={36} color="#38BDF8" />
    <TokenChip text="cat" x={96} y={68} w={44} h={36} color="#38BDF8" />
    <TokenChip text="ate" x={152} y={68} w={44} h={36} color="#38BDF8" />
    <TokenChip text="fish" x={208} y={68} w={44} h={36} color="#38BDF8" />
    <text x={276} y={90} fill="#64748B" fontSize="13">(4 tokens generated so far)</text>

    <g className="bgn-float">
      <TokenChip text="it" x={430} y={68} w={44} h={36} color="#00F2FE" />
      <text x={452} y={130} fill="#00F2FE" fontSize="12" fontWeight="bold">next token to predict?</text>
    </g>

    <FlowLine x1={474} y1={86} x2={600} y2={140} color="#00F2FE" />
    <g transform="translate(600,140)">
      <rect x="0" y="0" width="140" height="50" rx="9" fill="rgba(155,81,224,0.15)" stroke="#A78BFA" strokeWidth="1.8" />
      <text x="70" y="20" fill="#A78BFA" fontSize="12.5" fontWeight="bold" textAnchor="middle">K3 model</text>
      <text x="70" y="40" fill="#94A3B8" fontSize="10.5" textAnchor="middle">93-layer flow</text>
    </g>

    <FlowLine x1={670} y1={212} x2={600} y2={228} width={0} />

    <g transform="translate(220,150)">
      <rect x="0" y="0" width="360" height="70" rx="10" fill="rgba(0,230,118,0.07)" stroke="rgba(0,230,118,0.35)" />
      <text x="180" y="26" fill="#00E676" fontSize="13" fontWeight="bold" textAnchor="middle">append the predicted token to the input</text>
      <text x="180" y="50" fill="#94A3B8" fontSize="12.5" textAnchor="middle">"The cat ate fish, it" → predict "was" → …</text>
    </g>

    <text x="20" y="248" fill="#94A3B8" fontSize="13.5">
      The loop repeats until a "stop" token appears — that's why LLM writing looks like auto-completion.
    </text>
    <text x="20" y="270" fill="#94A3B8" fontSize="13.5">
      KDA's notebook keeps these long chains fast.
    </text>
  </svg>
);

const Scene3: React.FC = () => (
  <svg viewBox="0 0 760 330" width="100%" height="330">
    <BgnArrows />
    <text x="20" y="30" fill="#E2E8F0" fontSize="18" fontWeight="bold">All 5 core concepts in one picture</text>

    {[
      { x: 40, y: 60, w: 225, h: 72, c: '#38BDF8', t: '① Tokens + vectors', d: 'text/image → 7168-dim vectors' },
      { x: 285, y: 60, w: 225, h: 72, c: '#00F2FE', t: '② Attention QKV', d: "tokens 'see' each other" },
      { x: 530, y: 60, w: 210, h: 72, c: '#00E676', t: '③ KDA memory', d: 'erase old, write new' },
      { x: 40, y: 170, w: 340, h: 72, c: '#A78BFA', t: '④ MoE experts', d: '896 → 16 + 2 shared; saves compute' },
      { x: 410, y: 170, w: 310, h: 72, c: '#FFB000', t: '⑤ AttnRes', d: 'selective block-level retrieval' },
    ].map((card) => (
      <g key={card.t}>
        <rect x={card.x} y={card.y} width={card.w} height={card.h} rx="10" fill={`${card.c}0d`} stroke={`${card.c}55`} strokeWidth="1.4" className="bgn-float" style={{ animationDelay: `${card.x % 200}ms` }}>
          <title>{card.t}</title>
        </rect>
        <text x={card.x + 14} y={card.y + 28} fill={card.c} fontSize="14.5" fontWeight="bold">{card.t}</text>
        <text x={card.x + 14} y={card.y + 52} fill="#94A3B8" fontSize="12.5">{card.d}</text>
      </g>
    ))}

    <g transform="translate(60,280)">
      <rect x="0" y="0" width="640" height="36" rx="8" fill="rgba(0,242,254,0.08)" stroke="rgba(0,242,254,0.3)" />
      <text x="320" y="23" fill="#E2E8F0" fontSize="12.5" textAnchor="middle">
        Combined: ~2.5× scaling efficiency vs Kimi K2; supports 1M-token context
      </text>
    </g>
  </svg>
);

export const LessonPipeline: BeginnerLesson = {
  id: 'pipeline',
  label: 'Full pipeline',
  emoji: '🏭',
  title: 'Lesson 6 · Full pipeline overview',
  subtitle: 'Tying everything together: the whole journey from input to output.',
  scenes: [
    {
      title: 'K3 end-to-end: input → 93-layer backbone → output',
      analogy: 'Like a factory line: raw material (input) enters the pre-treatment workshop (Layer 0), passes 93 workstations (backbone), and is quality-checked and packed (output head).',
      explain: <>Input first goes through Layer 0 alignment (text lookup + image encoding), then the 93-layer backbone — every 4 layers form a Block (3 KDA + 1 MLA, with an MoE expert layer inside each layer) — finally the output head scores the 160K vocab to give the next token's probabilities.</>,
      visual: <Scene1 />,
    },
    {
      title: 'Generation: token-by-token "chain completion"',
      analogy: 'Like passing the story around: finish a sentence, append it, write the next one.',
      explain: <>The model predicts <b>one</b> token at a time, appends it to the input, then predicts the next — this loop is "autoregression". KDA's notebook keeps the loop fast even on ultra-long inputs.</>,
      visual: <Scene2 />,
      keypoint: 'An LLM "writes" by chaining: predict a token → append → predict again.',
    },
    {
      title: 'All 5 core concepts in one picture',
      explain: <>Everything is now connected: vectors → attention → KDA memory → MoE experts → AttnRes residuals. The sidebar holds an <b>in-depth technical version</b> of each mechanism (with formulas and operator-level animations).</>,
      visual: <Scene3 />,
      tip: 'Want to go deeper? Open "Architecture Overview" for the 93-layer panorama, or "KDA Gated Delta Attention" for the full derivation.',
    },
  ],
};
