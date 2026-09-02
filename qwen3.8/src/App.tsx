import { useEffect, useRef, useState, type CSSProperties, type ReactNode, lazy, Suspense } from 'react';
import './App.css';
import { type ModelProfile, type ModelId } from './components/qwen/QwenTopology';

// Lazy load Deep Dive & Architecture components
const QwenDashboard = lazy(() => import('./components/qwen/QwenDashboard').then(m => ({ default: m.QwenDashboard })));
const QwenTopology = lazy(() => import('./components/qwen/QwenTopology').then(m => ({ default: m.QwenTopology })));
const GDNDeepDive = lazy(() => import('./components/qwen/GDNDeepDive').then(m => ({ default: m.GDNDeepDive })));
const AttentionDeepDive = lazy(() => import('./components/qwen/AttentionDeepDive').then(m => ({ default: m.AttentionDeepDive })));
const MoEDeepDive = lazy(() => import('./components/qwen/MoEDeepDive').then(m => ({ default: m.MoEDeepDive })));
const GatedResidualDeepDive = lazy(() => import('./components/qwen/GatedResidualDeepDive').then(m => ({ default: m.GatedResidualDeepDive })));
const NgramDeepDive = lazy(() => import('./components/qwen/NgramDeepDive').then(m => ({ default: m.NgramDeepDive })));
const RoPEDeepDive = lazy(() => import('./components/qwen/RoPEDeepDive').then(m => ({ default: m.RoPEDeepDive })));
const UnembedDeepDive = lazy(() => import('./components/qwen/UnembedDeepDive').then(m => ({ default: m.UnembedDeepDive })));

import { ModelSignatureVisual, TrainingCausalityVisual, GdnFlowVisual, AttentionFlowVisual, MoeFlowVisual } from './components/QwenVisuals';

export type Tab = 
  | 'overview' 
  | 'architecture' 
  | 'op_gdn' 
  | 'op_attention' 
  | 'op_moe' 
  | 'op_gated_res' 
  | 'op_ngram' 
  | 'op_rope' 
  | 'op_unembed' 
  | 'operators' 
  | 'training' 
  | 'sources';

type EvidenceRef = { label: string; url: string; locator: string; revision: string };

const evidence = {
  repo: { label: 'Qwen3.8 official repository', url: 'https://github.com/QwenLM/Qwen3.8/tree/2ea10dc725823bf7c3e21ce8557cbe15245132ae#models', locator: 'README / Models', revision: '2ea10dc725823bf7c3e21ce8557cbe15245132ae' },
  qwen27b: { label: '27B model card', url: 'https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0#model-overview', locator: 'Model Overview', revision: '1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0' },
  a95b: { label: '2.4T-A95B model card', url: 'https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/tree/207bd685a7e3696cfaff12ded7c6a7ea0f88c996#model-overview', locator: 'Model Overview', revision: '207bd685a7e3696cfaff12ded7c6a7ea0f88c996' },
  flashCard: { label: 'Flash-Next model card', url: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540#model-overview', locator: 'Model Overview', revision: 'de4b8e4d43b917e7706784d8bb445c9af86a3540' },
  flashRepo: { label: 'Flash-Next pinned technical source', url: 'https://github.com/QwenLM/Qwen3.8-Flash-Next/tree/69885871a64393807d988b27b1b5e380e8f28526#qwen38-flash-next', locator: 'README / four architectural directions', revision: '69885871a64393807d988b27b1b5e380e8f28526' },
  flashBlog: { label: 'Flash-Next official blog', url: 'https://qwen.ai/blog?id=qwen3.8-flash-next', locator: 'QSA / Gated Residual / N-gram sections', revision: '2026-08-26 release' },
} satisfies Record<string, EvidenceRef>;

const models: Record<ModelId, ModelProfile> = {
  '27b': {
    id: '27b', name: 'Qwen3.8-27B', shortName: '27B Dense', kind: 'Dense · Vision-Language', accent: '#67e8f9',
    description: 'Compact Dense vision-language model: every Token passes through the same Dense FFN; no expert routing.',
    parameters: { backbone: '27B', active: '27B / token', note: 'Dense backbone; no expert routing' }, hidden: '5,120', hiddenDimNum: 5120, layers: 64, cycleCount: 16,
    context: '262K native · 1M extensible', modality: 'Text + image + video', blockAttention: '24 Q / 4 KV · head dim 256', deltaNet: '48 V / 16 QK · head dim 128', feedForward: 'Dense FFN · intermediate 17,408',
    extras: ['Multi-step MTP training', 'RoPE dim 64', 'Vision Encoder'], cycleAttention: 'Gated Attention', isMoe: false, mtp: 'Model card reports multi-step training', supportsSpeculativeDecoding: false,
  },
  a95b: {
    id: 'a95b', name: 'Qwen3.8-2.4T-A95B', shortName: '2.4T MoE', kind: 'Sparse MoE · Text', accent: '#c4b5fd',
    description: 'Very large sparse MoE: total parameter capacity is huge (2.4T), but each Token activates only 10 routed + 1 shared experts.',
    parameters: { backbone: '2.4T', active: '95B / token', note: 'Backbone total; 10 routed + 1 shared expert per token' }, hidden: '8,192', hiddenDimNum: 8192, layers: 92, cycleCount: 23,
    context: '262K native · 1.01M extensible', modality: 'Text', blockAttention: '64 Q / 4 KV · head dim 256', deltaNet: '128 V / 16 QK · head dim 128', feedForward: 'MoE · 512 experts · 10 routed + 1 shared',
    extras: ['Expert dim 2,048', 'Multi-step MTP training', 'RoPE dim 64'], cycleAttention: 'Gated Attention', isMoe: true, mtp: 'Model card reports multi-step training', supportsSpeculativeDecoding: false,
  },
  flash: {
    id: 'flash', name: 'Qwen3.8-Flash-Next', shortName: 'Flash-Next', kind: 'Experimental · Multimodal MoE', accent: '#fbbf24',
    description: 'Efficiency-oriented preview: QSA sparse attention, 4-Way Gated Residual, and 20M N-gram Embedding for extreme scale.',
    parameters: { backbone: '125B', ngram: '51B N-gram', mtp: '4B MTP', active: '6B main model / token', note: 'Listed components total 180B; active count refers to the main model only' }, hidden: '2,560', hiddenDimNum: 2560, layers: 48, cycleCount: 12,
    context: '262K native · 1M extensible', modality: 'Text + image + video', blockAttention: 'QSA · 24 Q / 2 KV · head dim 256', deltaNet: '48 V / 16 QK · head dim 128', feedForward: 'MoE · 512 experts · 10 routed + 1 shared',
    extras: ['4-way Gated Residual', '20M bigram/trigram entries', 'Indexer: 512 blocks / 2048 tokens'], cycleAttention: 'QSA', isMoe: true, mtp: '1 MTP layer; public materials separately describe speculative-decoding support', supportsSpeculativeDecoding: true,
  },
};

type NavSection = { title: string; items: Array<{ id: Tab; label: string }> };

const navSections: NavSection[] = [
  { title: 'Chapter 1: 系统概览', items: [{ id: 'overview', label: '1.0 全局架构总览' }] },
  { title: 'Chapter 2: 架构拓扑', items: [{ id: 'architecture', label: '2.0 层级全景拓扑' }] },
  {
    title: 'Chapter 3: 算子微观深潜',
    items: [
      { id: 'op_gdn', label: '§3.1 ⭐ Gated DeltaNet' },
      { id: 'op_attention', label: '§3.2 ⭐ 门控注意力 / QSA' },
      { id: 'op_moe', label: '§3.3 SwiGLU / MoE 路由' },
      { id: 'op_gated_res', label: '§3.4 ⭐ 4-Way 门控残差' },
      { id: 'op_ngram', label: '§3.5 ⭐ N-gram 嵌入表' },
      { id: 'op_rope', label: '§3.6 RoPE 与 YaRN 扩展' },
      { id: 'op_unembed', label: '§3.7 LM Head 与 MTP' },
    ]
  },
  { title: 'Chapter 4: 算子实验室', items: [{ id: 'operators', label: '4.0 交互式算子验证' }] },
  { title: 'Chapter 5: 训练与推理', items: [{ id: 'training', label: '5.0 训练机制与推理控制' }] },
  { title: 'Chapter 6: 源码与边界', items: [{ id: 'sources', label: '6.0 官方来源与事实边界' }] },
];

function LazyWrap({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#67e8f9', fontSize: '1.1rem' }}>正在加载算子微观深度解析模块...</div>}>
      {children}
    </Suspense>
  );
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'cyan' | 'purple' | 'amber' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="section-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h1 id="page-heading" tabIndex={-1}>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

function EvidenceLink({ source, children = 'evidence' }: { source: EvidenceRef; children?: ReactNode }) {
  return (
    <a className="evidence-link" href={source.url} target="_blank" rel="noreferrer" title={`${source.label} · ${source.locator} · pinned revision ${source.revision}`}>
      {children} ↗
    </a>
  );
}

function ModelSelector({ selected, onChange }: { selected: ModelId; onChange: (id: ModelId) => void }) {
  return (
    <div className="model-selector" role="radiogroup" aria-label="Choose a Qwen3.8 model">
      {(Object.keys(models) as ModelId[]).map((id) => {
        const m = models[id];
        return (
          <button
            type="button"
            key={id}
            className={`model-option ${selected === id ? 'selected' : ''}`}
            style={{ '--model-accent': m.accent } as CSSProperties}
            onClick={() => onChange(id)}
            role="radio"
            aria-checked={selected === id}
          >
            <span className="model-dot" aria-hidden="true" />
            <span>
              <strong>{m.name}</strong>
              <small>{m.kind}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* Operator Lab Page */
function OperatorsPage({ model }: { model: ModelProfile }) {
  const [operator, setOperator] = useState<'gdn' | 'attention' | 'moe'>('gdn');
  const activeOperator = model.isMoe ? operator : operator === 'moe' ? 'gdn' : operator;
  const options = model.isMoe ? ['gdn', 'attention', 'moe'] : ['gdn', 'attention'];

  return (
    <div className="page-stack">
      <SectionIntro eyebrow="CHAPTER 04 / OPERATOR LAB" title="交互式算子控制台与动态仿真">
        选择算子进行实时参数交互。27B 为纯 Dense 架构；2.4T-A95B 配备 512 专家 MoE；Flash-Next 采用 QSA 块稀疏注意力与四路门控残差。
      </SectionIntro>
      <div className="operator-tabs" role="tablist" aria-label="Operator choices">
        {options.map((item) => (
          <button
            type="button"
            key={item}
            className={activeOperator === item ? 'active' : ''}
            onClick={() => setOperator(item as 'gdn' | 'attention' | 'moe')}
          >
            {item === 'gdn' ? 'Gated DeltaNet' : item === 'attention' ? model.cycleAttention : 'MoE Router'}
          </button>
        ))}
      </div>
      <div className="operator-layout">
        <div className="card operator-main">
          {activeOperator === 'gdn' && <GdnDemo />}
          {activeOperator === 'attention' && <AttentionDemo model={model} />}
          {activeOperator === 'moe' && <MoeDemo model={model} />}
        </div>
      </div>
    </div>
  );
}

function GdnDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const labels = ['读取当前 Token', '计算 Delta 增量更新', '传递递归状态 S_t'];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setStep((current) => current === labels.length - 1 ? 0 : current + 1), 1200);
    return () => window.clearInterval(timer);
  }, [playing, labels.length]);

  return (
    <div className="operator-demo">
      <div className="demo-header"><span>Gated DeltaNet</span><Badge tone="cyan">RECURRENT PATH</Badge></div>
      <GdnFlowVisual step={step} />
      <div className="token-row">
        {['t−2', 't−1', 't'].map((token, index) => (
          <div className={`token-pill ${index === step ? 'active' : ''}`} key={token}>
            <span>{token}</span><i style={{ opacity: index <= step ? 1 : 0.25 }} />
          </div>
        ))}
      </div>
      <div className="state-track">
        <div className="state-box">S<span>t−1</span></div>
        <div className="state-arrow">δ + gate</div>
        <div className="state-box current glow">S<span>t</span></div>
      </div>
      <p className="demo-caption"><b>步骤 {step + 1} · {labels[step]}</b> GDN 使用门控增量更新递归状态，以压缩形式向前传递历史。</p>
      <div className="demo-controls">
        <button type="button" className={playing ? 'active' : ''} onClick={() => setPlaying(!playing)}>{playing ? '暂停' : '自动播放'}</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === 0 ? labels.length - 1 : s - 1)); }}>上一步</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === labels.length - 1 ? 0 : s + 1)); }}>下一步</button>
      </div>
    </div>
  );
}

function AttentionDemo({ model }: { model: ModelProfile }) {
  const [focus, setFocus] = useState(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const isQsa = model.cycleAttention === 'QSA';
  const steps = isQsa ? ['读取查询 Q', 'Indexer 微块打分', '筛选重要上下文块', '稀疏注意力聚合'] : ['读取查询 Q', '全域内容比对', 'Softmax 加权', '门控输出投影'];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setStep((current) => current === steps.length - 1 ? 0 : current + 1), 1200);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  return (
    <div className="operator-demo">
      <div className="demo-header"><span>{isQsa ? 'QSA 稀疏注意力' : '门控多头注意力'}</span><Badge tone="purple">{isQsa ? 'SPARSE PATH' : 'CONTENT PATH'}</Badge></div>
      <AttentionFlowVisual model={model} step={step} focus={focus} />
      {isQsa && <div className="qsa-budget"><b>Indexer</b><span>微块选择预算</span><strong>512 块 / 2,048 Tokens</strong></div>}
      <div className="demo-progress">步骤 {step + 1} / {steps.length} · {steps[step]}</div>
      <div className="attention-grid">
        {['微块 A', '微块 B', '微块 C', '当前块'].map((item, index) => (
          <button type="button" className={focus === index && step >= 2 ? 'attention-cell focused' : 'attention-cell'} key={item} onClick={() => { setFocus(index); setStep(2); setPlaying(false); }}>
            <span className="attention-dot" />{item}<small>{step < 2 ? '待选候选' : focus === index ? '命中选中' : '待选候选'}</small>
          </button>
        ))}
      </div>
      <div className="demo-controls">
        <button type="button" className={playing ? 'active' : ''} onClick={() => setPlaying(!playing)}>{playing ? '暂停' : '自动播放'}</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === 0 ? steps.length - 1 : s - 1)); }}>上一步</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === steps.length - 1 ? 0 : s + 1)); }}>下一步</button>
      </div>
    </div>
  );
}

function MoeDemo({ model }: { model: ModelProfile }) {
  const [selected, setSelected] = useState(3);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = ['接收输入 Token', 'Router 专家打分', 'Top-10 路由分发', '加权聚合输出'];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setStep((current) => current === steps.length - 1 ? 0 : current + 1), 1200);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  return (
    <div className="operator-demo">
      <div className="demo-header"><span>MoE 稀疏路由</span><Badge tone="amber">SPARSE CAPACITY</Badge></div>
      <MoeFlowVisual model={model} step={step} selected={selected} />
      <div className="demo-progress">步骤 {step + 1} / {steps.length} · {steps[step]}</div>
      <div className="router-flow">
        <div className="route-token">Token<br /><b>hₜ</b></div>
        <div className="route-arrow">router<br />scores →</div>
        <div className="expert-grid">
          {Array.from({ length: 20 }, (_, index) => (
            <button
              type="button"
              key={index}
              className={'expert-dot ' + (step >= 2 && index < 10 ? 'routed ' : '') + (step >= 2 && index === selected ? 'selected' : '')}
              onClick={() => { setSelected(index); setStep(2); setPlaying(false); }}
            >
              {'E' + (index + 1)}
            </button>
          ))}
          <span className={step >= 2 ? 'expert-dot shared active' : 'expert-dot shared'}>S</span>
        </div>
      </div>
      <div className="route-summary">
        <strong>10 路由 + 1 共享专家</strong>
        <span>共 512 专家池 (当前聚焦: E{selected + 1})</span>
      </div>
      <div className="demo-controls">
        <button type="button" className={playing ? 'active' : ''} onClick={() => setPlaying(!playing)}>{playing ? '暂停' : '自动播放'}</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === 0 ? steps.length - 1 : s - 1)); }}>上一步</button>
        <button type="button" onClick={() => { setPlaying(false); setStep(s => (s === steps.length - 1 ? 0 : s + 1)); }}>下一步</button>
      </div>
    </div>
  );
}

/* Training & Inference Page */
function TrainingPage({ model }: { model: ModelProfile }) {
  const [effort, setEffort] = useState<'low' | 'medium' | 'xhigh'>('xhigh');
  const [thinkingMode, setThinkingMode] = useState<'thinking' | 'non-thinking'>('thinking');
  const [preserveThinking, setPreserveThinking] = useState(true);

  return (
    <div className="page-stack">
      <SectionIntro eyebrow="CHAPTER 05 / TRAINING & INFERENCE" title="训练流水线与推理运行时行为控制">
        解析 Qwen 3.8 的多阶段预训练、后训练对齐 (GSPO / RLVR) 以及运行时的混合思考模式 (Hybrid Thinking)。
      </SectionIntro>
      <TrainingCausalityVisual model={model} effort={effort} thinkingMode={thinkingMode} preserveThinking={preserveThinking} />
      <div className="training-timeline">
        <div className="timeline-line" />
        {[
          ['01', '大规模预训练 (36T Tokens)', '119 种多语言语料，重点强化数学、STEM 与代码数据配比'],
          ['02', '3:1 混合骨干学习', 'GDN 线性注意力与全局注意力周期性联合优化'],
          ['03', '后训练对齐 (GSPO + RLVR)', '群体序列策略优化与可验证奖励增强推理规划链'],
          ['04', '运行时思考控制', '通过 reasoning_effort 与 thinking 模式动态调节思考深度']
        ].map(([number, title, text], index) => (
          <div className={'timeline-item ' + (index === 1 ? 'active' : '')} key={title}>
            <span>{number}</span>
            <div><b>{title}</b><p>{text}</p></div>
          </div>
        ))}
      </div>
      <div className="two-column">
        <article className="card control-card">
          <div className="card-heading"><div><Badge tone="amber">推理行为控制</Badge><h3>思考模式与预算调节</h3></div></div>
          <div className="effort-switch" role="radiogroup" aria-label="Reasoning effort">
            {(['low', 'medium', 'xhigh'] as const).map((value) => (
              <button type="button" key={value} className={effort === value ? 'active' : ''} onClick={() => setEffort(value)}>
                {value.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="thinking-controls" style={{ marginTop: '16px' }}>
            <div className="effort-switch" role="radiogroup" aria-label="Thinking mode">
              {(['thinking', 'non-thinking'] as const).map((val) => (
                <button type="button" key={val} className={thinkingMode === val ? 'active' : ''} onClick={() => setThinkingMode(val)}>
                  {val === 'thinking' ? '开启深度思考 (<think>)' : '直接生成模式'}
                </button>
              ))}
            </div>
            <label style={{ display: 'block', marginTop: '10px', fontSize: '0.88rem', color: '#94A3B8' }}>
              <input type="checkbox" checked={preserveThinking} onChange={(e) => setPreserveThinking(e.target.checked)} /> 保留前一轮推理上下文 (preserve_thinking)
            </label>
          </div>
        </article>
        <article className="card mtp-card">
          <div className="card-heading"><div><Badge tone="purple">前瞻规划</Badge><h3>MTP 多 Token 辅助监督</h3></div></div>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6' }}>
            MTP 在训练期同时预测后几个位置的 Token，增强全局规划能力。在推理期支持无缝投机解码加速。
          </p>
        </article>
      </div>
    </div>
  );
}

/* Sources & Boundaries Page */
function SourcesPage() {
  const sources = [
    [evidence.repo.label, '官方开源仓库：模型列表、架构规范与发布日志', evidence.repo.url, evidence.repo.revision],
    [evidence.qwen27b.label, '27B Dense 模型卡：64 层、4 层周期、GQA 头数与上下文参数', evidence.qwen27b.url, evidence.qwen27b.revision],
    [evidence.a95b.label, '2.4T-A95B 模型卡：92 层、512 专家 MoE (10 路由+1 共享)', evidence.a95b.url, evidence.a95b.revision],
    [evidence.flashCard.label, 'Flash-Next 模型卡：QSA 稀疏注意力、四路门控残差与 N-gram 嵌入表', evidence.flashCard.url, evidence.flashCard.revision],
  ];

  return (
    <div className="page-stack">
      <SectionIntro eyebrow="SOURCES / EVIDENCE" title="官方事实来源与技术边界声明">
        本页面所有层数、头数、专家数与公式均严格锚定官方公布的模型卡与技术文档。
      </SectionIntro>
      <div className="source-grid">
        {sources.map(([title, desc, url, meta]) => (
          <a className="source-card" href={url} target="_blank" rel="noreferrer" key={title}>
            <div className="source-card-top"><Badge tone="cyan">OFFICIAL SOURCE</Badge><span>↗</span></div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <code>{url.replace('https://', '')}</code>
            <small className="source-meta">{meta}</small>
          </a>
        ))}
      </div>
    </div>
  );
}

/* Main Application Shell */
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [modelId, setModelId] = useState<ModelId>('27b');
  const model = models[modelId];
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, modelId]);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  const changeModel = (id: ModelId) => {
    setModelId(id);
  };

  const handleNavigateTab = (tab: string) => {
    changeTab(tab as Tab);
  };

  const content = (() => {
    switch (activeTab) {
      case 'overview':
        return <LazyWrap><QwenDashboard model={model} onNavigateTab={handleNavigateTab} /></LazyWrap>;
      case 'architecture':
        return <LazyWrap><QwenTopology model={model} onNavigateTab={handleNavigateTab} /></LazyWrap>;
      case 'op_gdn':
        return <LazyWrap><GDNDeepDive /></LazyWrap>;
      case 'op_attention':
        return <LazyWrap><AttentionDeepDive /></LazyWrap>;
      case 'op_moe':
        return <LazyWrap><MoEDeepDive /></LazyWrap>;
      case 'op_gated_res':
        return <LazyWrap><GatedResidualDeepDive /></LazyWrap>;
      case 'op_ngram':
        return <LazyWrap><NgramDeepDive /></LazyWrap>;
      case 'op_rope':
        return <LazyWrap><RoPEDeepDive /></LazyWrap>;
      case 'op_unembed':
        return <LazyWrap><UnembedDeepDive /></LazyWrap>;
      case 'operators':
        return <OperatorsPage model={model} />;
      case 'training':
        return <TrainingPage model={model} />;
      case 'sources':
        return <SourcesPage />;
      default:
        return <LazyWrap><QwenDashboard model={model} onNavigateTab={handleNavigateTab} /></LazyWrap>;
    }
  })();

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <strong>Qwen 3.8</strong>
            <span>Architecture Explorer</span>
          </div>
        </div>

        <div className="sidebar-label" style={{ padding: '0 16px 6px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b' }}>
          ARCHITECTURAL BLUEPRINT
        </div>
        <nav aria-label="Main navigation">
          {navSections.map((section) => (
            <div key={section.title} className="nav-group">
              <div className="nav-section-title" style={{ padding: '10px 16px 4px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
                {section.title}
              </div>
              {section.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={activeTab === item.id ? 'active' : ''}
                  onClick={() => changeTab(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <span className="nav-number" style={{ minWidth: '20px' }}>
                    <svg viewBox="0 0 24 24" width="7" height="7" aria-hidden="true">
                      <circle cx="12" cy="12" r="7" fill="currentColor" />
                    </svg>
                  </span>
                  <span><b>{item.label}</b></span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Official Qwen 3.8 Architecture</span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">QWEN 3.8 TECHNICAL BLUEPRINT</span>
            <strong>From Macro Topology to Micro-Operator Dynamics</strong>
          </div>

          {/* Compact Topbar Model Switcher */}
          <div className="topbar-model-switcher" role="radiogroup" aria-label="Select Architecture">
            {(Object.keys(models) as ModelId[]).map((id) => (
              <button
                type="button"
                key={id}
                className={`topbar-model-pill ${modelId === id ? 'active' : ''}`}
                style={{ '--pill-accent': models[id].accent } as CSSProperties}
                onClick={() => changeModel(id)}
                role="radio"
                aria-checked={modelId === id}
              >
                <span className="pill-dot" />
                <span>{models[id].shortName}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="mobile-nav" aria-label="Mobile navigation">
          {navSections.map((section) => {
            const isActive = section.items.some((item) => item.id === activeTab);
            return (
              <button
                type="button"
                key={section.title}
                className={isActive ? 'active' : ''}
                onClick={() => changeTab(section.items[0].id)}
              >
                {section.title.split(': ')[1] || section.title}
              </button>
            );
          })}
        </div>

        {/* Content Wrap */}
        <div className="content-wrap">
          <div className="route-model-selector">
            <span>CHOOSE ARCHITECTURE:</span>
            <ModelSelector selected={model.id} onChange={changeModel} />
            <ModelSignatureVisual model={model} parameterLine={`${model.parameters.backbone} backbone`} activeLine={model.parameters.active} />
          </div>
          {content}
        </div>
      </main>
    </div>
  );
}

export default App;
