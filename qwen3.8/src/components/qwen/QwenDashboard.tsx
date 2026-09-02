import React, { useState } from 'react';
import { type ModelProfile } from './QwenTopology';
import { QwenMacroFlow } from './QwenMacroFlow';

interface QwenDashboardProps {
  model: ModelProfile;
  onNavigateTab?: (tab: string) => void;
}

export const QwenDashboard: React.FC<QwenDashboardProps> = ({ model, onNavigateTab }) => {
  const [contextStage, setContextStage] = useState<number>(3); // Default to 262K / 1M

  const contextStages = [
    {
      length: '32K',
      tokens: 32768,
      phase: '阶段 1: 原生预训练',
      desc: '基础预训练标准长度，学习语法、通用世界知识和局部代码/逻辑推理。',
      scaling: '基准显存 1×。GDN 递归状态 S_t 恒定占用固定内存，标准注意力 KV Cache 处于低开销区间。'
    },
    {
      length: '64K',
      tokens: 65536,
      phase: '阶段 2: 预训练长序列扩展',
      desc: 'Base Theta 调整为 1,000,000，训练数据混合长篇技术文档与跨文件代码库。',
      scaling: '标准注意力 KV 缓存增至 2×；GDN 显存依旧恒定为 O(1)。'
    },
    {
      length: '128K',
      tokens: 131072,
      phase: '阶段 3: YaRN 插值扩展',
      desc: '应用 YaRN (Yet another RoPE) 频域混合插值，大幅降低极端长序列下的位置感知退化。',
      scaling: '标准注意力 KV 缓存增至 4×；在 3:1 混合架构下，75% 的层无需 KV Cache 存储。'
    },
    {
      length: '262K',
      tokens: 262144,
      phase: '阶段 4: 原生公布上下文窗口',
      desc: '官方模型卡声明的开箱即用原生上下文长度，支持完整书籍与大型项目级代码库一次性摄入。',
      scaling: '3:1 混合节省高达 70%+ 的端到端推理显存，使得 262K 能够在单机多卡上高吞吐部署。'
    },
    {
      length: '1.01M',
      tokens: 1048576,
      phase: '阶段 5: 百万 Extensible 极限扩展',
      desc: '针对超长 Agent 交互与海量日志排查。QSA 稀疏注意力 (Flash) 或动态分块推理实现超长无损检索。',
      scaling: 'Full Attention 会产生爆炸级显存 (TB 级)，而 Qwen 3.8 凭借 GDN O(1) 状态与 QSA 块稀疏将显存压缩至可行范围。'
    }
  ];

  const currentStage = contextStages[contextStage];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#E2E8F0' }}>
      
      {/* 1. Header & Summary Banner */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: `${model.accent}20`, color: model.accent, border: `1px solid ${model.accent}`, padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Chapter 1 — 系统架构全景
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Official Technical Architecture</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFF', margin: '8px 0 6px 0' }}>
              {model.name} 架构原理全景解析
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0, maxWidth: '900px', lineHeight: '1.5' }}>
              {model.description} 采用革命性的 <b>3:1 混合注意力骨干（3 GDN + 1 {model.cycleAttention}）</b>，在保持极低长序列计算与显存开销的同时，实现顶尖的推理规划与全域检索能力。
            </p>
          </div>
        </div>

        {/* 4-Stat Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>总参数规模 (Total Params)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: model.accent, margin: '4px 0 2px 0' }}>
              {model.parameters.backbone}
            </div>
            <small style={{ color: '#64748B' }}>{model.parameters.note}</small>
          </div>
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>单 Token 激活参数</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981', margin: '4px 0 2px 0' }}>
              {model.parameters.active}
            </div>
            <small style={{ color: '#64748B' }}>{model.isMoe ? '10 路由 + 1 共享专家' : '全量 Dense 前向计算'}</small>
          </div>
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>原生/扩展上下文</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fbbf24', margin: '4px 0 2px 0' }}>
              {model.context}
            </div>
            <small style={{ color: '#64748B' }}>Base θ = 1,000,000 + YaRN</small>
          </div>
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>骨干层级与循环</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#c4b5fd', margin: '4px 0 2px 0' }}>
              {model.layers}L / {model.cycleCount}C
            </div>
            <small style={{ color: '#64748B' }}>{model.cycleCount} × (3 GDN + 1 {model.cycleAttention})</small>
          </div>
        </div>
      </div>

      {/* 2. 5-Step Token Lifecycle Macro Flow */}
      <QwenMacroFlow model={model} onNavigateTab={onNavigateTab} />

      {/* Navigation Guide - directs users to the full topology in Chapter 2 */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(196, 181, 253, 0.22)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              深度探索 · DRILL DOWN
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFF', margin: '4px 0 6px 0' }}>
              想要深入了解每一层的内部结构？
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: 0, lineHeight: '1.5' }}>
              进入 <b>Chapter 2 · 层级全景拓扑</b> 查看完整的 {model.layers} 层架构可视化，点击任意层级展开其微观电路与实时交互仿真。
              或直接跳转至 <b>Chapter 3 · 算子深潜</b> 查看每个核心算子的数学推导与硬件级实现细节。
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigateTab?.('architecture')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(196, 181, 253, 0.4)',
                background: 'rgba(196, 181, 253, 0.1)',
                color: '#c4b5fd',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              🏛️ 打开层级拓扑 →
            </button>
            <button
              onClick={() => onNavigateTab?.('op_gdn')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(103, 232, 249, 0.4)',
                background: 'rgba(103, 232, 249, 0.1)',
                color: '#67e8f9',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              ⚡ GDN 算子深潜 →
            </button>
            <button
              onClick={() => onNavigateTab?.('op_attention')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(196, 181, 253, 0.4)',
                background: 'rgba(196, 181, 253, 0.1)',
                color: '#c4b5fd',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              🔍 注意力深潜 →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Context Length Curriculum & Memory Scaling Sandbox */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div>
            <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              长序列扩展体系 · CONTEXT SCALING & MEMORY
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#FFF', margin: '4px 0 0 0' }}>
              从 32K 到 1M：长上下文训练进程与显存开销对比
            </h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            选择不同阶段观察 3:1 混合架构带来的显存节约
          </span>
        </div>

        {/* Stage Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {contextStages.map((stage, idx) => (
            <button
              key={stage.length}
              onClick={() => setContextStage(idx)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: contextStage === idx ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                background: contextStage === idx ? 'rgba(251, 191, 36, 0.2)' : '#070a12',
                color: contextStage === idx ? '#fbbf24' : '#94A3B8',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {stage.length} 阶段
            </button>
          ))}
        </div>

        {/* Selected Stage Detail */}
        <div style={{ marginTop: '16px', background: '#070a12', borderRadius: '10px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '1.1rem', color: '#FFF' }}>{currentStage.phase} ({currentStage.length} Tokens)</strong>
            <span style={{ fontFamily: 'monospace', color: '#67e8f9', fontSize: '0.9rem' }}>{currentStage.tokens.toLocaleString()} Tokens</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', margin: '0 0 14px 0' }}>
            {currentStage.desc}
          </p>

          {/* Memory Bar Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Standard Transformer (Linear KV Growth in sequence) */}
            <div style={{ background: '#0e1421', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>纯 Softmax 注意力模型 (如全量 GQA)</span>
                <span>O(N) 线性膨胀</span>
              </div>
              <div style={{ height: '20px', background: '#070a12', borderRadius: '4px', marginTop: '10px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${Math.min(100, ((contextStage + 1) / 5) * 100)}%`, background: '#EF4444', transition: 'width 0.3s' }} />
                <span style={{ position: 'absolute', right: '8px', top: '2px', fontSize: '0.75rem', color: '#FFF', fontFamily: 'monospace' }}>
                  KV Cache: ~{((currentStage.tokens / 32768) * 12).toFixed(1)} GB / 请求
                </span>
              </div>
              <small style={{ color: '#94A3B8', marginTop: '8px', display: 'block', fontSize: '0.8rem' }}>
                全量 64/92 层均需维护完整 KV Cache，长文本部署成本高昂。
              </small>
            </div>

            {/* Qwen 3.8 3:1 Hybrid (O(1) GDN + 1/4 KV Cache) */}
            <div style={{ background: '#0e1421', padding: '14px', borderRadius: '8px', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>Qwen 3.8 3:1 混合架构 (GDN + {model.cycleAttention})</span>
                <span>显存节约 ~75%</span>
              </div>
              <div style={{ height: '20px', background: '#070a12', borderRadius: '4px', marginTop: '10px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.max(12, ((contextStage + 1) / 5) * 25))}%`, background: '#10b981', transition: 'width 0.3s' }} />
                <span style={{ position: 'absolute', right: '8px', top: '2px', fontSize: '0.75rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  KV Cache: ~{((currentStage.tokens / 32768) * 3).toFixed(1)} GB (仅 25% 层需要)
                </span>
              </div>
              <small style={{ color: '#94A3B8', marginTop: '8px', display: 'block', fontSize: '0.8rem' }}>
                75% 的 GDN 层状态恒定为 O(1)，仅每 4 层的锚点层保留轻量 KV Cache。
              </small>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
