import React, { useEffect, useState } from 'react';

type GuideStep = {
  label: string;
  number: string;
  title: string;
  explanation: string;
  metaphor: string;
  color: string;
};

const guideSteps: GuideStep[] = [
  { label: 'Scale', number: '2.78T', title: 'A very large knowledge library', explanation: 'This is the model’s total parameter count. Parameters are the adjustable values learned from data; more of them can store more patterns.', metaphor: 'Total library capacity: all shelves combined', color: '#00F2FE' },
  { label: 'Compute', number: '104.2B', title: 'Only some experts work for each token', explanation: 'The library is large, but one token does not open every shelf. Sparse MoE activates only part of the model for each token.', metaphor: 'The specialists on duty for this request', color: '#10B981' },
  { label: 'Routing', number: '896 → 16', title: 'A specialist team with selective routing', explanation: 'MoE divides work among experts. A router sends each token to 16 of 896 routed experts, balancing capacity and computation.', metaphor: 'Like hospital triage: the case goes to the relevant department', color: '#C084FC' },
  { label: 'Context', number: '1M', title: 'Up to one million tokens of context', explanation: 'The context window is the input range the model can reference. KDA maintains recurrent state instead of endlessly growing a history cache.', metaphor: 'Reading a very long book while updating a working whiteboard', color: '#38BDF8' },
  { label: 'Training', number: '8K → 1M', title: 'Short contexts first, then longer ones', explanation: 'Long-context capability is trained progressively: 8K and 64K in pre-training, then 256K and 1M during cooldown.', metaphor: 'Like training endurance: start shorter and extend gradually', color: '#FFB000' },
];

export const LearningGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setActiveStep((step) => (step + 1) % guideSteps.length), 4200);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const step = guideSteps[activeStep];

  return (
    <section className="card learning-guide" aria-labelledby="guide-title">
      <div className="guide-heading">
        <div>
          <span className="eyebrow">Understand the big picture first</span>
          <h2 id="guide-title">Kimi K3 design: a 90-second guide</h2>
          <p>Think of a model as a library, a specialist team, and a working memory. This animation explains why Kimi K3 is designed this way.</p>
        </div>
        <button className="btn-secondary guide-play" onClick={() => setIsPlaying((playing) => !playing)} aria-pressed={isPlaying}>
          {isPlaying ? 'Pause guide' : 'Play guide'}
        </button>
      </div>

      <div className="guide-number" style={{ '--guide-color': step.color } as React.CSSProperties}>
        <span className="guide-number-label">{step.label}</span>
        <strong key={step.number}>{step.number}</strong>
        <span className="guide-pulse" aria-hidden="true" />
      </div>

      <div className="guide-copy" aria-live="polite">
        <h3>{step.title}</h3>
        <p>{step.explanation}</p>
        <div className="guide-metaphor">💡 {step.metaphor}</div>
      </div>

      <div className="guide-steps" role="tablist" aria-label="Guide steps">
        {guideSteps.map((item, index) => (
          <button key={item.label} className={index === activeStep ? 'guide-step active' : 'guide-step'} onClick={() => { setActiveStep(index); setIsPlaying(false); }} role="tab" aria-selected={index === activeStep}>
            <span className="guide-step-dot" style={{ backgroundColor: item.color }} />
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
};
