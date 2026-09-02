import React, { useState } from 'react';
import { type ModelProfile } from './QwenTopology';
import { MathRenderer } from '../MathRenderer';

interface QwenArchitectureDiagramProps {
  model: ModelProfile;
  onNavigateTab?: (tab: string) => void;
}

export const QwenArchitectureDiagram: React.FC<QwenArchitectureDiagramProps> = ({ model }) => {
  // Selected interactive block in the model architecture diagram
  const [selectedBlock, setSelectedBlock] = useState<'input' | 'gdn' | 'attention' | 'moe' | 'residual' | 'output'>('gdn');
  const [activeCycle, setActiveCycle] = useState<number>(1);
  const [activeLayerSlot, setActiveLayerSlot] = useState<number>(1); // 1..4

  // Simulation controls inside the architecture diagram
  const [gdnStep, setGdnStep] = useState<number>(0);
  const [gdnAlpha, setGdnAlpha] = useState<number>(0.85);
  const [moeSelectedExpert, setMoeSelectedExpert] = useState<number>(3);
  const [moeStep, setMoeStep] = useState<number>(0);
  const [qsaBlock, setQsaBlock] = useState<number>(1);
  const [residualSliders, setResidualSliders] = useState<number[]>([0.85, 0.65, 0.90, 0.40]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#E2E8F0', width: '100%' }}>
      
      {/* 1. Header Banner */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>🏛️</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                {model.name} 神经网络模型架构图 (Neural Model Architecture Diagram)
              </h2>
              <span style={{ background: `${model.accent}20`, color: model.accent, border: `1px solid ${model.accent}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {model.kind}
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '6px 0 0 0' }}>
              标准的深度学习模型结构框图（从底层多模态输入 $\rightarrow$ 3:1 混合骨干网重复堆叠大模块 $\rightarrow$ 顶层 LM Head 输出）。<b>100% 完整平铺展示（无滚动条）</b>。<b>点击架构图中的任意算子或大模块方框</b>，在当前页面<b>就地动态展开</b>其内部电路、张量计算流与交互仿真。
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE NEURAL MODEL ARCHITECTURE DIAGRAM (100% Responsive SVG, Zero Scrollbar) */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: model.accent, fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              模型拓扑结构流 (MODEL ARCHITECTURE FLOW)
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              [ 当前聚焦节点: <b>{selectedBlock.toUpperCase()}</b> ]
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            💡 提示：点击架构图中的任意方块即可切换下方展开细节
          </span>
        </div>

        {/* Scalable Model Architecture SVG Diagram */}
        <div style={{ width: '100%', background: '#070a12', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <svg
            width="100%"
            height="auto"
            viewBox="0 0 880 720"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', maxWidth: '880px', margin: '0 auto' }}
          >
            <defs>
              <marker id="arch-arrow" viewBox="0 0 10 10" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 6 L 5 0 L 10 6 z" fill="#67e8f9" />
              </marker>
              <marker id="gold-arrow" viewBox="0 0 10 10" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 6 L 5 0 L 10 6 z" fill="#fbbf24" />
              </marker>
              <marker id="purple-arrow" viewBox="0 0 10 10" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 6 L 5 0 L 10 6 z" fill="#c4b5fd" />
              </marker>
            </defs>

            {/* ========================================================================= */}
            {/* 1. TOP: OUTPUT HEAD & MTP (Layer N) */}
            {/* ========================================================================= */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedBlock('output')}>
              <rect
                x="200"
                y="15"
                width="480"
                height="56"
                rx="8"
                fill={selectedBlock === 'output' ? 'rgba(244,114,182,0.25)' : '#0e1421'}
                stroke={selectedBlock === 'output' ? '#f472b6' : 'rgba(244,114,182,0.45)'}
                strokeWidth={selectedBlock === 'output' ? '2' : '1.2'}
              />
              <text x="440" y="38" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                LM Head 词表反嵌入 & 多 Token 预测 (MTP)
              </text>
              <text x="440" y="56" fill="#f472b6" fontSize="10.5" fontFamily="monospace" textAnchor="middle">
                W_unembed (d = {model.hidden} → 151,936 Vocab) · Softmax → Next Token Logits
              </text>
            </g>

            {/* Connecting: Final RMSNorm -> LM Head */}
            <line x1="440" y1="100" x2="440" y2="76" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arch-arrow)" />

            {/* Final RMSNorm Block */}
            <rect x="330" y="100" width="220" height="30" rx="4" fill="#070a12" stroke="#67e8f9" strokeWidth="1.2" />
            <text x="440" y="120" fill="#67e8f9" fontSize="11" fontWeight="bold" textAnchor="middle">
              Final RMSNorm (ε = 1e-6)
            </text>

            {/* Connecting: Backbone -> Final RMSNorm */}
            <line x1="440" y1="155" x2="440" y2="135" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arch-arrow)" />

            {/* ========================================================================= */}
            {/* 2. MIDDLE: REPEATING 3:1 HYBRID BACKBONE CONTAINER (Nx CYCLES) */}
            {/* ========================================================================= */}
            
            {/* Large Repeating Outer Container */}
            <rect
              x="120"
              y="155"
              width="640"
              height="380"
              rx="14"
              fill="rgba(196,181,253,0.04)"
              stroke={model.accent}
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Multiplier Badge on Top-Right */}
            <rect x="655" y="168" width="95" height="38" rx="6" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="702" y="185" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">× {model.cycleCount} 周期</text>
            <text x="702" y="198" fill="#94A3B8" fontSize="9.5" textAnchor="middle">共 {model.layers} 物理层</text>

            {/* Container Title */}
            <text x="380" y="180" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">
              3:1 混合注意力骨干网络 (3:1 Hybrid Backbone Module)
            </text>
            <text x="380" y="196" fill={model.accent} fontSize="10.5" textAnchor="middle">
              每 4 层构成一个标准周期（3 层 GDN 线性注意力 + 1 层 {model.cycleAttention} 锚点）
            </text>

            {/* ---------------- 2A. LAYER 4: ATTENTION ANCHOR LAYER (Slot 4/4) ---------------- */}
            <g style={{ cursor: 'pointer' }} onClick={() => { setSelectedBlock('attention'); setActiveLayerSlot(4); }}>
              <rect
                x="150"
                y="210"
                width="580"
                height="135"
                rx="10"
                fill={selectedBlock === 'attention' ? 'rgba(196,181,253,0.18)' : 'rgba(196,181,253,0.08)'}
                stroke={selectedBlock === 'attention' ? '#c4b5fd' : 'rgba(196,181,253,0.35)'}
                strokeWidth={selectedBlock === 'attention' ? '2' : '1.2'}
              />

              <text x="170" y="230" fill="#c4b5fd" fontSize="11" fontWeight="bold">
                Layer 4k (Slot 4/4 · 全局锚点层) — {model.cycleAttention} + {model.isMoe ? 'Sparse MoE' : 'Dense SwiGLU'}
              </text>

              {/* Sub-node: Pre-RMSNorm 1 */}
              <rect x="170" y="242" width="95" height="24" rx="4" fill="#070a12" stroke="#67e8f9" strokeWidth="1" />
              <text x="217" y="258" fill="#67e8f9" fontSize="9.5" textAnchor="middle">RMSNorm</text>
              <line x1="265" y1="254" x2="285" y2="254" stroke="#67e8f9" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              {/* Sub-node: Attention Sequence Mixer */}
              <rect x="285" y="240" width="280" height="28" rx="4" fill="rgba(196,181,253,0.2)" stroke="#c4b5fd" strokeWidth="1" />
              <text x="425" y="258" fill="#FFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                {model.cycleAttention === 'QSA' ? 'QSA (Indexer 512 块筛选 → 稀疏注意力)' : 'GQA 4:1 全局多头注意力 (RoPE θ=1M)'}
              </text>
              <line x1="565" y1="254" x2="585" y2="254" stroke="#67e8f9" strokeWidth="1.5" />

              {/* Sub-node: Add Node 1 */}
              <circle cx="595" cy="254" r="8" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="595" y="258" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">⊕</text>

              {/* Residual skip 1 for Attn */}
              <path d="M 160 275 L 160 295 L 595 295 L 595 264" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Sub-node: Pre-RMSNorm 2 */}
              <rect x="170" y="305" width="95" height="24" rx="4" fill="#070a12" stroke="#fbbf24" strokeWidth="1" />
              <text x="217" y="321" fill="#fbbf24" fontSize="9.5" textAnchor="middle">RMSNorm</text>
              <line x1="265" y1="317" x2="285" y2="317" stroke="#67e8f9" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              {/* Sub-node: Channel Mixer */}
              <rect
                x="285"
                y="303"
                width="280"
                height="28"
                rx="4"
                fill="rgba(251,191,36,0.15)"
                stroke="#fbbf24"
                strokeWidth="1"
                onClick={(e) => { e.stopPropagation(); setSelectedBlock('moe'); }}
              />
              <text x="425" y="321" fill="#FFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                {model.isMoe ? 'Sparse MoE (10 路由 + 1 共享专家 · 512E)' : 'Dense SwiGLU (d_ffn = 17,408)'}
              </text>
              <line x1="565" y1="317" x2="585" y2="317" stroke="#67e8f9" strokeWidth="1.5" />

              {/* Sub-node: Add Node 2 */}
              <circle cx="595" cy="317" r="8" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="595" y="321" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">⊕</text>
            </g>

            {/* Connecting: GDN block -> Attention block */}
            <line x1="440" y1="365" x2="440" y2="350" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arch-arrow)" />

            {/* ---------------- 2B. LAYER 1~3: GDN LINEAR ATTENTION LAYERS (Slot 1~3/4) ---------------- */}
            <g style={{ cursor: 'pointer' }} onClick={() => { setSelectedBlock('gdn'); setActiveLayerSlot(1); }}>
              <rect
                x="150"
                y="365"
                width="580"
                height="150"
                rx="10"
                fill={selectedBlock === 'gdn' ? 'rgba(103,232,249,0.18)' : 'rgba(103,232,249,0.08)'}
                stroke={selectedBlock === 'gdn' ? '#67e8f9' : 'rgba(103,232,249,0.35)'}
                strokeWidth={selectedBlock === 'gdn' ? '2' : '1.2'}
              />

              <rect x="640" y="375" width="80" height="20" rx="4" fill="#0e1421" stroke="#67e8f9" strokeWidth="1" />
              <text x="680" y="389" fill="#67e8f9" fontSize="10" fontWeight="bold" textAnchor="middle">重复 × 3 层</text>

              <text x="170" y="388" fill="#67e8f9" fontSize="11" fontWeight="bold">
                Layer 4k-3, 4k-2, 4k-1 (Slot 1~3/4) — Gated DeltaNet (GDN) 线性注意力层
              </text>

              {/* Sub-node: Pre-RMSNorm 1 */}
              <rect x="170" y="405" width="95" height="24" rx="4" fill="#070a12" stroke="#67e8f9" strokeWidth="1" />
              <text x="217" y="421" fill="#67e8f9" fontSize="9.5" textAnchor="middle">RMSNorm</text>
              <line x1="265" y1="417" x2="285" y2="417" stroke="#67e8f9" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              {/* Sub-node: GDN Sequence Mixer */}
              <rect x="285" y="403" width="280" height="28" rx="4" fill="rgba(103,232,249,0.2)" stroke="#67e8f9" strokeWidth="1" />
              <text x="425" y="421" fill="#FFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                GDN 算子 (Conv1D → Delta 增量更新 S_t → 门控 σ(W_g x))
              </text>
              <line x1="565" y1="417" x2="585" y2="417" stroke="#67e8f9" strokeWidth="1.5" />

              {/* Sub-node: Add Node 1 */}
              <circle cx="595" cy="417" r="8" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="595" y="421" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">⊕</text>

              {/* Sub-node: Pre-RMSNorm 2 */}
              <rect x="170" y="465" width="95" height="24" rx="4" fill="#070a12" stroke="#fbbf24" strokeWidth="1" />
              <text x="217" y="481" fill="#fbbf24" fontSize="9.5" textAnchor="middle">RMSNorm</text>
              <line x1="265" y1="477" x2="285" y2="477" stroke="#67e8f9" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

              {/* Sub-node: Channel Mixer */}
              <rect
                x="285"
                y="463"
                width="280"
                height="28"
                rx="4"
                fill="rgba(251,191,36,0.15)"
                stroke="#fbbf24"
                strokeWidth="1"
                onClick={(e) => { e.stopPropagation(); setSelectedBlock('moe'); }}
              />
              <text x="425" y="481" fill="#FFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                {model.isMoe ? 'Sparse MoE (10 路由 + 1 共享专家 · 512E)' : 'Dense SwiGLU (d_ffn = 17,408)'}
              </text>
              <line x1="565" y1="477" x2="585" y2="477" stroke="#67e8f9" strokeWidth="1.5" />

              {/* Sub-node: Add Node 2 */}
              <circle cx="595" cy="477" r="8" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="595" y="481" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">⊕</text>
            </g>

            {/* Connecting: Input -> Backbone */}
            <line x1="440" y1="575" x2="440" y2="540" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arch-arrow)" />

            {/* ========================================================================= */}
            {/* 3. BOTTOM: MULTIMODAL INPUT & EMBEDDING ALIGNMENT (Layer 0) */}
            {/* ========================================================================= */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedBlock('input')}>
              
              {/* Unified Splicing Vector */}
              <rect
                x="180"
                y="575"
                width="520"
                height="32"
                rx="6"
                fill={selectedBlock === 'input' ? 'rgba(16,185,129,0.25)' : '#070a12'}
                stroke={selectedBlock === 'input' ? '#10b981' : 'rgba(16,185,129,0.5)'}
                strokeWidth={selectedBlock === 'input' ? '2' : '1.2'}
              />
              <text x="440" y="596" fill="#10b981" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                统一序列输入张量 X ∈ ℝ^(T × d = {model.hidden}) [多模态对齐拼接]
              </text>

              {/* Modality Arrows */}
              <line x1="280" y1="645" x2="330" y2="612" stroke="#67e8f9" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
              <line x1="600" y1="645" x2="550" y2="612" stroke="#c4b5fd" strokeWidth="1.5" markerEnd="url(#purple-arrow)" />

              {/* Text Modality Box */}
              <rect x="180" y="645" width="200" height="54" rx="6" fill="#0e1421" stroke="#67e8f9" strokeWidth="1.2" />
              <text x="280" y="668" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">文本 Token 嵌入</text>
              <text x="280" y="686" fill="#67e8f9" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {model.id === 'flash' ? '20M N-gram + BPE' : 'BPE 词表 (151,936)'}
              </text>

              {/* Vision Modality Box */}
              <rect x="500" y="645" width="200" height="54" rx="6" fill="#0e1421" stroke="#c4b5fd" strokeWidth="1.2" />
              <text x="600" y="668" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">视觉图像/视频编码</text>
              <text x="600" y="686" fill="#c4b5fd" fontSize="10" fontFamily="monospace" textAnchor="middle">
                ViT (27L) + 2×2 PixelShuffle
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 3. DYNAMIC IN-PLACE OPERATOR INSPECTION & LIVE INTERACTIVE SIMULATOR */}
      <div className="card" style={{ background: '#0e1421', border: `1px solid ${model.accent}40`, borderRadius: '16px', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🔬</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                {selectedBlock === 'gdn' && '§3.1 Gated DeltaNet (GDN) 线性注意力电路解析'}
                {selectedBlock === 'attention' && `§3.2 ${model.cycleAttention} 全局注意力锚点电路解析`}
                {selectedBlock === 'moe' && `§3.3 ${model.isMoe ? 'Sparse MoE 512 专家稀疏路由' : 'Dense SwiGLU 前馈网络'}电路解析`}
                {selectedBlock === 'input' && '§3.0 多模态输入与词表嵌入对齐电路解析'}
                {selectedBlock === 'output' && '§3.7 LM Head 词表投影与多 Token 预测 (MTP)'}
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              在当前页面就地展开选定架构模块的<b>动态仿真控制台、核心数学公式与精确张量维度</b>。
            </p>
          </div>

          {/* Quick tab jumper */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['input', 'gdn', 'attention', 'moe', 'output'] as const).map((blockKey) => (
              <button
                key={blockKey}
                onClick={() => setSelectedBlock(blockKey)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: selectedBlock === blockKey ? `1px solid ${model.accent}` : '1px solid rgba(255,255,255,0.1)',
                  background: selectedBlock === blockKey ? `${model.accent}20` : '#070a12',
                  color: selectedBlock === blockKey ? '#FFF' : '#94A3B8',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {blockKey.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------- INLINE SIMULATOR CONTENT ----------------- */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SIMULATOR 1: GDN DELTA RULE */}
          {selectedBlock === 'gdn' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(103,232,249,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#67e8f9', fontSize: '0.95rem' }}>
                  🎮 GDN Delta 增量规则与状态矩阵演化模拟：
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>内存复杂度：O(1) 恒定显存</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    {['1. 衰减 Diag(α)S_(t-1)', '2. 写入 β·k·δᵀ', '3. 读取 S_tᵀq'].map((label, idx) => (
                      <button
                        key={label}
                        onClick={() => setGdnStep(idx)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: gdnStep === idx ? '1px solid #67e8f9' : '1px solid rgba(255,255,255,0.1)',
                          background: gdnStep === idx ? 'rgba(103,232,249,0.2)' : '#0e1421',
                          color: gdnStep === idx ? '#67e8f9' : '#94A3B8',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.78rem'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', maxWidth: '220px' }}>
                    {[0.42, 0.15, 0.78, 0.31, 0.64, 0.89, 0.22, 0.55, 0.11, 0.37, 0.93, 0.46, 0.82, 0.05, 0.61, 0.74].map((v, i) => (
                      <div key={i} style={{ padding: '6px 2px', textAlign: 'center', background: gdnStep === 1 ? 'rgba(196,181,253,0.25)' : 'rgba(103,232,249,0.15)', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#FFF' }}>
                        {(v * (gdnStep === 0 ? gdnAlpha : 1)).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>动态衰减门 α_t: {gdnAlpha.toFixed(2)}</span>
                  <input
                    type="range"
                    min="0.3"
                    max="0.99"
                    step="0.05"
                    value={gdnAlpha}
                    onChange={(e) => setGdnAlpha(Number(e.target.value))}
                    style={{ width: '100%', margin: '8px 0' }}
                  />
                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
                    <b>核心创新：</b>Delta Rule 计算当前预测残差 δ_t = v_t - S_(t-1)ᵀ k_t，只更新网络尚未记住的新增信息，配合 α_t 通道级衰减，彻底攻克传统线性注意力的记忆混淆难题。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR 2: ATTENTION / QSA */}
          {selectedBlock === 'attention' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(196,181,253,0.25)' }}>
              <strong style={{ color: '#c4b5fd', fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>
                🎮 {model.cycleAttention} 锚点检索模拟：
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                    {model.cycleAttention === 'QSA' ? 'QSA Indexer 扫描 512 微块 (点击切换关注块):' : '全域上下文注意力热力分布 (点击测试查询聚焦):'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['微块 A', '微块 B', '微块 C', '当前位置'].map((name, idx) => (
                      <button
                        key={name}
                        onClick={() => setQsaBlock(idx)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: qsaBlock === idx ? '1px solid #c4b5fd' : '1px solid rgba(255,255,255,0.06)',
                          background: qsaBlock === idx ? 'rgba(196,181,253,0.25)' : '#0e1421',
                          color: qsaBlock === idx ? '#FFF' : '#94A3B8',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
                    <b>为什么需要 3:1 锚点层？</b>纯线性注意力无法精确实现长距离“针在大海”的事实检索。每 4 层插入 1 层精确注意力充当全局锚点，既保持了 75% 的 O(1) 显存优势，又具备 100% 的精准长文本检索能力。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR 3: MOE 512 EXPERTS */}
          {selectedBlock === 'moe' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.25)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>
                🎮 {model.isMoe ? 'Sparse MoE 512 专家路由调度模拟' : 'Dense SwiGLU 前向激活'}：
              </strong>
              {model.isMoe ? (
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                    512 专家池采样 (前 20 个路由专家 · 黄色代表当前 Token 激活 · S 为常驻共享专家):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.from({ length: 20 }, (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMoeSelectedExpert(idx)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '4px',
                          border: moeSelectedExpert === idx ? '2px solid #FFF' : idx < 10 ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.06)',
                          background: idx < 10 ? 'rgba(251,191,36,0.25)' : '#0e1421',
                          color: idx < 10 ? '#fbbf24' : '#64748B',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        E{idx + 1}
                      </button>
                    ))}
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '4px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      S
                    </span>
                  </div>
                  <small style={{ color: '#94A3B8', display: 'block', marginTop: '8px' }}>
                    2.4T 总参数容量，每 Token 仅激活 10 路由专家 + 1 共享专家（单步活跃参数仅 {model.parameters.active}）。
                  </small>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                  27B Dense 模型采用经典的 Dense SwiGLU 结构，中间维度扩展至 17,408，双分支计算 SiLU(xW_gate) ⊙ xW_up 增强非线性拟合。
                </p>
              )}
            </div>
          )}

          {/* SIMULATOR 4: INPUT ALIGNMENT */}
          {selectedBlock === 'input' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)' }}>
              <strong style={{ color: '#10b981', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                Layer 0 多模态输入特征对齐机制：
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: '1.5' }}>
                文本由 151,936 词表的 BPE Tokenizer 查找嵌入；图像/视频由 27 层 ViT 提取并在通道维度执行 2×2 Pixel Shuffle 降采样四倍 Token 数后经轻量 MLP 投影至主干维度 d = {model.hidden}，在序列维度无缝拼接。
              </p>
            </div>
          )}

          {/* SIMULATOR 5: LM HEAD / MTP */}
          {selectedBlock === 'output' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(244,114,182,0.25)' }}>
              <strong style={{ color: '#f472b6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                LM Head 反嵌入投影与多 Token 预测 (MTP)：
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: '1.5' }}>
                主干特征经最终 RMSNorm 归一化后，通过 W_unembed (d × 151936) 投影为词表对数概率分布；配合 MTP 辅助训练头，在单步前向中同时预测未来多个 Token，大幅提升推理加速比与表征稠密度。
              </p>
            </div>
          )}

          {/* Core Mathematical Formulations */}
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold', marginBottom: '6px' }}>
              [ 当前模块数学形式化表达 ]:
            </div>
            <MathRenderer
              formula={
                selectedBlock === 'gdn'
                  ? `// 1. Q/K/V 投影与短卷积平滑
q_t, k_t = L2Norm(Swish(ShortConv(W_qk · x'_t))),  v_t = Swish(ShortConv(W_v · x'_t))
// 2. Delta 增量状态更新与衰减
δ_t = v_t - S_(t-1)ᵀ k_t,   α_t = Diag(1 - Sigmoid(W_α · x'_t))
S_t = S_(t-1) · α_t + Sigmoid(W_β · x'_t) · k_t · δ_tᵀ
// 3. 门控读取输出
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ RMSNorm(S_tᵀ q_t)]`
                  : selectedBlock === 'attention'
                  ? model.cycleAttention === 'QSA'
                    ? `// QSA 稀疏微块注意力 (Flash-Next 专属)
score_b = Indexer(q_t, K_block_b),   B_sel = TopK({score_b}, K=512)
Attn = Softmax((q_t · K[B_sel]ᵀ) / √d_k) · V[B_sel]
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ Attn]`
                    : `// GQA 4:1 全局多头注意力锚点 (RoPE θ = 1,000,000)
Q = RoPE(RMSNorm(W_q x'_t)),  K = RoPE(RMSNorm(W_k x'_t)),  V = W_v x'_t
Attn = Softmax((Q · Kᵀ) / √d_k + Mask) · V
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ Attn]`
                  : selectedBlock === 'moe'
                  ? model.isMoe
                    ? `// 512 专家 Sparse MoE 路由与聚合
s_t = Sigmoid(W_router · x'_t),   Top10 = TopK(s_t, K=10)
y_shared = E_shared(x'_t)
y_sparse = Σ_(i ∈ Top10) p_i · (SiLU(x'_t · W_gate,i) ⊙ (x'_t · W_up,i)) · W_down,i
y_channel = y_shared + y_sparse`
                    : `// Dense SwiGLU 前馈网络
y_channel = (SiLU(x'_t · W_gate) ⊙ (x'_t · W_up)) · W_down`
                  : selectedBlock === 'input'
                  ? `// 多模态输入特征对齐
x_t_text = Embedding(w_t),   x_t_vis = W_proj · PixelShuffle(ViT(v_img))
X = Concat([X_text, X_vis]) ∈ ℝ^(T × d = ${model.hidden})`
                  : `// LM Head 反嵌入与 MTP 多 Token 预测
Logits_t = Softmax(W_unembed · RMSNorm(h_L,t))
Loss_total = Loss_next + λ · Loss_MTP`
              }
              color={model.accent}
            />
          </div>

          {/* Tensor Dimension Table */}
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px' }}>
              [ 精确张量维度与硬件规格 (模型: {model.name}) ]:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 200px', gap: '8px 16px', fontSize: '0.88rem', background: '#0e1421', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>变量</div>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>物理作用</div>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>精确张量形状</div>
              
              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>主干隐藏维度 d</div>
              <div style={{ color: '#CBD5E1' }}>层间传递的残差向量维度</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>d = {model.hidden}</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>GDN 状态 S_t</div>
              <div style={{ color: '#CBD5E1' }}>O(1) 紧凑历史状态矩阵</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>[H_heads, d_k=128, d_v=128]</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>{model.cycleAttention}</div>
              <div style={{ color: '#CBD5E1' }}>注意力查询/键/值头配置</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{model.blockAttention}</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>通道 FFN / MoE</div>
              <div style={{ color: '#CBD5E1' }}>非线性特征变换容量</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{model.feedForward}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
