import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip, VecBar } from './BeginnerAcademy';

/* ============ Lesson 1: Tokens → numbers ============ */

const Scene1: React.FC = () => (
  <svg viewBox="0 0 760 240" width="100%" height="240">
    <BgnArrows />
    <text x="20" y="36" fill="#E2E8F0" fontSize="18" fontWeight="bold">Why must everything become numbers?</text>
    <text x="20" y="62" fill="#94A3B8" fontSize="14">Computers can only add, subtract, multiply and divide numbers — they don't understand text or images.</text>

    <g>
      <text x="80" y="118" fill="#38BDF8" fontSize="16" fontWeight="bold" textAnchor="middle">cat</text>
      <text x="80" y="142" fill="#64748B" fontSize="12" textAnchor="middle">one token</text>
    </g>
    <FlowLine x1={120} y1={112} x2={210} y2={112} />
    <g>
      <text x="260" y="118" fill="#00F2FE" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1001 0110</text>
      <text x="260" y="142" fill="#64748B" fontSize="12" textAnchor="middle" fontFamily="monospace">0101 1011 ...</text>
    </g>
    <FlowLine x1={400} y1={112} x2={490} y2={112} color="#A78BFA" />
    <g>
      <text x="560" y="118" fill="#A78BFA" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">[0.3, -1.2, 0.8, ...]</text>
      <text x="560" y="142" fill="#64748B" fontSize="12" textAnchor="middle">a string of "meaning numbers"</text>
    </g>

    <g className="bgn-float">
      <circle cx="170" cy="112" r="7" fill="#38BDF8" className="bgn-particle" />
    </g>

    <text x="20" y="196" fill="#94A3B8" fontSize="13.5">
      "Meaning numbers" are a <tspan fill="#00F2FE" fontWeight="bold">vector</tspan> — a list of numbers, each one a "meaning dimension".
    </text>
    <text x="20" y="220" fill="#94A3B8" fontSize="13.5">
      In K3 every token becomes a <tspan fill="#00F2FE" fontWeight="bold">7168-number vector</tspan>: a token may be a word, part of a word, a character, or a special symbol.
    </text>
  </svg>
);

const Scene2: React.FC = () => (
  <svg viewBox="0 0 760 270" width="100%" height="270">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Step 1: Tokenizer</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">First, split the sentence into small pieces — each piece is a <tspan fill="#00F2FE" fontWeight="bold">Token</tspan>.</text>

    <rect x="20" y="84" width="720" height="46" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
    <text x="380" y="113" fill="#E2E8F0" fontSize="16" textAnchor="middle">I like cats and dogs</text>
    <FlowLine x1={380} y1={132} x2={380} y2={162} color="#38BDF8" />

    <TokenChip text="I" x={130} y={162} color="#38BDF8" />
    <TokenChip text="like" x={210} y={162} color="#38BDF8" />
    <TokenChip text="cats" x={296} y={162} color="#38BDF8" />
    <TokenChip text="and" x={376} y={162} color="#38BDF8" />
    <TokenChip text="dogs" x={456} y={162} color="#38BDF8" />
    <text x={540} y={182} fill="#64748B" fontSize="13">→ split into 5 tokens</text>

    <text x="20" y="228" fill="#94A3B8" fontSize="13.5">
      Token boundaries depend on the tokenizer: a token may be a whole word, part of a word, a character, or a special symbol.
    </text>
    <text x="20" y="250" fill="#94A3B8" fontSize="13.5">
      K3's vocabulary holds about 160K tokens.
    </text>
  </svg>
);

const Scene3: React.FC = () => (
  <svg viewBox="0 0 760 290" width="100%" height="290">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Step 2: look up the "meaning dictionary" (Embedding)</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">Each token looks up its own row in a giant 160K-row table and copies out that row of numbers.</text>

    <TokenChip text="cat" x={40} y={96} color="#38BDF8" />
    <FlowLine x1={118} y1={116} x2={196} y2={116} color="#38BDF8" />

    {/* dictionary table */}
    <g>
      <rect x={200} y={86} width={250} height={118} rx="8" fill="#0A0F1D" stroke="rgba(255,255,255,0.12)" />
      <text x={212} y={108} fill="#64748B" fontSize="11">Embedding Table: 160K rows × 7168 cols</text>
      {[
        { t: 'I', y: 126, lit: false },
        { t: 'like', y: 146, lit: false },
        { t: 'cats', y: 166, lit: true },
        { t: 'dogs', y: 186, lit: false },
        { t: '…', y: 202, lit: false },
      ].map((row) => (
        <g key={row.t}>
          <rect x={208} y={row.y} width={42} height={16} rx="3" fill={row.lit ? '#00F2FE' : 'transparent'} stroke={row.lit ? '#00F2FE' : 'transparent'} />
          <text x={229} y={row.y + 12.5} fontSize="11" fill={row.lit ? '#02121d' : '#94A3B8'} fontWeight={row.lit ? 800 : 400} textAnchor="middle">{row.t}</text>
          <rect x={256} y={row.y} width={180} height={16} rx="3" fill={row.lit ? 'rgba(0,242,254,0.25)' : 'rgba(255,255,255,0.05)'} className={row.lit ? 'bgn-sweep' : undefined} />
        </g>
      ))}
      <circle cx={440} cy={166} r="6" fill="none" stroke="#00F2FE" strokeWidth="1.5" className="bgn-ripple" />
    </g>

    <FlowLine x1={464} y1={116} x2={494} y2={116} color="#A78BFA" />

    <g>
      <text x={605} y={106} fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">cat's vector</text>
    </g>
    <g transform="translate(500,122)">
      <VecBar cells={32} width={210} height={18} highlight={{ from: 3, to: 6 }} />
    </g>
    <text x={500} y={170} fill="#64748B" fontSize="12">first 32 of the 7168 numbers</text>
    <text x={500} y={192} fill="#94A3B8" fontSize="12" fontFamily="monospace">[-0.41, 1.02, 0.36, <tspan fill="#00F2FE">1.87,</tspan> …]</text>

    <text x="20" y="246" fill="#94A3B8" fontSize="13.5">
      These numbers aren't random — training learns them: similar meanings get similar numbers.
    </text>
    <text x="20" y="266" fill="#94A3B8" fontSize="13.5">
      This is where the model's understanding of language begins.
    </text>
  </svg>
);

const Scene4: React.FC = () => (
  <svg viewBox="0 0 760 280" width="100%" height="280">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Images become tokens too</text>
    <text x="20" y="60" fill="#94A3B8" fontSize="14">Images are cut into 14×14 patches (like a puzzle); each patch first becomes a patch feature.</text>

    {/* image grid */}
    <g transform="translate(60,90)">
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={(i % 4) * 30}
          y={Math.floor(i / 4) * 30}
          width={26}
          height={26}
          rx="3"
          fill={i === 5 ? 'rgba(0,242,254,0.4)' : 'rgba(255,255,255,0.07)'}
          stroke={i === 5 ? '#00F2FE' : 'rgba(255,255,255,0.12)'}
          strokeWidth={i === 5 ? 2 : 1}
        />
      ))}
      <text x="60" y="140" fill="#64748B" fontSize="12" textAnchor="middle">whole image</text>
      <text x="60" y="158" fill="#64748B" fontSize="12" textAnchor="middle">14×14 patch grid</text>
    </g>

    <FlowLine x1={220} y1={140} x2={300} y2={140} color="#A78BFA" />

    {/* single patch zoom */}
    <g transform="translate(305,105)">
      <rect x="0" y="0" width="56" height="56" rx="4" fill="rgba(167,139,250,0.15)" stroke="#A78BFA" strokeWidth="2" />
      <text x="28" y="34" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">1 patch</text>
      <text x="28" y="74" fill="#64748B" fontSize="11" textAnchor="middle">14×14×3 pixel values</text>
    </g>

    <FlowLine x1={420} y1={140} x2={490} y2={140} color="#A78BFA" />

    <g transform="translate(495,100)">
      <rect x="0" y="0" width="230" height="72" rx="8" fill="#0A0F1D" stroke="rgba(167,139,250,0.4)" />
      <text x="115" y="30" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">MoonViT-V2 vision encoder</text>
      <text x="115" y="52" fill="#94A3B8" fontSize="12" textAnchor="middle">27-layer network "reads" patch features</text>
    </g>

    <FlowLine x1={725} y1={140} x2={750} y2={140} color="#00F2FE" width={0} />

    <text x="20" y="262" fill="#94A3B8" fontSize="13">
      Patch features are grouped by 2×2 Pixel Shuffle: 4 neighboring patch features become 1 visual token, then queue with text tokens.
    </text>
  </svg>
);

const Scene5: React.FC = () => (
  <svg viewBox="0 0 760 240" width="100%" height="240">
    <BgnArrows />
    <text x="20" y="34" fill="#E2E8F0" fontSize="18" fontWeight="bold">Summary: a stream of vectors flows through the model</text>

    <rect x="20" y="60" width="720" height="96" rx="10" fill="rgba(0,242,254,0.05)" stroke="rgba(0,242,254,0.25)" />

    <TokenChip text="I" x={70} y={86} color="#38BDF8" />
    <TokenChip text="like" x={150} y={86} color="#38BDF8" />
    <TokenChip text="[img]" x={240} y={86} color="#A78BFA" />
    <TokenChip text="cats" x={330} y={86} color="#38BDF8" />
    <TokenChip text="and" x={410} y={86} color="#38BDF8" />
    <TokenChip text="dogs" x={490} y={86} color="#38BDF8" />

    <g>
      <rect x={60} y={132} width={110} height={14} rx="3" fill="rgba(56,189,248,0.25)" />
      <rect x={140} y={132} width={110} height={14} rx="3" fill="rgba(56,189,248,0.25)" />
      <rect x={230} y={132} width={110} height={14} rx="3" fill="rgba(167,139,250,0.25)" />
      <rect x={320} y={132} width={110} height={14} rx="3" fill="rgba(56,189,248,0.25)" />
      <rect x={400} y={132} width={110} height={14} rx="3" fill="rgba(56,189,248,0.25)" />
      <rect x={480} y={132} width={110} height={14} rx="3" fill="rgba(56,189,248,0.25)" />
    </g>
    <text x={758} y={143} fill="#94A3B8" fontSize="12" textAnchor="end">each: 7168-dim vector</text>

    <text x="20" y="196" fill="#94A3B8" fontSize="13.5">
      The 93 backbone layers only transform this vector stream and exchange information along it,
    </text>
    <text x="20" y="218" fill="#94A3B8" fontSize="13.5">
      until text is finally generated.
    </text>
  </svg>
);

export const LessonTokens: BeginnerLesson = {
  id: 'tokens',
  label: 'Tokens → numbers',
  emoji: '🔤',
  title: 'Lesson 1 · Tokens to numbers (Token & Embedding)',
  subtitle: 'Computers only understand numbers, so text and images must be "translated" into vectors.',
  scenes: [
    {
      title: 'Why must everything become numbers?',
      analogy: 'Like sending a telegram in Morse code: every token must first be translated into dots and dashes before the machine can send it.',
      explain: <>K3's first step is translating text into <b>numbers</b> the machine can compute with. The result isn't a plain ID — it's a list of numbers (a vector) that carries <b>meaning</b>.</>,
      visual: <Scene1 />,
      keypoint: 'Token → 7168-dim vector: a list of numbers that expresses "meaning".',
    },
    {
      title: 'Step 1: Tokenizer',
      analogy: 'Like splitting a phrase before looking it up — "I like cats" becomes "I / like / cats".',
      explain: <>The model first cuts the sentence into small pieces; each piece is a <b>Token</b>. K3's vocabulary holds about 160K tokens.</>,
      visual: <Scene2 />,
      tip: 'Why split at all? Feeding a whole sentence in at once leaves the machine no token boundaries; once split, every token can look up its own "meaning dictionary" entry.',
    },
    {
      title: 'Step 2: look up the "meaning dictionary" (Embedding)',
      analogy: 'Every dictionary entry is a row — look up "cat" and copy down that row\'s full entry.',
      explain: <>Inside the model sits a giant lookup table of <b>160K rows × 7168 columns</b> (the embedding matrix <b>W_emb</b>). Each token copies its own row → its 7168-dim vector. Training can place semantically related tokens near one another in this space.</>,
      visual: <Scene3 />,
      keypoint: 'Embedding lookup = handing every token a string of "meaning numbers" — the foundation of language understanding.',
    },
    {
      title: 'Images become tokens too',
      analogy: 'Cut a painting into puzzle pieces and number each piece — the model reads the pieces in order.',
      explain: <>Images are cut into 14×14 patches; the vision encoder <b>MoonViT-V2</b> (27 network layers) first produces patch features. Then 2×2 Pixel Shuffle groups four neighboring patch features into one visual token that queues alongside text tokens.</>,
      visual: <Scene4 />,
    },
    {
      title: 'Summary: a stream of vectors flows through the model',
      explain: <>One sentence + one image → a long stream of 7168-dim vectors, e.g. <b>[x_1, x_2, …, x_T]</b>. Everything the 93 backbone layers do is transform this stream and exchange information along it.</>,
      visual: <Scene5 />,
    },
  ],
};
