import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MoonViTSimulator } from './components/MoonViTSimulator';
import { PerHeadMuonSimulator } from './components/PerHeadMuonSimulator';
import { PreTrainingSection } from './components/PreTrainingSection';
import { PostTrainingDetails } from './components/PostTrainingDetails';
import { ReasoningSandbox } from './components/ReasoningSandbox';
import { InfrastructureDeepDive } from './components/InfrastructureDeepDive';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { CaseStudies } from './components/CaseStudies';
import { MultimodalTokenSimulator } from './components/MultimodalTokenSimulator';
import { RMSNormOperatorDeepDive } from './components/RMSNormOperatorDeepDive';
import { KDAOperatorDeepDive } from './components/KDAOperatorDeepDive';
import { MLAOperatorDeepDive } from './components/MLAOperatorDeepDive';
import { MoEOperatorDeepDive } from './components/MoEOperatorDeepDive';
import { AttnResOperatorDeepDive } from './components/AttnResOperatorDeepDive';
import { UnembeddingOperatorDeepDive } from './components/UnembeddingOperatorDeepDive';
import { RoPEOperatorDeepDive } from './components/RoPEOperatorDeepDive';

type Tab = 'overview' | 'kda' | 'attnres' | 'moe' | 'vision' | 'multimodal' | 'muon' | 'pretrain' | 'posttrain' | 'rl' | 'infrastructure' | 'evaluation' | 'cases' | 'op_rmsnorm' | 'op_kda' | 'op_mla' | 'op_rope' | 'op_moe' | 'op_attnres' | 'op_unembed';

type NavSection = {
  title: string;
  items: Array<{ id: Tab; label: string }>;
};

const navSections: NavSection[] = [
  { title: 'Chapter 1: System Overview', items: [{ id: 'overview', label: 'Architecture Overview' }] },
  {
    title: 'Chapter 2: Model Architecture',
    items: [
      { id: 'multimodal', label: '§2.1 Layer 0 Multimodal Alignment' },
      { id: 'op_rmsnorm', label: '§2.2 RMSNorm Operator' },
      { id: 'kda', label: '§2.3 KDA Gated Delta Attention' },
      { id: 'op_mla', label: '§2.4 MLA Latent Attention' },
      { id: 'op_rope', label: '§2.5 RoPE Rotary Position Encoding' },
      { id: 'moe', label: '§2.6 Stable LatentMoE' },
      { id: 'vision', label: '§2.7 MoonViT Native Vision' },
      { id: 'attnres', label: '§2.8 AttnRes Cross-Layer Retrieval' },
      { id: 'muon', label: '§2.9 Per-Head Muon Optimizer' },
      { id: 'op_unembed', label: '§2.10 Unembedding Output Head' },
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

const getTabContent = (activeTab: Tab, onNavigate: (tab: Tab) => void): React.ReactNode => {
  const tabMap: Record<Tab, React.ReactNode> = {
    overview: <Dashboard onNavigateTab={onNavigate} />,
    kda: <KDAOperatorDeepDive />,
    attnres: <AttnResOperatorDeepDive />,
    moe: <MoEOperatorDeepDive />,
    vision: <MoonViTSimulator />,
    multimodal: <MultimodalTokenSimulator />,
    muon: <PerHeadMuonSimulator />,
    pretrain: <PreTrainingSection />,
    posttrain: <PostTrainingDetails />,
    rl: <ReasoningSandbox />,
    infrastructure: <InfrastructureDeepDive />,
    evaluation: <EvaluationDashboard />,
    cases: <CaseStudies />,
    op_rmsnorm: <RMSNormOperatorDeepDive />,
    op_kda: <KDAOperatorDeepDive />,
    op_mla: <MLAOperatorDeepDive />,
    op_moe: <MoEOperatorDeepDive />,
    op_attnres: <AttnResOperatorDeepDive />,
    op_rope: <RoPEOperatorDeepDive />,
    op_unembed: <UnembeddingOperatorDeepDive />,
  };
  return tabMap[activeTab];
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
        {getTabContent(activeTab, setActiveTab)}
      </main>
    </div>
  );
};

export default App;
