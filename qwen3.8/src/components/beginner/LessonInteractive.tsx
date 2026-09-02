import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';

/* ============ Lesson 7: interactive transformer (poloclub transformer-explainer) ============ */

const IframePanel: React.FC<{ height?: number }> = ({ height = 820 }) => (
  <iframe
    src="/transformer-explainer/index.html"
    title="Transformer Explainer — interactive GPT-2 walkthrough"
    style={{
      width: '100%',
      height,
      border: '1px solid rgba(148,163,184,0.25)',
      borderRadius: 12,
      background: '#fff',
    }}
  />
);

const Scene1: React.FC = () => (
  <div>
    <p style={{ margin: '0 0 10px', color: '#94A3B8', fontSize: 13 }}>
      <b style={{ color: '#38BDF8' }}>Transformer Explainer</b> (Georgia Tech, open source) runs the real GPT-2 in
      your browser on built-in prompts — no download, no network wait. Everything below is clickable.
    </p>
    <IframePanel />
  </div>
);

const Scene2: React.FC = () => (
  <div>
    <p style={{ margin: '0 0 10px', color: '#94A3B8', fontSize: 13 }}>
      Same panel — now try: switch <b style={{ color: '#38BDF8' }}>Examples</b> in the top-left dropdown to change
      the prompt, and hover any token, arrow or number to see what it means.
    </p>
    <IframePanel />
  </div>
);

const Scene3: React.FC = () => (
  <div>
    <p style={{ margin: '0 0 10px', color: '#94A3B8', fontSize: 13 }}>
      Go deep: expand <b style={{ color: '#A78BFA' }}>Block 1</b> to step through Q/K/V → attention → MLP, flip
      between the <b style={{ color: '#A78BFA' }}>12 layers</b> and <b style={{ color: '#A78BFA' }}>12 heads</b>,
      and drag <b style={{ color: '#A78BFA' }}>temperature</b> / <b style={{ color: '#A78BFA' }}>top-k</b> to feel
      how sampling changes the predicted token.
    </p>
    <IframePanel />
  </div>
);

export const LessonInteractive: BeginnerLesson = {
  id: 'interactive',
  label: 'Interactive Transformer',
  emoji: '🖱️',
  title: 'Lesson 7 · Play with a real transformer',
  subtitle: 'A clickable GPT-2 in your browser — every number, every layer, every head (from Transformer Explainer, Georgia Tech).',
  embedded: true,
  scenes: [
    {
      title: 'A real transformer, running in your browser',
      explain: <>Below is <b>Transformer Explainer</b> — the open-source GPT-2 visualization from Georgia Tech, embedded as a full interactive panel. It runs on built-in example prompts, so everything works instantly with no model download. <a href="https://github.com/poloclub/transformer-explainer" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://arxiv.org/abs/2408.04619" target="_blank" rel="noopener noreferrer">arXiv</a> · MIT License.</>,
      visual: <Scene1 />,
    },
    {
      title: 'Pick a prompt and watch the numbers flow',
      explain: <>Use the <b>Examples</b> dropdown to switch between 5 built-in prompts. The whole pipeline re-animates: tokens → embeddings → 12 transformer blocks → final next-token probabilities.</>,
      visual: <Scene2 />,
    },
    {
      title: 'Go as deep as you like',
      explain: <>Expand a block to see Q/K/V, attention matrices and the MLP step by step; flip through layers and heads; adjust <b>temperature</b> and <b>top-k</b> to feel how sampling changes the output.</>,
      visual: <Scene3 />,
    },
  ],
};
