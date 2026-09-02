import React, { useState } from 'react';

type Mode = 'router' | 'balancing' | 'training' | 'parallel' | 'inference';

const modes: Array<{ id: Mode; label: string; title: string; source: string; steps: Array<{ name: string; input: string; compute: string; output: string }> }> = [
  {
    id: 'router', label: '1. Router', title: 'How one token selects experts', source: 'Report §2.3.3, Eq. 13',
    steps: [
      { name: 'Token representation', input: 'x ∈ R^7,168', compute: 'Use the backbone hidden state as router input.', output: 'router input x' },
      { name: 'Expert scores', input: 'x', compute: 's = sigmoid(Wᵣx) produces one score for each of 896 routed experts.', output: '896 router scores' },
      { name: 'QB-adjusted ranking', input: 's + b', compute: 'Expert-specific bias b changes dispatch ranking; b comes from an earlier batch.', output: 'Top-(k+1) cutoff and candidate ranking' },
      { name: 'Dispatch', input: 'ranked experts', compute: 'Select Top-16 experts for this token.', output: '16 routed-expert IDs' },
      { name: 'Mixture weights', input: 'raw scores for selected experts', compute: 'Normalize raw s only; the QB bias is deliberately omitted from mixture weights.', output: '16 weights pᵢⱼ' },
    ],
  },
  {
    id: 'balancing', label: '2. Quantile Balancing', title: 'How K3 prevents overloaded and undertrained experts', source: 'Report §2.3.3, Eq. 14',
    steps: [
      { name: 'Collect margins', input: 'current batch router scores', compute: 'For each expert, compare its raw score with each token’s Top-(k+1) cutoff.', output: 'per-expert score margins' },
      { name: 'Global histogram', input: 'margins across ranks', compute: 'Each rank contributes histogram bins; one all-reduce pools counts instead of gathering all margins.', output: 'global margin histogram per expert' },
      { name: 'Quantile update', input: 'histogram + target load', compute: 'Set the next bias to the quantile matching the target number of tokens per expert.', output: 'next-step expert bias b' },
      { name: 'Delayed application', input: 'bias from prior batch', compute: 'A batch is never routed with a bias derived from itself.', output: 'causal next-batch routing rule' },
    ],
  },
  {
    id: 'training', label: '3. Expert training', title: 'How selected experts learn', source: 'Report §2.3 and §2.3.2',
    steps: [
      { name: 'Latent compression', input: 'x ∈ R^7,168', compute: 'Down-project with W↓ into the routed latent space.', output: 'z ∈ R^3,584' },
      { name: 'Selected experts', input: 'z + 16 expert IDs', compute: 'Each selected expert applies its feed-forward transformation with hidden width 3,072 and SiTU-GLU.', output: '16 expert outputs' },
      { name: 'Aggregate and return', input: 'expert outputs + pᵢⱼ', compute: 'Weighted aggregate → RMSNorm → W↑ projects back to backbone width.', output: 'routed result ∈ R^7,168' },
      { name: 'Shared path and gradient', input: 'x and routed result', compute: 'Two full-width shared experts run in parallel; both paths are added. Backpropagation updates the router, selected experts, shared experts, and projections.', output: 'next training update' },
    ],
  },
  {
    id: 'parallel', label: '4. Expert parallelism', title: 'How routed experts train across devices', source: 'Report §5.2.1',
    steps: [
      { name: 'Plan', input: 'router outputs for a micro-batch and layer', compute: 'MoonEP plans redundant experts online and prefetches them before routed-expert computation.', output: 'balanced expert placement plan' },
      { name: 'Dispatch', input: 'selected token/expert pairs', compute: 'A fused permute sends tokens directly to expert-grouped positions across EP ranks.', output: 'expert-grouped token buffers' },
      { name: 'Compute and combine', input: 'balanced buffers', compute: 'Every rank receives the same S × K token workload, then expert results are combined.', output: 'balanced forward result' },
      { name: 'Backward', input: 'expert gradients', compute: 'Gradients for redundant experts are staged locally and reduced back to their home ranks.', output: 'synchronized parameter updates' },
    ],
  },
  {
    id: 'inference', label: '5. Training vs inference', title: 'What changes after training', source: 'Report §2.3.3',
    steps: [
      { name: 'Training', input: 'global batch statistics', compute: 'QB updates its bias for the next step; gradients update model parameters.', output: 'new router/expert parameters and next bias' },
      { name: 'Inference', input: 'one request token', compute: 'Use the trained router and frozen final QB bias; select Top-16, run experts, and aggregate.', output: 'next hidden state' },
    ],
  },
];

export const MoETrainingExplorer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('router');
  const [step, setStep] = useState(0);
  const active = modes.find((item) => item.id === mode) ?? modes[0];
  const current = active.steps[step];

  const selectMode = (nextMode: Mode) => { setMode(nextMode); setStep(0); };

  return (
    <section className="card moe-training-explorer" aria-labelledby="moe-explorer-title">
      <div className="card-title" id="moe-explorer-title">MoE Training Explorer: one token, one training step</div>
      <p className="flow-intro">A deterministic walkthrough of the mechanisms disclosed in the Kimi K3 report. Select a topic, then advance one step at a time.</p>
      <div className="moe-mode-tabs" role="tablist" aria-label="MoE explainer topics">
        {modes.map((item) => <button key={item.id} role="tab" aria-selected={mode === item.id} className={mode === item.id ? 'active' : ''} onClick={() => selectMode(item.id)}>{item.label}</button>)}
      </div>
      <div className="moe-step-visual">
        <div className="moe-step-counter">Step {step + 1} / {active.steps.length}</div>
        <h3>{active.title}</h3>
        <div className="moe-io-grid">
          <div><span>Input</span><strong>{current.input}</strong></div>
          <div className="moe-compute"><span>Internal computation</span><p>{current.compute}</p></div>
          <div><span>Output</span><strong>{current.output}</strong></div>
        </div>
        <div className="moe-process-rail" aria-hidden="true"><i style={{ width: `${((step + 1) / active.steps.length) * 100}%` }} /></div>
        <div className="moe-step-name">{current.name}</div>
      </div>
      <div className="control-panel">
        <button className="btn-secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Previous step</button>
        <button className="btn-primary" disabled={step === active.steps.length - 1} onClick={() => setStep((value) => value + 1)}>Next step</button>
        <span className="moe-source">{active.source}</span>
      </div>
    </section>
  );
};
