import React, { useState } from 'react';

export const MoEOperatorDeepDive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routing' | 'loadBalance' | 'activatedParams'>('routing');
  const activatedParamsPerToken = "104.2B";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎰</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Stable LatentMoE 混合专家路由子模块原理与推导
            </h2>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Top-16 / 896 Routed + 2 Shared Experts
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密 Kimi K3 2.78 万亿总参数的 Sparse MoE 稀疏激活子模块：单 Token 从 896 个路由专家中激活 Top-16，结合 2 个常驻共享专家
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('routing')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'routing' ? '#10B981' : 'transparent',
              color: activeTab === 'routing' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 路由门控公式与计算流
          </button>
          <button
            onClick={() => setActiveTab('loadBalance')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'loadBalance' ? '#38BDF8' : 'transparent',
              color: activeTab === 'loadBalance' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 无 Auxiliary Loss 负载压强平衡
          </button>
          <button
            onClick={() => setActiveTab('activatedParams')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'activatedParams' ? '#F59E0B' : 'transparent',
              color: activeTab === 'activatedParams' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 激活参数 104.2B 算力核算
          </button>
        </div>
      </div>

      {/* TAB 1: ROUTING FORMULA & FLOW */}
      {activeTab === 'routing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: 0, fontWeight: 'bold' }}>
              📐 Stable LatentMoE 路由门控权重计算公式
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. Gating Logits 得分计算与 Top-K 过滤</div>
              <div style={{ color: '#38BDF8' }}>s_(i,t) = Softmax( TopK( W_g · x_t, K=16 ) )_i</div>
              <div>// 2. 共享专家与 Top-16 路由专家加权输出组合</div>
              <div style={{ color: '#10B981' }}>y_t = Σ ( s_(i,t) · E_i(x_t) ) + E_shared(x_t)</div>
            </div>
          </div>

          {/* SVG Routing Flow Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 840 280" width="100%" height="280" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-moe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
              </defs>

              {/* Input Token x_t */}
              <rect x="20" y="100" width="140" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="90" y="135" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Input Token x_t</text>
              <text x="90" y="158" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="160" y1="140" x2="230" y2="140" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe)" />

              {/* Gating Router Matrix W_g */}
              <rect x="230" y="100" width="180" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="320" y="130" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">Gating Router</text>
              <text x="320" y="152" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">Top-16 / 896 专家</text>

              {/* Split to Shared and Routed Experts */}
              <line x1="410" y1="120" x2="480" y2="60" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="410" y1="160" x2="480" y2="220" stroke="#10B981" strokeWidth="1.5" />

              {/* Shared Experts Box */}
              <rect x="480" y="30" width="180" height="60" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="570" y="58" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">2 共享专家 (Shared)</text>
              <text x="570" y="76" fill="#94A3B8" fontSize="12" textAnchor="middle">无条件全量激活</text>

              {/* Routed Experts Grid */}
              <rect x="480" y="190" width="180" height="60" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="570" y="218" fill="#10B981" fontSize="14" fontWeight="bold" textAnchor="middle">Top-16 路由专家</text>
              <text x="570" y="236" fill="#94A3B8" fontSize="12" textAnchor="middle">896 个候选大池</text>

              {/* Weighted Sum */}
              <line x1="660" y1="60" x2="710" y2="120" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="660" y1="220" x2="710" y2="160" stroke="#10B981" strokeWidth="1.5" />

              <rect x="710" y="100" width="110" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="765" y="135" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">输出 y_t</text>
              <text x="765" y="156" fill="#38BDF8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">加权求和</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVATED PARAMETER BREAKDOWN */}
      {activeTab === 'activatedParams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧮 2.78T 总参数 vs 104.2B 激活参数的精确核算
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              虽然整体模型拥有 2.78 万亿参数，但在处理每个 Token 时，Sparse MoE 稀疏激活使真正的计算开销仅为 104.2B，极大提升吞吐！
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem' }}>📦 包含的核心组件占比</span>
              <ul style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                <li><b>MoonViT-V2 视觉编码器</b>：401M 参数（单图运行一次）；</li>
                <li><b>93 层 Hybrid Backbone</b>：69 KDA + 24 MLA 注意力共享骨干；</li>
                <li><b>2 共享专家 (Shared Experts)</b>：每层 100% 参与运算；</li>
                <li><b>Top-16 动态路由专家</b>：896 个候选专家中仅激活 1.78%。</li>
              </ul>
            </div>

            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '1.05rem' }}>单 Token 真实激活计算参数:</span>
              <span style={{ fontSize: '2.5rem', color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {activatedParamsPerToken}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>占总参数 2.78T 的 3.75% 比例！</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
