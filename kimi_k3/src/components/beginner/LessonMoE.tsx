import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 4: MoE mixture of experts ============ */

const Scene1: React.FC = () => (
  <svg viewBox="0 0 760 240" width="100%" height="240">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Problem: 2.8T parameters × every token = too expensive</text>

    <g transform="translate(60,70)">
      <rect x="0" y="0" width="300" height="70" rx="8" fill="rgba(255,176,0,0.06)" stroke="rgba(255,176,0,0.35)" />
      <text x="150" y="28" fill="#FFB000" fontSize="14" fontWeight="bold" textAnchor="middle">Dense (classic): one giant generalist</text>
      <text x="150" y="52" fill="#94A3B8" fontSize="12.5" textAnchor="middle">every token runs ALL 2.8T params ✗ too expensive</text>
    </g>

    <g transform="translate(400,70)">
      <rect x="0" y="0" width="300" height="70" rx="8" fill="rgba(0,230,118,0.06)" stroke="rgba(0,230,118,0.35)" />
      <text x="150" y="28" fill="#00E676" fontSize="14" fontWeight="bold" textAnchor="middle">MoE: 896 specialist experts ✓</text>
      <text x="150" y="52" fill="#94A3B8" fontSize="12.5" textAnchor="middle">each token only calls its top 16 experts</text>
    </g>

    <text x="20" y="180" fill="#94A3B8" fontSize="13.5">
      That's K3's design: 2.8T total parameters (huge), but each token only activates ~104B.
    </text>
    <text x="20" y="206" fill="#94A3B8" fontSize="13.5">
      Like a hospital with 896 specialists where one visit only needs 16 — big hospital, small bill.
    </text>
  </svg>
);

const Scene2: React.FC = () => (
  <svg viewBox="0 0 760 470" width="100%" height="470">
    <BgnArrows />
    <text x="20" y="30" fill="#E2E8F0" fontSize="18" fontWeight="bold">The router: a "triage desk"</text>
    <text x="20" y="54" fill="#94A3B8" fontSize="14">Each token is scored by the router, which picks the 16 experts (out of 896) it needs most.</text>

    {/* token */}
    <TokenChip text="cat" x={20} y={100} w={70} h={44} color="#38BDF8" />
    <FlowLine x1={100} y1={122} x2={190} y2={122} color="#38BDF8" />

    {/* router */}
    <g transform="translate(200,78)">
      <rect x="0" y="0" width="130" height="88" rx="10" fill="rgba(155,81,224,0.15)" stroke="#A78BFA" strokeWidth="2" className="bgn-pulse" />
      <text x="65" y="34" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">Router</text>
      <text x="65" y="56" fill="#94A3B8" fontSize="11.5" textAnchor="middle">scores 896 experts</text>
      <text x="65" y="76" fill="#00F2FE" fontSize="11.5" fontWeight="bold" textAnchor="middle">picks top 16</text>
    </g>

    <FlowLine x1={340} y1={122} x2={430} y2={122} color="#A78BFA" />

    {/* expert grid 32 x 28 = 896 */}
    <g transform="translate(430,70)">
      {Array.from({ length: 896 }, (_, i) => {
        const col = i % 32;
        const row = Math.floor(i / 32);
        const selected = [3, 7, 22, 41, 58, 100, 142, 190, 240, 311, 400, 450, 500, 620, 700, 800].includes(i);
        return (
          <rect
            key={i}
            x={col * 10}
            y={row * 10}
            width={8}
            height={8}
            rx="2"
            fill={selected ? '#00F2FE' : 'rgba(255,255,255,0.10)'}
            className={selected ? 'bgn-pulse' : undefined}
          >
            {selected && <title>expert #{i + 1} selected</title>}
          </rect>
        );
      })}
      <text x="0" y="296" fill="#64748B" fontSize="11.5">896 experts (32×28 grid)</text>
    </g>

    <text x="20" y="440" fill="#94A3B8" fontSize="13.5">
      The highlight: each token activates only 16/896 ≈ 1.8% of experts — the secret that makes a 2.8T model runnable.
    </text>
  </svg>
);

const Scene3: React.FC = () => (
  <svg viewBox="0 0 760 300" width="100%" height="300">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Expert panel: process independently, merge by weight</text>

    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i} transform={`translate(${36 + i * 118}, 90)`}>
        <rect x="0" y="0" width="102" height="52" rx="8" fill="rgba(0,242,254,0.10)" stroke="#00F2FE" strokeWidth="1.4" />
        <text x="51" y="22" fill="#00F2FE" fontSize="12" fontWeight="bold" textAnchor="middle">E{i + 1}</text>
        <text x="51" y="42" fill="#94A3B8" fontSize="11" textAnchor="middle">3584-d (FFN: 3072)</text>
      </g>
    ))}
    <text x={40} y={165} fill="#64748B" fontSize="11.5">(16 experts total; 6 shown)</text>

    <path d="M 88 142 L 340 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />
    <path d="M 204 142 L 380 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />
    <path d="M 320 142 L 420 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />
    <path d="M 436 142 L 460 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />
    <path d="M 552 142 L 500 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />
    <path d="M 668 142 L 540 200" stroke="rgba(0,242,254,0.4)" strokeWidth="1.4" className="bgn-flow-line" />

    <g transform="translate(560,190)">
      <rect x="0" y="0" width="180" height="60" rx="10" fill="rgba(155,81,224,0.15)" stroke="#A78BFA" strokeWidth="2" />
      <text x="90" y="24" fill="#A78BFA" fontSize="13.5" fontWeight="bold" textAnchor="middle">Weighted merge</text>
      <text x="90" y="46" fill="#94A3B8" fontSize="11" textAnchor="middle">sum of 16 × router weights</text>
    </g>

    <FlowLine x1={750} y1={220} x2={760} y2={220} width={0} />
    <TokenChip text="out" x={700} y={250} w={60} h={34} color="#00E676" />

    <text x="20" y="252" fill="#94A3B8" fontSize="13.5">
      16 experts each compute a result × router weight, then summed → layer output.
    </text>
    <text x="20" y="274" fill="#94A3B8" fontSize="13.5">
      Like 16 specialists producing one joint opinion.
    </text>
  </svg>
);

const Scene4: React.FC = () => (
  <svg viewBox="0 0 760 260" width="100%" height="260">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Don't forget the 2 shared "generalists"</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">Besides the 16 routed experts, K3 has 2 shared experts every token must pass through — they guarantee basic capabilities.</text>

    <TokenChip text="cat" x={60} y={100} w={70} h={44} color="#38BDF8" />
    <FlowLine x1={140} y1={122} x2={230} y2={122} color="#38BDF8" />

    <g transform="translate(240,80)">
      <rect x="0" y="0" width="150" height="84" rx="10" fill="rgba(0,230,118,0.10)" stroke="#00E676" strokeWidth="1.8" />
      <text x="75" y="28" fill="#00E676" fontSize="13" fontWeight="bold" textAnchor="middle">Shared ×2</text>
      <text x="75" y="50" fill="#94A3B8" fontSize="11.5" textAnchor="middle">seen by every token</text>
      <text x="75" y="68" fill="#94A3B8" fontSize="11.5" textAnchor="middle">the "generalists"</text>
    </g>

    <text x="440" y="105" fill="#00E676" fontSize="15" fontWeight="bold">+</text>
    <g transform="translate(470,80)">
      <rect x="0" y="0" width="150" height="84" rx="10" fill="rgba(0,242,254,0.10)" stroke="#00F2FE" strokeWidth="1.8" />
      <text x="75" y="28" fill="#00F2FE" fontSize="13" fontWeight="bold" textAnchor="middle">Routed ×16</text>
      <text x="75" y="50" fill="#94A3B8" fontSize="11.5" textAnchor="middle">picked per token</text>
      <text x="75" y="68" fill="#94A3B8" fontSize="11.5" textAnchor="middle">the "specialists"</text>
    </g>

    <text x="20" y="215" fill="#94A3B8" fontSize="13.5">
      Why keep shared experts? Routing can go off-course — two generalists guarantee
    </text>
    <text x="20" y="237" fill="#94A3B8" fontSize="13.5">
      basic skills like grammar and common sense never go missing.
    </text>
  </svg>
);

const Scene5: React.FC = () => (
  <svg viewBox="0 0 760 280" width="100%" height="280">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Problem: unbalanced expert workload</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">If everyone picks the "best" expert, a few get overloaded while most sit idle (waste).</text>

    {/* imbalance bars */}
    <g transform="translate(60,90)">
      <text x="0" y="12" fill="#FFB000" fontSize="13" fontWeight="bold">Unbalanced (bad):</text>
      {Array.from({ length: 24 }, (_, i) => {
        const over = [8, 9, 10, 11].includes(i);
        const idle = [16, 17, 18, 19, 20, 21, 22, 23].includes(i);
        const h = over ? 60 : idle ? 8 : 34;
        return <rect key={i} x={i * 15} y={95 - h} width={11} height={h} rx="2" fill={over ? '#FF1744' : idle ? 'rgba(255,255,255,0.12)' : 'rgba(255,176,0,0.5)'} />;
      })}
      <text x="0" y="115" fill="#64748B" fontSize="11.5">a few overloaded (red), most idle (gray)</text>
    </g>

    <g transform="translate(420,90)">
      <text x="0" y="12" fill="#00E676" fontSize="13" fontWeight="bold">K3's fix (good):</text>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={i * 15} y={95 - 34 - Math.sin(i * 2.1) * 8} width={11} height={34 + Math.sin(i * 2.1) * 8} rx="2" fill="rgba(0,230,118,0.55)" />
      ))}
      <text x="0" y="115" fill="#64748B" fontSize="11.5">Quantile Balancing evens the load</text>
    </g>

    <text x="20" y="235" fill="#94A3B8" fontSize="13.5">
      K3 uses two tricks: Quantile Balancing (adjusts routing scores by quantile, no harsh penalties)
    </text>
    <text x="20" y="257" fill="#94A3B8" fontSize="13.5">
      keeps load balanced; the SiTU-GLU activation keeps training stable at high sparsity.
    </text>
  </svg>
);

export const LessonMoE: BeginnerLesson = {
  id: 'moe',
  label: 'MoE experts',
  emoji: '🏥',
  title: 'Lesson 4 · Mixture of Experts (pick 16 of 896)',
  subtitle: 'Why a 2.8T-parameter model can still run: each token only calls 16 experts.',
  scenes: [
    {
      title: 'Problem: 2.8T parameters × every token = too expensive',
      analogy: 'A hospital with 896 specialists, but one visit only needs 16 of them — huge hospital, small bill.',
      explain: <>K3 has 2.8T total parameters, but thanks to the <b>Mixture of Experts (MoE)</b> architecture, each token only activates 16 routed + 2 shared experts ≈ 104B parameters.</>,
      visual: <Scene1 />,
    },
    {
      title: 'The router: a "triage desk"',
      analogy: 'The triage nurse hears symptoms and decides which department — the router decides which experts handle each token.',
      explain: <>The router scores all 896 experts and picks the <b>top 16</b> for this token. Different tokens get different experts: math problems find math experts, code finds code experts.</>,
      visual: <Scene2 />,
      keypoint: '16/896 ≈ 1.8% activation — the compute premise that lets a 2.8T model run.',
    },
    {
      title: 'Expert panel: process independently, merge by weight',
      analogy: '16 specialists consult: each gives an opinion (an output vector), weighted by credibility into the final diagnosis.',
      explain: <>The 16 experts run in parallel; their outputs are <b>weighted-summed</b> by router weights into the layer output. Inside each expert: down-project → nonlinear transform (SiTU-GLU) → up-project back.</>,
      visual: <Scene3 />,
    },
    {
      title: 'Don\'t forget the 2 shared "generalists"',
      analogy: 'Before any specialty consult, a generalist runs basic checks — fundamentals never slip.',
      explain: <>Besides the 16 dynamically-routed experts, <b>2 shared experts</b> participate in every token's computation, guaranteeing general capabilities like grammar and common sense.</>,
      visual: <Scene4 />,
    },
    {
      title: 'Problem: unbalanced expert workload',
      analogy: 'If everyone books the most popular doctor, the hot ones burn out and the rest idle — the queue needs regulation.',
      explain: <>K3 uses <b>Quantile Balancing</b> (quantile-based routing-score adjustment) to prevent overload of a few experts; the SiTU-GLU activation keeps 896-expert high-sparsity training stable.</>,
      visual: <Scene5 />,
      tip: 'Note: the router assigns each expert a weight score — it isn\'t a hard on/off switch; low scores don\'t mean zero participation.',
    },
  ],
};
