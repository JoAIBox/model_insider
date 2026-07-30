import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { KDASimulator } from './components/KDASimulator';
import { AttnResSimulator } from './components/AttnResSimulator';
import { MoESimulator } from './components/MoESimulator';
import { MoonViTSimulator } from './components/MoonViTSimulator';
import { PerHeadMuonSimulator } from './components/PerHeadMuonSimulator';
import { PreTrainingSection } from './components/PreTrainingSection';
import { PostTrainingDetails } from './components/PostTrainingDetails';
import { ReasoningSandbox } from './components/ReasoningSandbox';
import { InfrastructureDeepDive } from './components/InfrastructureDeepDive';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { CaseStudies } from './components/CaseStudies';
import { MultimodalTokenSimulator } from './components/MultimodalTokenSimulator';

type Tab = 'overview' | 'kda' | 'attnres' | 'moe' | 'vision' | 'multimodal' | 'muon' | 'pretrain' | 'posttrain' | 'rl' | 'infrastructure' | 'evaluation' | 'cases';

type NavSection = {
  title: string;
  items: Array<{ id: Tab; label: string }>;
};

const navSections: NavSection[] = [
  { title: 'Chapter 1: System Overview', items: [{ id: 'overview', label: 'Architecture Overview' }] },
  {
    title: 'Chapter 2: Model Architecture',
    items: [
      { id: 'kda', label: '§2.1 Delta Attention' },
      { id: 'attnres', label: '§2.2 Attention Residuals' },
      { id: 'moe', label: '§2.3 Stable LatentMoE' },
      { id: 'vision', label: '§2.4 Native Vision' },
      { id: 'multimodal', label: '§2.6 Multimodal Tokenizer' },
      { id: 'muon', label: '§2.5 Per-Head Muon' },
    ],
  },
  { title: 'Chapter 3: Pre-training', items: [{ id: 'pretrain', label: 'Data and Training' }] },
  {
    title: 'Chapter 4: Post-training',
    items: [
      { id: 'posttrain', label: 'Async RL and Speculative Decoding' },
      { id: 'rl', label: 'Reasoning Sandbox' },
    ],
  },
  { title: 'Chapter 5: Infrastructure', items: [{ id: 'infrastructure', label: 'Operators and Infrastructure' }] },
  { title: 'Chapter 6: Evaluation and Safety', items: [{ id: 'evaluation', label: 'Benchmarks and Safety' }] },
  { title: 'Chapter 7: Case Studies', items: [{ id: 'cases', label: 'Compiler and Chip Projects' }] },
];

const tabContent: Record<Tab, React.ReactNode> = {
  overview: <Dashboard />,
  kda: <KDASimulator />,
  attnres: <AttnResSimulator />,
  moe: <MoESimulator />,
  vision: <MoonViTSimulator />,
  multimodal: <MultimodalTokenSimulator />,
  muon: <PerHeadMuonSimulator />,
  pretrain: <PreTrainingSection />,
  posttrain: <PostTrainingDetails />,
  rl: <ReasoningSandbox />,
  infrastructure: <InfrastructureDeepDive />,
  evaluation: <EvaluationDashboard />,
  cases: <CaseStudies />,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="app-container">
      <aside className="sidebar" aria-label="Technical report navigation">
        <div className="logo-container">
          <div className="logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#040814" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="logo-text">Kimi-K3 Demo</span>
        </div>

        <nav aria-label="Report chapters">
          <ul className="nav-links">
            {navSections.map((section) => (
              <li className="nav-group" key={section.title}>
                <div className="nav-section-title">{section.title}</div>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        aria-current={activeTab === item.id ? 'page' : undefined}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor" /></svg>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Based on the Kimi K3 technical report</p>
          <p style={{ marginTop: '4px', opacity: 0.6 }}>Moonshot AI - 2026</p>
        </div>
      </aside>

      <main className="content-area" id="main-content" tabIndex={-1}>
        {tabContent[activeTab]}
      </main>
    </div>
  );
};

export default App;
