import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 2: Attention ============ */

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

const Scene1: React.FC = () => (
  <svg viewBox="0 0 760 285" width="100%" height="285">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">A puzzle: who is "it"?</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">"The cat ate the fish. It was happy." — how does the machine know "it" is the cat, not the fish?</text>

    {tokens.map((tk) => <TokenChip key={tk.t} text={tk.t} x={tk.x} y={90} w={64} color={tk.c} />)}

    {/* attention arcs from "it" to the candidates */}
    <path d="M 544 130 C 590 180, 240 190, 192 130" fill="none" stroke="#00F2FE" strokeWidth="3" className="bgn-flow-line" markerEnd="url(#bgn-arrow)" />
    <path d="M 544 130 C 580 200, 480 200, 432 130" fill="none" stroke="rgba(0,242,254,0.35)" strokeWidth="2" strokeDasharray="4 6" />
    <text x="270" y="205" fill="#00F2FE" fontSize="13" fontWeight="bold">more like cat → high weight</text>
    <text x="300" y="225" fill="#64748B" fontSize="12">fish → low weight</text>

    <text x="20" y="248" fill="#94A3B8" fontSize="13.5">
      Every token actively "looks at" the others and decides how much to absorb from each —
    </text>
    <text x="20" y="270" fill="#94A3B8" fontSize="13.5">
      that is attention.
    </text>
  </svg>
);

/* concrete numbers for Scene 2: every token's x × W → q / k / v */
const W_Q = [[0.5, 0.1, 0.2], [0.2, 0.4, 0.1], [0.1, 0.3, 0.5]];
const W_K = [[0.6, 0.2, 0.1], [0.1, 0.5, 0.3], [0.2, 0.1, 0.4]];
const W_V = [[0.4, 0.2, 0.3], [0.1, 0.6, 0.2], [0.3, 0.1, 0.5]];
const VECS: Record<string, [number, number, number]> = {
  The: [0.1, 0.9, 0.4],
  cat: [0.8, 0.2, 0.5],
  ate: [0.3, 0.6, 0.7],
  the: [0.1, 0.9, 0.4],
  fish: [0.7, 0.3, 0.5],
  it: [0.2, 0.8, 0.6],
  was: [0.2, 0.7, 0.5],
  happy: [0.5, 0.4, 0.6],
};

/* manual step switcher (no auto-loop) */
const StepCtl: React.FC<{ step: number; steps: number; setStep: (s: number) => void }> = ({ step, steps, setStep }) => (
  <g>
    <text
      x={666}
      y={26}
      fill={step > 0 ? '#94A3B8' : 'rgba(100,116,139,0.3)'}
      fontSize="14"
      fontWeight="bold"
      textAnchor="middle"
      style={{ cursor: step > 0 ? 'pointer' : 'default' }}
      onClick={() => step > 0 && setStep(step - 1)}
    >
      ‹
    </text>
    {[...Array(steps)].map((_, i) => (
      <circle
        key={i}
        cx={690 + i * 20}
        cy={22}
        r={5}
        fill={step === i ? '#00F2FE' : 'rgba(255,255,255,0.15)'}
        className={step === i ? 'bgn-pulse' : undefined}
        style={{ cursor: 'pointer' }}
        onClick={() => setStep(i)}
      />
    ))}
    <text
      x={754}
      y={26}
      fill={step < steps - 1 ? '#94A3B8' : 'rgba(100,116,139,0.3)'}
      fontSize="14"
      fontWeight="bold"
      textAnchor="middle"
      style={{ cursor: step < steps - 1 ? 'pointer' : 'default' }}
      onClick={() => step < steps - 1 && setStep(step + 1)}
    >
      ›
    </text>
  </g>
);

const Scene2: React.FC = () => {
  const [phase, setPhase] = React.useState(0);
  const rows = [
    {
      W: W_Q,
      out: 'q', c: '#38BDF8',
      role: 'Q: "what I\'m looking for" — used to ask the others',
      result: '(0.30, 0.42, 0.56)',
      vals: [0.3, 0.42, 0.56],
      calc: '0.5·0.2 + 0.1·0.8 + 0.2·0.6 = 0.30',
    },
    {
      W: W_K,
      out: 'k', c: '#00E676',
      role: 'K: "what I offer" — tells others what I know',
      result: '(0.34, 0.60, 0.36)',
      vals: [0.34, 0.6, 0.36],
      calc: '0.6·0.2 + 0.2·0.8 + 0.1·0.6 = 0.34',
    },
    {
      W: W_V,
      out: 'v', c: '#A78BFA',
      role: 'V: "my actual content" — the info others can absorb',
      result: '(0.42, 0.62, 0.44)',
      vals: [0.42, 0.62, 0.44],
      calc: '0.4·0.2 + 0.2·0.8 + 0.3·0.6 = 0.42',
    },
  ];
  const active = phase === 0 ? -1 : phase - 1;
  const grid = [
    { row: 0, col: 0, t: 'The' }, { row: 0, col: 1, t: 'cat' }, { row: 0, col: 2, t: 'ate' }, { row: 0, col: 3, t: 'the' },
    { row: 1, col: 0, t: 'fish' }, { row: 1, col: 1, t: 'it' }, { row: 1, col: 2, t: 'was' }, { row: 1, col: 3, t: 'happy' },
  ];
  const VW = 24;
  const vbox = (x: number, y: number, vals: number[], color: string) =>
    vals.map((v, i) => (
      <g key={i}>
        <rect x={x + i * (VW + 4)} y={y} width={VW} height={VW} rx="3" fill={color} fillOpacity={0.18 + v * 0.72} stroke={color} strokeOpacity="0.6" />
        <text x={x + i * (VW + 4) + VW / 2} y={y + VW / 2 + 3.5} fill="#E2E8F0" fontSize="9" fontFamily="monospace" textAnchor="middle">{v.toFixed(2)}</text>
      </g>
    ));

  return (
    <svg viewBox="0 0 760 540" width="100%" height="540">
      <BgnArrows />
      <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">How Q, K, V are computed — by matrix multiplication</text>
      <text x="20" y="60" fill="#94A3B8" fontSize="14">Text becomes a token — a vector of numbers. Each token is a 3-dimension vector x,</text>
      <text x="20" y="78" fill="#94A3B8" fontSize="14">and W_Q, W_K, W_V transform it into three other 3-dimension vectors: q, k, v.</text>
      <StepCtl step={phase} steps={4} setStep={setPhase} />

      {/* every token: chip + its 3-dimension vector x */}
      {grid.map(({ row, col, t }) => {
        const cx = 24 + col * 180;
        const cy = 92 + row * 40;
        const isIt = t === 'it';
        const dim = phase > 0 && !isIt;
        return (
          <g key={t} opacity={dim ? 0.3 : 1}>
            <TokenChip text={t} x={cx + 8} y={cy} w={64} h={26} color={isIt ? '#00F2FE' : '#94A3B8'} dim={dim} />
            {vbox(cx + 80, cy + 1, VECS[t], isIt ? '#00F2FE' : '#94A3B8')}
          </g>
        );
      })}

      {rows.map((r, i) => {
        const top = 184 + i * 92;
        const isActive = active === i;
        const dim = active !== -1 && !isActive;
        const col = isActive ? r.c : 'rgba(255,255,255,0.15)';
        return (
          <g key={r.out} opacity={dim ? 0.4 : 1}>
            {/* input: it's x vector (3 dims) */}
            <text x="24" y={top - 8} fill="#00F2FE" fontSize="10" fontWeight="bold">it's x</text>
            {vbox(24, top, [0.2, 0.8, 0.6], '#00F2FE')}

            {/* learned matrix W (3×3) */}
            <text x="134" y={top - 8} fill={isActive ? r.c : '#94A3B8'} fontSize="10" fontWeight="bold">W_{r.out.toUpperCase()}</text>
            <g transform={`translate(134,${top})`}>
              {r.W.map((row, j) => row.map((_, k) => (
                <rect key={`${j}${k}`} x={k * 22} y={j * 22} width="20" height="20" rx="2" fill="rgba(255,255,255,0.05)" stroke={col} strokeWidth={isActive ? 1.8 : 1} />
              )))}
              {r.W.map((row, j) => row.map((v, k) => (
                <text key={`${j}${k}`} x={k * 22 + 10} y={j * 22 + 13.5} fill="#CBD5E1" fontSize="9" fontFamily="monospace" textAnchor="middle">{v.toFixed(1)}</text>
              )))}
            </g>

            {/* output: q / k / v (3 dims) */}
            <text x="254" y={top - 8} fill={isActive ? r.c : '#94A3B8'} fontSize="10" fontWeight="bold">{r.out} (3 dims)</text>
            {vbox(254, top, r.vals, r.c)}

            <text x="374" y={top + 12} fill={isActive ? r.c : '#94A3B8'} fontSize="12.5" fontWeight="bold">{r.out} = W_{r.out.toUpperCase()}·x</text>
            <text x="374" y={top + 36} fill="#64748B" fontSize="11.5">{r.role}</text>

            <FlowLine x1={108} y1={top + 12} x2={134} y2={top + 33} color={isActive ? r.c : 'rgba(255,255,255,0.2)'} width={isActive ? 1.8 : 1} />
            <FlowLine x1={206} y1={top + 33} x2={254} y2={top + 12} color={isActive ? r.c : 'rgba(255,255,255,0.2)'} width={isActive ? 1.8 : 1} />
          </g>
        );
      })}

      {/* calculation strip */}
      <g transform="translate(20,452)">
        {phase === 0 && (
          <>
            <text x="0" y="14" fill="#E2E8F0" fontSize="13" fontWeight="bold" fontFamily="monospace">3 dimensions in → 3 dimensions out: x · W = q / k / v</text>
            <text x="0" y="36" fill="#94A3B8" fontSize="12" fontFamily="monospace">each output number = one dot product of an x dimension with a matrix row</text>
          </>
        )}
        {phase > 0 && (
          <>
            <text x="0" y="14" fill={rows[phase - 1].c} fontSize="13" fontWeight="bold" fontFamily="monospace">
              {rows[phase - 1].out}₁ = {rows[phase - 1].calc}  →  {rows[phase - 1].out} = {rows[phase - 1].result}
            </text>
            <text x="0" y="36" fill="#94A3B8" fontSize="12" fontFamily="monospace">{rows[phase - 1].role}</text>
          </>
        )}
      </g>

      <text x="20" y="506" fill="#64748B" fontSize="12">
        "it" is our worked example — the other 7 tokens repeat the same multiplication with their own x.
      </text>
      <text x="20" y="524" fill="#64748B" fontSize="12">
        Real vectors have 128 dimensions; numbers are simplified for readability.
      </text>
    </svg>
  );
};

/* flow data for scenes 3 & 4: score → mask → softmax → weighted sum */
const slots = [
  { t: 'The', c: '#64748B', score: 0.2, w: 3 },
  { t: 'cat', c: '#38BDF8', score: 3.0, w: 53 },
  { t: 'ate', c: '#64748B', score: 0.5, w: 4 },
  { t: 'the', c: '#64748B', score: 0.3, w: 4 },
  { t: 'fish', c: '#22D3EE', score: 2.5, w: 32 },
  { t: 'it', c: '#00F2FE', score: 0.3, w: 4 },
  { t: 'was', c: '#64748B', score: -0.5, w: 0 },
  { t: 'happy', c: '#64748B', score: 0.1, w: 0 },
];
const slotX = (i: number) => 160 + i * 74;
const BAR = 22; /* 1 score point = 22px */
const STACK_W = 5.5; /* 1% = 5.5px (550px total) */
const FUTURE = [6, 7]; /* was, happy — hidden by the causal mask */


/* ================= Scene 3: Score ================= */
const Q_IT = [0.3, 0.42, 0.56]; /* "it"'s query vector (from the previous page) */
const KVec: Record<string, [number, number, number]> = {
  The: [0.1, 0.2, 0.2],
  cat: [1.5, 2.5, 2.7],
  ate: [0.6, 0.4, 0.3],
  the: [0.3, 0.3, 0.2],
  fish: [1.2, 2.0, 2.3],
  it: [0.4, 0.2, 0.2],
  was: [-0.5, -0.5, -0.3],
  happy: [0.1, 0.1, 0.0],
};
const Scene3: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const gKey = (active: boolean) => (active ? 'a' : 'i');

  return (
    <svg viewBox="0 0 760 262" width="100%" height="262">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">Scoring: how relevant is each token to "it"?</text>
      <StepCtl step={step} steps={2} setStep={setStep} />

      {/* ========== ① Q vs K: two vectors, from the previous page ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="50" fill="#94A3B8" fontSize="13">Q = the question — "it" is looking for something cat-like</text>
        <text x="20" y="68" fill="#94A3B8" fontSize="13">K = the answer — what each token is (k = W_K·x, from the previous page)</text>

        <text x="20" y="92" fill="#00F2FE" fontSize="10.5" fontWeight="bold">it's Q</text>
        <TokenChip text="it" x={20} y={100} w={64} h={26} color="#00F2FE" />
        {Q_IT.map((v, i) => (
          <g key={i}>
            <rect x={94 + i * 28} y={101} width="24" height="24" rx="3" fill="#00F2FE" fillOpacity={0.18 + v * 0.72} stroke="#00F2FE" strokeOpacity="0.6" />
            <text x={94 + i * 28 + 12} y={101 + 17.5} fill="#E2E8F0" fontSize="9" fontFamily="monospace" textAnchor="middle">{v.toFixed(2)}</text>
          </g>
        ))}

        <text x="210" y="92" fill="#94A3B8" fontSize="10.5" fontWeight="bold">each token's K</text>
        {slots.map((s, i) => {
          const gx = 210 + (i % 4) * 132;
          const gy = 100 + Math.floor(i / 4) * 50;
          const kv = KVec[s.t];
          return (
            <g key={s.t}>
              <rect x={gx} y={gy} width="42" height="22" rx="5" fill="rgba(255,255,255,0.06)" stroke={s.c} strokeWidth="1.2" />
              <text x={gx + 21} y={gy + 15} fill={s.t === 'it' ? '#00F2FE' : '#E2E8F0'} fontSize="10.5" textAnchor="middle">{s.t}</text>
              {kv.map((v, j) => (
                <g key={j}>
                  <rect x={gx + 48 + j * 22} y={gy + 2} width="18" height="18" rx="3" fill={s.c} fillOpacity={0.18 + Math.abs(v) * 0.6} stroke={s.c} strokeOpacity="0.55" />
                  <text x={gx + 48 + j * 22 + 9} y={gy + 15} fill="#E2E8F0" fontSize="8" fontFamily="monospace" textAnchor="middle">{v.toFixed(1)}</text>
                </g>
              ))}
            </g>
          );
        })}

        <text x="20" y="222" fill="#94A3B8" fontSize="12.5">
          The machine then "checks" its Q against every K — the better they match, the higher the score.
        </text>
        <text x="20" y="242" fill="#64748B" fontSize="12">
          the check is a dot product: multiply the vectors dimension by dimension, then add.
        </text>
      </g>

      {/* ========== ① scores: Q·K dot product ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="48" fill="#94A3B8" fontSize="13">raw score = Q · K — how well "it"'s question matches each token</text>
        {slots.map((s, i) => {
          const cx = slotX(i);
          const w = Math.max(4, Math.abs(s.score) * BAR);
          return (
            <g key={s.t}>
              <text x={cx} y="104" fill={s.score >= 0 ? '#00E676' : '#F87171'} fontSize="11.5" textAnchor="middle">{s.score >= 0 ? '+' : ''}{s.score.toFixed(1)}</text>
              {s.score >= 0 ? (
                <rect key={gKey(step === 1)} className={step === 1 ? 'bgn-fill' : ''} x={cx} y={110} width={w} height={16} rx="3" fill="#00E676" opacity="0.85" />
              ) : (
                <rect key={gKey(step === 1)} className={step === 1 ? 'bgn-fill' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'right center' }} x={cx - w} y={110} width={w} height={16} rx="3" fill="#F87171" opacity="0.85" />
              )}
            </g>
          );
        })}
        <text x="20" y="150" fill="#94A3B8" fontSize="12">
          cat: 0.30·1.5 + 0.42·2.5 + 0.56·2.7 = 3.01 → +3.0 · Q and K point the same way
        </text>
        <text x="20" y="172" fill="#94A3B8" fontSize="12">
          was: 0.30·(−0.5) + 0.42·(−0.5) + 0.56·(−0.3) = −0.53 → −0.5 · Q and K point opposite
        </text>
        <text x="20" y="198" fill="#64748B" fontSize="12">
          big positive = strongly related · negative = opposite — not a usable weight yet
        </text>
      </g>
    </svg>
  );
};

/* ================= Scene 4: Causal mask ================= */
const Scene4: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const gKey = (active: boolean) => (active ? 'a' : 'i');
  const matX = 30;
  const matY = 172;

  const labels = (showMask: boolean) => (
    <>
      {slots.map((s, i) => (
        <text key={`c${s.t}`} x={i * 20 + 10} y={-7} fill={i === 5 ? '#00F2FE' : '#64748B'} fontSize="9" fontWeight={i === 5 ? 700 : 400} textAnchor="middle">{s.t}</text>
      ))}
      {slots.map((s, i) => (
        <text key={`r${s.t}`} x={-6} y={i * 20 + 14} fill={i === 5 ? '#00F2FE' : '#64748B'} fontSize="9" fontWeight={i === 5 ? 700 : 400} textAnchor="end">{s.t}</text>
      ))}
      {slots.map((s, i) => (
        <g key={`cells${s.t}`}>
          {slots.map((k, j) => {
            const future = j > i;
            const masked = showMask && future;
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={j * 20}
                  y={i * 20}
                  width={19}
                  height={19}
                  rx="2"
                  fill={masked ? '#0A0F1D' : k.score >= 0 ? 'rgba(0,230,118,0.32)' : 'rgba(248,113,113,0.32)'}
                  stroke={i === 5 ? (masked ? 'rgba(248,113,113,0.6)' : '#00F2FE') : masked ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={i === 5 ? 1.4 : 1}
                  key={gKey(showMask)}
                  className={masked ? 'bgn-fill' : undefined}
                />
                {masked && (
                  <text key={gKey(showMask)} className="bgn-fill" x={j * 20 + 9.5} y={i * 20 + 13} fill="#F87171" fontSize="9" fontFamily="monospace" textAnchor="middle">-∞</text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </>
  );

  return (
    <svg viewBox="0 0 760 372" width="100%" height="372">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">The causal mask: the future is taped shut</text>
      <StepCtl step={step} steps={2} setStep={setStep} />

      {/* ========== ① the full score matrix ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 0 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">① The full score matrix A = Q·Kᵀ</text>
        <text x="758" y="52" fill="#64748B" fontSize="11.5" textAnchor="end">8 × 8 = 64 pairs</text>
        <g transform={`translate(${matX},${matY})`}>
          {labels(false)}
          <text x="0" y={8 * 20 + 18} fill="#64748B" fontSize="10">row = who asks (query) · column = who is asked (key)</text>
        </g>
        <g transform="translate(215,170)">
          <text x="0" y="18" fill="#94A3B8" fontSize="12.5">cell (i, j) = how much token i wants</text>
          <text x="0" y="40" fill="#94A3B8" fontSize="12.5">from token j — all 64 pairs, even the</text>
          <text x="0" y="62" fill="#94A3B8" fontSize="12.5">future ones ("it" looking at was…).</text>
          <text x="0" y="90" fill="#00F2FE" fontSize="12.5" fontWeight="bold">"it" is row 6 — it asks every column,</text>
          <text x="0" y="112" fill="#00F2FE" fontSize="12.5">even columns 7 &amp; 8 (was, happy)…</text>
          <text x="0" y="140" fill="#F87171" fontSize="12.5" fontWeight="bold">…but those tokens don't exist yet!</text>
          <text x="0" y="162" fill="#F87171" fontSize="12.5">generation runs left → right.</text>
        </g>
      </g>

      {/* ========== ② masking: upper triangle → -∞ ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 1 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">② Masking: above the diagonal → -∞</text>
        <text x="758" y="52" fill="#64748B" fontSize="11.5" textAnchor="end">applied to every row at once</text>
        <g transform={`translate(${matX},${matY})`}>
          {labels(true)}
        </g>
        <g transform="translate(215,170)">
          <text x="0" y="18" fill="#C4B5FD" fontSize="12.5" fontWeight="bold" fontFamily="monospace">A' = A + M,  M[i][j] = -∞ if j &gt; i</text>
          <text x="0" y="44" fill="#94A3B8" fontSize="12.5">cells above the diagonal (j &gt; i) are</text>
          <text x="0" y="66" fill="#94A3B8" fontSize="12.5">the future — not written yet — so the</text>
          <text x="0" y="88" fill="#94A3B8" fontSize="12.5">mask fills them with -∞: exp(-∞) = 0.</text>
          <text x="0" y="116" fill="#00F2FE" fontSize="12.5" fontWeight="bold">"it" = row 6 → only its first six</text>
          <text x="0" y="138" fill="#00F2FE" fontSize="12.5">cells survive: was &amp; happy = 0% weight.</text>
        </g>
        <text x="20" y="348" fill="#94A3B8" fontSize="13">
          Every row obeys the same rule — each token may only see itself and the past. That is what "causal" means.
        </text>
      </g>
    </svg>
  );
};

/* ================= Scene 5: Softmax ================= */
const EXP_V = [1.2, 20.1, 1.6, 1.4, 12.2, 1.4, 0, 0]; /* exp of scores; masked → exp(-∞) = 0 */
const Scene5: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const gKey = (active: boolean) => (active ? 'a' : 'i');
  const isFuture = (i: number) => FUTURE.includes(i);

  return (
    <svg viewBox="0 0 760 185" width="100%" height="185">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">Softmax: scores become weights</text>
      <StepCtl step={step} steps={2} setStep={setStep} />

      {/* token row (shared) */}
      {slots.map((s, i) => {
        const cx = slotX(i);
        return (
          <g key={s.t}>
            <rect x={cx - 28} y={66} width="56" height="30" rx="7" fill="rgba(255,255,255,0.06)" stroke={s.c} strokeWidth="1.5" />
            <text x={cx} y="85" fill={s.t === 'it' ? '#00F2FE' : '#E2E8F0'} fontSize="13" textAnchor="middle">{s.t}</text>
          </g>
        );
      })}

      {/* ========== ③ exp() ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 0 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">③ exp(): all positive — big scores amplified</text>
        <text x="758" y="52" fill="#C4B5FD" fontSize="12" fontFamily="monospace" textAnchor="end">softmax(xᵢ) = exp(xᵢ) / Σ exp(xⱼ)</text>
        {slots.map((s, i) => {
          const cx = slotX(i);
          const ev = EXP_V[i];
          return (
            <g key={s.t}>
              <text x={cx} y="110" fill={isFuture(i) ? '#64748B' : '#A78BFA'} fontSize="11" fontFamily="monospace" textAnchor="middle">{isFuture(i) ? '0' : ev.toFixed(1)}</text>
              <rect key={gKey(step === 0)} className={step === 0 ? 'bgn-fill' : ''} x={cx} y={116} width={Math.max(4, ev * 2.5)} height={16} rx="3" fill={isFuture(i) ? '#334155' : '#A78BFA'} opacity="0.85" />
            </g>
          );
        })}
        <text x="20" y="158" fill="#94A3B8" fontSize="12.5">
          masked tokens: exp(-∞) = 0 → they can never come back.
        </text>
        <text x="20" y="176" fill="#94A3B8" fontSize="12.5">
          gap stretch: +3.0 vs +2.5 (1.2×) → exp: 20.1 vs 12.2 (1.65×) — big scores win harder.
        </text>
      </g>

      {/* ========== ③ normalize ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 1 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">③ ÷ total: weights that sum to exactly 100%</text>
        <text x="758" y="52" fill="#00E676" fontSize="13" fontWeight="bold" textAnchor="end">sum = 100% ✓</text>
        {slots.map((s, i) => {
          const cx = slotX(i);
          return (
            <g key={s.t}>
              {isFuture(i) ? (
                <text x={cx} y="110" fill="#64748B" fontSize="11.5" fontWeight="bold" textAnchor="middle">0%</text>
              ) : (
                <>
                  <text x={cx} y="110" fill="#C4B5FD" fontSize="11.5" fontWeight="bold" textAnchor="middle">{s.w}%</text>
                  <rect key={gKey(step === 1)} className={step === 1 ? 'bgn-fill' : ''} x={cx} y={116} width={s.w * 1.3} height={16} rx="3" fill="#A78BFA" opacity="0.9" />
                </>
              )}
            </g>
          );
        })}
        <text x="20" y="158" fill="#94A3B8" fontSize="12.5">
          each exp value ÷ the total (37.8) → its share of 100%.
        </text>
        <text x="20" y="176" fill="#94A3B8" fontSize="12.5">
          now these numbers are usable: weights. cat owns 53% of "it".
        </text>
      </g>
    </svg>
  );
};

/* ================= Scene 6: Weighted sum ================= */
const Scene6: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const gKey = (active: boolean) => (active ? 'a' : 'i');
  const isFuture = (i: number) => FUTURE.includes(i);

  return (
    <svg viewBox="0 0 760 212" width="100%" height="212">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">Weighted sum: mixing the V's</text>
      <StepCtl step={step} steps={2} setStep={setStep} />

      {/* ========== ④ mixing ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 0 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">④ Mix: every visible V × its weight</text>
        <text x="758" y="52" fill="#C4B5FD" fontSize="12" fontFamily="monospace" textAnchor="end">output = Σ wᵢ·vᵢ</text>
        {slots.map((s, i) => {
          const cx = slotX(i);
          return (
            <g key={s.t}>
              {isFuture(i) ? (
                <>
                  <text x={cx} y="64" fill="#F87171" fontSize="11.5" textAnchor="middle">✗</text>
                  <rect x={cx - 32} y={72} width="64" height="34" rx="7" fill="rgba(248,113,113,0.05)" stroke="rgba(248,113,113,0.35)" strokeDasharray="3 3" />
                  <text x={cx} y="93" fill="#64748B" fontSize="12.5" textAnchor="middle">V:{s.t}</text>
                </>
              ) : (
                <>
                  <text x={cx} y="64" fill="#00F2FE" fontSize="11.5" textAnchor="middle">× {s.w}%</text>
                  <rect x={cx - 32} y={72} width="64" height="34" rx="7" fill="rgba(255,255,255,0.06)" stroke={s.c} strokeWidth="1.5" />
                  <text x={cx} y="93" fill="#E2E8F0" fontSize="12.5" textAnchor="middle">V:{s.t}</text>
                  <path d={`M ${cx} 106 L ${cx} 146`} stroke={s.c} strokeWidth="1.6" opacity="0.55" className={step === 0 ? 'bgn-flow-line' : undefined} />
                </>
              )}
            </g>
          );
        })}
        <text x="20" y="146" fill="#64748B" fontSize="12">result vector</text>
        <text x="20" y="196" fill="#94A3B8" fontSize="12.5">
          53% of cat's V + 32% of fish's V + 15% of the others → one blended vector.
        </text>
      </g>

      {/* ========== ④ result ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 1 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">④ The blended result</text>
        <text x="758" y="52" fill="#64748B" fontSize="11.5" textAnchor="end">1 vector in</text>
        <g>
          {slots.map((s, i) => {
            let acc = 0;
            const segs = slots.map((x) => (acc += x.w * STACK_W));
            const segStart = segs[i] - s.w * STACK_W;
            if (s.w === 0) return null;
            return (
              <rect key={`${i}-${gKey(step === 1)}`} className={step === 1 ? 'bgn-fill' : ''} x={160 + segStart} y={154} width={s.w * STACK_W} height={18} rx="2" fill={s.c} opacity="0.9" />
            );
          })}
        </g>
        <text x="20" y="196" fill="#94A3B8" fontSize="12.5">
          this vector is "it"'s new meaning — and it is mostly cat.
        </text>
      </g>
    </svg>
  );
};

/* ================= Scene 8: Multi-head attention ================= */
const Scene8: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const head1 = { c: '#38BDF8', q: [1.8, 2.0, 1.2], scores: [3.0, 0.4, 0.2, 0.1], label: 'head 1: who is the subject?', out: 'mostly cat' };
  const head2 = { c: '#22D3EE', q: [0.6, 1.8, 2.4], scores: [0.3, 2.8, 0.5, 0.1], label: 'head 2: what was eaten?', out: 'mostly fish' };

  return (
    <svg viewBox="0 0 760 388" width="100%" height="388">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">Multi-head attention: many questions at once</text>
      <StepCtl step={step} steps={2} setStep={setStep} />

      {/* ========== ① why: one Q is not enough ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="50" fill="#94A3B8" fontSize="13">One Q can only ask one question — but "it" needs two answers at once:</text>
        <text x="20" y="70" fill="#94A3B8" fontSize="13">head 1 → "who is the subject?" · head 2 → "what got eaten?"</text>

        <TokenChip text="it" x={20} y={96} w={64} h={26} color="#00F2FE" />
        <text x="20" y="144" fill="#00F2FE" fontSize="10.5" fontWeight="bold">its Q</text>
        {[0.3, 0.42, 0.56].map((v, i) => (
          <g key={i}>
            <rect x={20 + i * 28} y={152} width="24" height="24" rx="3" fill="#00F2FE" fillOpacity={0.18 + v * 0.72} stroke="#00F2FE" strokeOpacity="0.6" />
            <text x={20 + i * 28 + 12} y={152 + 17.5} fill="#E2E8F0" fontSize="9" fontFamily="monospace" textAnchor="middle">{v.toFixed(2)}</text>
          </g>
        ))}

        {[head1, head2].map((h, hi) => {
          const hx = 190 + hi * 285;
          return (
            <g key={hi}>
              <rect x={hx} y={96} width="260" height="110" rx="10" fill="rgba(255,255,255,0.04)" stroke={h.c} strokeWidth="1.2" />
              <text x={hx + 14} y={120} fill={h.c} fontSize="12.5" fontWeight="bold">{h.label}</text>
              <text x={hx + 14} y={142} fill="#94A3B8" fontSize="11">own matrices W_Q{hi + 1}, W_K, W_V</text>
              {h.q.map((v, i) => (
                <g key={i}>
                  <rect x={hx + 14 + i * 26} y={152} width="22" height="22" rx="3" fill={h.c} fillOpacity={0.18 + Math.abs(v) * 0.4} stroke={h.c} strokeOpacity="0.6" />
                  <text x={hx + 14 + i * 26 + 11} y={152 + 16} fill="#E2E8F0" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{v.toFixed(1)}</text>
                </g>
              ))}
              <text x={hx + 14 + 26 * 3 + 10} y={168} fill="#94A3B8" fontSize="10.5">q{hi + 1} — its own question</text>
              <text x={hx + 14} y={196} fill="#64748B" fontSize="10.5">learned to look for a different pattern</text>
            </g>
          );
        })}

        <text x="20" y="210" fill="#94A3B8" fontSize="12.5">
          Each head runs the whole attention flow (score → mask → softmax → weighted sum) on its own.
        </text>
        <text x="20" y="230" fill="#64748B" fontSize="12">
          head 1 learned "who does the verb?" → it will look at cat · head 2 learned "what got eaten?" → at fish
        </text>
      </g>

      {/* ========== ② parallel heads → concat → project ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="48" fill="#94A3B8" fontSize="13">each head computes its own attention output — in parallel</text>

        {[head1, head2].map((h, hi) => {
          const top = 64 + hi * 84;
          const names = ['cat', 'fish', 'ate', 'The'];
          return (
            <g key={hi}>
              <text x="20" y={top + 14} fill={h.c} fontSize="11" fontWeight="bold">{h.label}</text>
              <text x="20" y={top + 34} fill="#94A3B8" fontSize="10">q{hi + 1} · k</text>
              {h.scores.map((sc, si) => {
                const sx = 110 + si * 60;
                return (
                  <g key={si}>
                    <text x={sx} y={top + 30} fill={sc >= 0 ? '#00E676' : '#F87171'} fontSize="10" textAnchor="middle">+{sc.toFixed(1)}</text>
                    <rect x={sx} y={top + 36} width={Math.max(4, sc * 14)} height="10" rx="2" fill={sc >= 0 ? '#00E676' : '#F87171'} opacity="0.85" />
                    <text x={sx} y={top + 58} fill="#64748B" fontSize="9" textAnchor="middle">{names[si]}</text>
                  </g>
                );
              })}
              <text x="370" y={top + 22} fill="#94A3B8" fontSize="10">softmax → weights</text>
              <text x="490" y={top + 22} fill="#94A3B8" fontSize="10">Σ w·v</text>
              {[0, 1, 2].map((i) => (
                <rect key={i} x={530 + i * 28} y={top + 28} width="24" height="24" rx="3" fill={h.c} fillOpacity={0.2 + (hi === 0 ? [0.85, 0.3, 0.4] : [0.3, 0.85, 0.35])[i] * 0.6} stroke={h.c} strokeOpacity="0.6" />
              ))}
              <text x="530" y={top + 66} fill={h.c} fontSize="10" fontWeight="bold">out{hi + 1} — {h.out}</text>
            </g>
          );
        })}

        {/* concat + W_O */}
        <text x="20" y="240" fill="#94A3B8" fontSize="12.5">Both outputs are then merged into one final vector:</text>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={20 + i * 28} y={252} width="24" height="24" rx="3" fill={i < 3 ? '#38BDF8' : '#22D3EE'} fillOpacity={0.35} stroke={i < 3 ? '#38BDF8' : '#22D3EE'} strokeOpacity="0.6" />
        ))}
        <text x="20" y="292" fill="#94A3B8" fontSize="10.5">concatenate → 6 dims (2 heads × 3 dims)</text>
        <text x="220" y="268" fill="#C4B5FD" fontSize="11" fontWeight="bold">W_O</text>
        <g transform="translate(252,252)">
          {[...Array(3)].map((_, j) => [...Array(6)].map((_, k) => (
            <rect key={`${j}${k}`} x={k * 12} y={j * 12} width="10" height="10" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#C4B5FD" strokeOpacity="0.5" />
          )))}
        </g>
        <text x="252" y="296" fill="#94A3B8" fontSize="10.5">projection back to 3 dims</text>
        <text x="380" y="268" fill="#A78BFA" fontSize="11" fontWeight="bold">z</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={404 + i * 28} y={252} width="24" height="24" rx="3" fill="#A78BFA" fillOpacity={0.5} stroke="#A78BFA" strokeOpacity="0.6" />
        ))}
        <text x="404" y="292" fill="#A78BFA" fontSize="10.5" fontWeight="bold">final z — both answers blended</text>

        <text x="20" y="330" fill="#94A3B8" fontSize="12.5">
          Real models run 8–100+ heads in parallel — each one captures a different kind of relationship.
        </text>
        <text x="20" y="350" fill="#64748B" fontSize="12">
          The final linear projection W_O mixes the heads back into one vector of the original size.
        </text>
      </g>
    </svg>
  );
};

/* ================= Scene 7: KV cache ================= */
const Scene7: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const gKey = (active: boolean) => (active ? 'a' : 'i');
  const gen = tokens.slice(0, 6); /* The … it — "was"/"happy" not generated yet */

  return (
    <svg viewBox="0 0 760 350" width="100%" height="350">
      <BgnArrows />
      <text x="20" y="24" fill="#E2E8F0" fontSize="18" fontWeight="bold">KV cache: why generation gets cheaper</text>
      <StepCtl step={step} steps={3} setStep={setStep} />

      {/* ========== ① no cache: recompute ========== */}
      <g style={{ display: step === 0 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 0 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">① No cache: each new token re-reads every earlier token</text>
        <text x="758" y="52" fill="#64748B" fontSize="11.5" textAnchor="end">"was", "happy": not born yet</text>
        {gen.map((tk) => (
          <g key={tk.t}>
            <rect x={tk.x} y={70} width="60" height="36" rx="9" fill="rgba(255,255,255,0.06)" stroke={tk.t === 'it' ? '#00F2FE' : 'rgba(248,113,113,0.5)'} strokeWidth={tk.t === 'it' ? 2 : 1.2} strokeDasharray={tk.t === 'it' ? undefined : '4 4'} key={gKey(step === 0)} className={tk.t !== 'it' && step === 0 ? 'bgn-fill' : undefined} />
            <text x={tk.x + 30} y="93" fill={tk.t === 'it' ? '#00F2FE' : '#94A3B8'} fontSize="13" fontWeight={tk.t === 'it' ? 700 : 400} textAnchor="middle">{tk.t}</text>
          </g>
        ))}
        <rect x={560} y={70} width="60" height="36" rx="9" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
        <text x={590} y="93" fill="#64748B" fontSize="13" textAnchor="middle">…</text>
        <text x={680} y="93" fill="#64748B" fontSize="10.5">future tokens</text>

        {/* cost bars: token i re-reads i tokens */}
        {gen.map((tk, i) => {
          const h = (i + 1) * 20;
          return (
            <g key={`b${tk.t}`}>
              <rect key={gKey(step === 0)} className={step === 0 ? 'bgn-fill' : ''} x={24 + i * 52} y={286 - h} width="34" height={h} rx="3" fill={i === 5 ? 'rgba(0,242,254,0.5)' : 'rgba(248,113,113,0.4)'} />
              <text x={41 + i * 52} y={286 - h - 6} fill={i === 5 ? '#00F2FE' : '#94A3B8'} fontSize="11" fontWeight="bold" textAnchor="middle">{i + 1}</text>
            </g>
          );
        })}
        <text x="20" y="312" fill="#94A3B8" fontSize="12.5">
          token i must re-read all i earlier tokens → total work = 1 + 2 + … + n ≈ n²/2
        </text>
        <text x="20" y="334" fill="#F87171" fontSize="12.5" fontWeight="bold">
          quadratic: at 1M tokens that is ~500 billion re-reads — too slow.
        </text>
      </g>

      {/* ========== ② KV cache: store once ========== */}
      <g style={{ display: step === 1 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 1 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">② KV cache: each token's K &amp; V stored once</text>
        <text x="758" y="52" fill="#64748B" fontSize="11.5" textAnchor="end">no recomputing</text>
        {gen.map((tk) => (
          <g key={tk.t}>
            <rect x={tk.x} y={70} width="60" height="36" rx="9" fill="rgba(255,255,255,0.06)" stroke={tk.t === 'it' ? '#00F2FE' : 'rgba(255,255,255,0.15)'} strokeWidth={tk.t === 'it' ? 2 : 1} />
            <text x={tk.x + 30} y="93" fill={tk.t === 'it' ? '#00F2FE' : '#E2E8F0'} fontSize="13" fontWeight={tk.t === 'it' ? 700 : 400} textAnchor="middle">{tk.t}</text>
            <rect key={gKey(step === 1)} className={step === 1 ? 'bgn-fill' : ''} x={tk.x + 10} y={116} width="40" height="18" rx="4" fill="rgba(255,176,0,0.3)" stroke="rgba(255,176,0,0.6)" strokeWidth="1" />
            <text x={tk.x + 30} y="129" fill="#FFB000" fontSize="11" textAnchor="middle">K/V</text>
          </g>
        ))}
        <text x="20" y="250" fill="#94A3B8" fontSize="12.5">
          Each new token computes only its own Q/K/V (O(1) projection) — earlier tokens are read from the KV cache.
        </text>
        <text x="20" y="272" fill="#00E676" fontSize="12.5" fontWeight="bold">
          Attention read scans t past tokens: O(t) per token, O(N²) cumulative attention cost.
        </text>
      </g>

      {/* ========== ③ why no Q cache ========== */}
      <g style={{ display: step === 2 ? undefined : 'none' }}>
        <text x="20" y="52" fill={step === 2 ? '#00F2FE' : '#94A3B8'} fontSize="13.5" fontWeight="bold">③ Why is there no Q cache?</text>
        <g transform="translate(40,110)">
          <rect x="0" y="0" width="170" height="46" rx="8" fill="rgba(0,242,254,0.08)" stroke="#00F2FE" strokeWidth="1.4" />
          <text x="85" y="20" fill="#00F2FE" fontSize="12.5" fontWeight="bold" textAnchor="middle">"it"'s Q</text>
          <text x="85" y="37" fill="#94A3B8" fontSize="11" textAnchor="middle">asked once → discarded</text>
        </g>
        <g transform="translate(290,110)">
          <rect x="0" y="0" width="190" height="46" rx="8" fill="rgba(255,176,0,0.08)" stroke="#FFB000" strokeWidth="1.4" />
          <text x="95" y="20" fill="#FFB000" fontSize="12.5" fontWeight="bold" textAnchor="middle">"it"'s K &amp; V</text>
          <text x="95" y="37" fill="#94A3B8" fontSize="11" textAnchor="middle">kept — future tokens query them</text>
        </g>
        <g transform="translate(560,110)">
          <rect x="0" y="0" width="180" height="46" rx="8" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" strokeWidth="1.2" />
          <text x="90" y="20" fill="#94A3B8" fontSize="12.5" fontWeight="bold" textAnchor="middle">"was"'s Q</text>
          <text x="90" y="37" fill="#94A3B8" fontSize="11" textAnchor="middle">reads "it"'s K/V — never its Q</text>
        </g>
        <path d="M 560 133 L 480 133" stroke="#00F2FE" strokeWidth="1.8" strokeDasharray="5 4" className="bgn-flow-line" markerEnd="url(#bgn-arrow)" />

        <text x="20" y="210" fill="#94A3B8" fontSize="12.5">
          Q = the question — used once by its own token, then never needed again.
        </text>
        <text x="20" y="232" fill="#94A3B8" fontSize="12.5">
          K/V = the answer — every later token may look them up, again and again.
        </text>
        <text x="20" y="254" fill="#00E676" fontSize="12.5" fontWeight="bold">
          → cache K and V. Caching Q would just waste memory.
        </text>
      </g>
    </svg>
  );
};

export const LessonAttention: BeginnerLesson = {
  id: 'attention',
  label: 'Attention',
  emoji: '👀',
  title: 'Lesson 2 · Attention',
  subtitle: 'How tokens "look at" each other and exchange information.',
  scenes: [
    {
      title: 'A puzzle: who is "it"?',
      analogy: 'At a meeting you focus on the speakers relevant to your question and ignore the rest — attention is the model\'s version of "whom to focus on".',
      explain: <>To understand "it", the model makes this token <b>look at</b> "cat" and "fish" and judge which is more relevant. That act of "looking" is attention.</>,
      visual: <Scene1 />,
      keypoint: 'Attention = every token actively decides "how much information to take from whom".',
    },
    {
      title: 'Every token prepares three "roles": Q, K, V',
      analogy: 'Like speed dating: you raise a sign "anyone know cats?" (Q); each guest wears "I know cats" (K); you then choose who to hear in detail (V).',
      explain: <>Q, K, V don't appear out of nowhere — <b>every token</b> multiplies its own input vector x with three <b>learned matrices</b>: <b>q = W_Q·x</b>, <b>k = W_K·x</b>, <b>v = W_V·x</b>. The grid shows all 8 tokens, each with its own x. The animation walks through "it" (highlighted): x = (0.2, 0.8, 0.6) times each 3×3 matrix (each output number is one dot product, e.g. q₁ = 0.5·0.2 + 0.1·0.8 + 0.2·0.6 = 0.30). They are three "views" of the same input: Q (Query) "what I'm looking for", K (Key) "what I offer", V (Value) "my actual content". The Q·K dot product then measures the match.</>,
      visual: <Scene2 />,
      keypoint: 'Q, K, V are all matrix products of the input (q = W_Q·x, k = W_K·x, v = W_V·x) — everything in attention is computed from the input.',
    },
    {
      title: 'Scoring: how relevant is each token to "it"?',
      analogy: 'Speed dating: you raise a sign "anyone know cats?" (Q) and each candidate holds up their sign (K) — one rating per candidate, computed by matching Q with K.',
      explain: <>The query token "it" dot-products its Q with every token's K: each pair q·k collapses into one raw score (can be positive or negative, small or huge). cat +3.0, fish +2.5 — "it" leans toward both, but raw scores can't be used as weights yet.</>,
      visual: <Scene3 />,
      keypoint: 'Score = dot product of the query Q with each key K — a raw relevance number, not yet a weight.',
    },
    {
      title: 'The causal mask: the future is taped shut',
      analogy: 'A fill-in-the-blank test revealed left to right: line 6 may only use the answers of lines 1–6, everything below the current line is taped shut.',
      explain: <>All scores form one matrix <b>A = Q·Kᵀ</b>: rows are who asks (query), columns are who is asked (key). Generation runs left → right, so the future is not written yet: the <b>causal mask</b> fills every cell above the diagonal with -∞ — A' = A + M, M[i][j] = -∞ if j &gt; i. Because exp(-∞) = 0, masked tokens get 0% weight after softmax: "it" (row 6) may only attend to "The … it".</>,
      visual: <Scene4 />,
      keypoint: 'The causal mask is a matrix-wide rule: every cell above the diagonal of the score matrix is set to -∞ — a token may only attend to itself and the past.',
    },
    {
      title: 'Softmax: scores become weights',
      analogy: 'Exam grades: exp() is like boosting the top grades and zeroing the taped-shut answers, then normalizing so all percentages sum to 100%.',
      explain: <>Softmax has two moves: ① <b>exp()</b> — every score becomes positive, and big scores get amplified: +3.0 vs +2.5 are only 1.2× apart, but exp() makes them 20.1 vs 12.2 (1.65×); masked -∞ becomes exp(-∞) = 0, so the future stays dead. ② <b>normalize</b> — divide by the total (37.8) so weights sum to exactly 100%: cat 53%, fish 32%, others 15%.</>,
      visual: <Scene5 />,
      keypoint: 'Softmax turns masked scores into weights that sum to 100% and amplifies big gaps — that is the "focusing" mechanism of attention.',
    },
    {
      title: 'Weighted sum: "it" becomes mostly cat',
      analogy: 'Three doctors consult: each gives a diagnosis (V) and a credibility weight — the final diagnosis is their weighted blend.',
      explain: <>The last step mixes every visible V by its weight: output = Σ wᵢ·vᵢ. "it" receives 53% of cat's V, 32% of fish's V and 15% of the others' — the result vector is "it"'s new meaning, and it is mostly cat.</>,
      visual: <Scene6 />,
      keypoint: 'Attention output = weighted sum of the V\'s (Σ wᵢ·vᵢ) — each token becomes a blend of what it looked at.',
    },
    {
      title: 'Multi-head attention: many questions at once',
      analogy: 'Instead of one interviewer asking one question, several interviewers each ask their own question in parallel — then their notes are merged into one report.',
      explain: <>One Q can only measure one kind of match. <b>Multi-head attention</b> runs several attention computations in parallel: head 1 asks "who is the subject?" (its own W_Q¹, W_K¹, W_V¹), head 2 asks "what was eaten?" — each head computes its own scores, its own softmax weights and its own weighted sum, so out¹ is "mostly cat" while out² is "mostly fish". The outputs are <b>concatenated</b> (2 heads × 3 dims = a 6-dimension vector) and projected through one more matrix <b>W_O</b> (3 × 6) back to the original size: z = W_O·[out¹ | out²]. Real models use 8–100+ heads; here we show 2.</>,
      visual: <Scene8 />,
      keypoint: 'Multi-head = several attention computations in parallel, each with its own Q/K/V matrices; their outputs are concatenated and projected with W_O — every head captures a different relationship.',
    },
    {
      title: 'KV cache: why generation gets cheaper',
      analogy: 'A librarian who keeps a one-line summary card (K/V) of each book instead of re-reading every book for each new visitor — and throws away the visitor\'s question (Q) after answering it.',
      explain: <>Without a cache, each new token re-runs the entire network on all past tokens: total projection recomputation work is quadratic O(n²). The <b>KV Cache</b> stores each token's K and V projections once, so each new token only projects itself. However, computing attention scores against the cache still takes O(t) dot-products per step (totaling O(n²) attention read work). This fundamental memory and compute bottleneck of standard attention is why Kimi K3 adopts <b>KDA</b>: KDA maintains a fixed-size recurrent state matrix S_t with true O(1) memory and O(1) read/update per token!</>,
      visual: <Scene7 />,
      keypoint: 'KV Cache avoids recomputing past K/V projections, but reading cached keys still scales as O(t) per token. KDA solves this by maintaining a constant O(1) recurrent memory state.',
    },
  ],
};
