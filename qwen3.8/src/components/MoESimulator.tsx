import React from 'react';
import { MoETrainingExplorer } from './MoETrainingExplorer';

export const MoESimulator: React.FC = () => (
  <div className="tab-panel active">
    <header>
      <div className="badge">Chapter 2.5 — Stable LatentMoE</div>
      <h1>Stable LatentMoE: routing, learning, and expert parallelism</h1>
      <p className="subtitle">A report-grounded walkthrough of sparse routing. It uses only published architecture figures and does not invent router scores, expert loads, or per-expert parameter counts.</p>
    </header>
    <MoETrainingExplorer />
    <section className="card">
      <div className="card-title">Published architecture facts</div>
      <div className="moe-fact-grid">
        <div><span>Backbone width</span><strong>7,168</strong></div>
        <div><span>LatentMoE width</span><strong>3,584</strong></div>
        <div><span>Routed experts / token</span><strong>16 / 896</strong></div>
        <div><span>Shared experts / layer</span><strong>2</strong></div>
        <div><span>Expert hidden width</span><strong>3,072</strong></div>
        <div><span>Activated parameters / token</span><strong>104.2B</strong></div>
      </div>
      <p className="architecture-source">Source: Table 1 and Sections 2.3, 5.2.1 of the bundled Kimi K3 Technical Report. The report does not publish individual expert parameter counts, fixed routing scores, or fixed per-expert loads.</p>
    </section>
  </div>
);
