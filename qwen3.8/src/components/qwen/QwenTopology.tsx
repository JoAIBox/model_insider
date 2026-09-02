import React, { useState, useMemo, useEffect } from 'react';
import { MathRenderer } from '../MathRenderer';

export type ModelId = '27b' | 'a95b' | 'flash';

export interface ModelProfile {
  id: ModelId;
  name: string;
  shortName: string;
  kind: string;
  accent: string;
  description: string;
  parameters: { backbone: string; ngram?: string; mtp?: string; active: string; note: string };
  hidden: string;
  hiddenDimNum: number;
  layers: number;
  cycleCount: number;
  context: string;
  modality: string;
  blockAttention: string;
  deltaNet: string;
  feedForward: string;
  extras: string[];
  cycleAttention: 'Gated Attention' | 'QSA';
  isMoe: boolean;
  mtp: string;
  supportsSpeculativeDecoding: boolean;
}

interface QwenTopologyProps {
  model: ModelProfile;
  onNavigateTab?: (tab: string) => void;
}

export const QwenTopology: React.FC<QwenTopologyProps> = ({ model }) => {
  // Navigation & selection states
  const [selectedMacroSection, setSelectedMacroSection] = useState<'input' | 'backbone' | 'cycle' | 'layer' | 'output'>('backbone');
  const [selectedCycleId, setSelectedCycleId] = useState<number>(1);
  const [selectedLayerSlot, setSelectedLayerSlot] = useState<number>(4); // 1, 2, 3, or 4
  const [selectedOperatorNode, setSelectedOperatorNode] = useState<'seq' | 'ffn' | 'norm' | 'residual'>('seq');

  // Interactive Live Simulators states
  const [gdnStep, setGdnStep] = useState<number>(0);
  const [gdnPlaying, setGdnPlaying] = useState<boolean>(false);
  const [gdnAlpha, setGdnAlpha] = useState<number>(0.85);

  const [attnFocus, setAttnFocus] = useState<number>(2);
  const [moeActiveExpert, setMoeActiveExpert] = useState<number>(3);
  const [moeStep, setMoeStep] = useState<number>(0);
  const [residualGates, setResidualGates] = useState<number[]>([0.85, 0.65, 0.90, 0.40]);

  // Timers for live animations
  useEffect(() => {
    if (!gdnPlaying) return;
    const timer = setInterval(() => setGdnStep((s) => (s + 1) % 3), 1300);
    return () => clearInterval(timer);
  }, [gdnPlaying]);

  // Calculate layer numbers based on selected cycle and slot
  const currentLayerNum = useMemo(() => {
    return (selectedCycleId - 1) * 4 + selectedLayerSlot;
  }, [selectedCycleId, selectedLayerSlot]);

  const isCurrentLayerAttention = selectedLayerSlot === 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', color: '#E2E8F0', width: '100%' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & MODEL SPECIFICATION SUMMARY */}
      {/* ========================================================================= */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>🏛️</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                {model.name} 端到端宏观模型架构与分层连接
              </h2>
              <span style={{ background: `${model.accent}20`, color: model.accent, border: `1px solid ${model.accent}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {model.kind}
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '6px 0 0 0' }}>
              清晰展示模型的<b>输入、输出、总层数、重复大模块、3:1 重复规律与连接方式</b>。点击任意模块方块，在当前页面<b>就地展开</b>其内部 4 层物理结构与微观数据流。
            </p>
          </div>
        </div>

        {/* 4 Essential Model Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: '#070a12', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>总层数 / 骨干深度</span>
            <strong style={{ fontSize: '1.15rem', color: '#FFF', display: 'block', marginTop: '2px' }}>
              {model.layers} 物理层 ({model.cycleCount} 个周期)
            </strong>
            <small style={{ color: model.accent, fontSize: '0.75rem' }}>隐藏维度 d = {model.hidden}</small>
          </div>

          <div style={{ background: '#070a12', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>重复规律 (3:1 混合比)</span>
            <strong style={{ fontSize: '1.15rem', color: '#c4b5fd', display: 'block', marginTop: '2px' }}>
              3 层 GDN + 1 层 {model.cycleAttention === 'QSA' ? 'QSA' : 'Attn'}
            </strong>
            <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>75% 线性 O(1) + 25% 全局锚点</small>
          </div>

          <div style={{ background: '#070a12', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>通道前馈 / MoE 专家</span>
            <strong style={{ fontSize: '1.15rem', color: '#fbbf24', display: 'block', marginTop: '2px' }}>
              {model.isMoe ? '512 专家 (10 路由+1 共享)' : 'Dense SwiGLU (17,408)'}
            </strong>
            <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>激活参数: {model.parameters.active}</small>
          </div>

          <div style={{ background: '#070a12', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>多模态输入 / 词表输出</span>
            <strong style={{ fontSize: '1.15rem', color: '#10b981', display: 'block', marginTop: '2px' }}>
              {model.modality}
            </strong>
            <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>151,936 词表 + MTP 辅助</small>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MACRO MODEL ARCHITECTURE FLOW (输入 -> 骨干网 -> 输出, 100% Fit, Zero Scrollbar) */}
      {/* ========================================================================= */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <span style={{ color: model.accent, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              宏观系统架构流 · END-TO-END MACRO ARCHITECTURE FLOW
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF', margin: '2px 0 0 0' }}>
              模型端到端三大阶段与连接拓扑（点击任意阶段方块可在下方展开）
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>100% 完整展示 · 无滚动条</span>
        </div>

        {/* 3 Macro Stages Horizontal Pipeline (Adapts 100% to screen width, wraps smoothly) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          
          {/* STAGE 1: INPUT */}
          <div
            onClick={() => setSelectedMacroSection('input')}
            style={{
              background: selectedMacroSection === 'input' ? 'rgba(16, 185, 129, 0.15)' : '#070a12',
              border: selectedMacroSection === 'input' ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>STAGE 01 · LAYER 0</span>
              <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold' }}>
                多模态输入
              </span>
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#FFF' }}>多模态输入与词嵌入对齐</strong>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
              文本由 151,936 BPE 词表映射，图像经 27 层 ViT 提取并经 2×2 Pixel Shuffle 空间降采样后投影，在时间维度拼接为统一输入序列 X ∈ ℝ^(T × d)。
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', fontSize: '0.78rem', color: '#10b981' }}>
              连接方式: 投影对齐 ──► 骨干残差输入流 h_1
            </div>
          </div>

          {/* STAGE 2: 3:1 HYBRID BACKBONE */}
          <div
            onClick={() => setSelectedMacroSection('backbone')}
            style={{
              background: selectedMacroSection === 'backbone' || selectedMacroSection === 'cycle' || selectedMacroSection === 'layer' ? 'rgba(196, 181, 253, 0.15)' : '#070a12',
              border: selectedMacroSection === 'backbone' || selectedMacroSection === 'cycle' || selectedMacroSection === 'layer' ? `2px solid ${model.accent}` : `1px solid ${model.accent}40`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: model.accent, fontFamily: 'monospace' }}>
                STAGE 02 · {model.layers} LAYERS
              </span>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: `${model.accent}25`, color: model.accent, fontWeight: 'bold' }}>
                × {model.cycleCount} 周期重复
              </span>
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#FFF' }}>3:1 混合注意力骨干网络</strong>
            <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
              <b>重复规律：</b>每 4 层由 <b>3 层 GDN (线性 O(1) 显存)</b> + <b>1 层 {model.cycleAttention} (全局锚点)</b> 组成，循环重复 {model.cycleCount} 次。
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', fontSize: '0.78rem', color: '#fbbf24' }}>
              连接方式: Pre-LN 双残差流 ──► 跨层状态 S_t 传递
            </div>
          </div>

          {/* STAGE 3: OUTPUT */}
          <div
            onClick={() => setSelectedMacroSection('output')}
            style={{
              background: selectedMacroSection === 'output' ? 'rgba(244, 114, 182, 0.15)' : '#070a12',
              border: selectedMacroSection === 'output' ? '2px solid #f472b6' : '1px solid rgba(244, 114, 182, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#f472b6', fontFamily: 'monospace' }}>STAGE 03 · OUTPUT</span>
              <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(244, 114, 182, 0.2)', color: '#f472b6', fontWeight: 'bold' }}>
                词表输出 & MTP
              </span>
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#FFF' }}>LM Head 反嵌入与预测</strong>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
              骨干特征经最终 Final RMSNorm 归一化后，由 W_unembed 映射为 151,936 词表 Logits；配合 MTP 多 Token 预测头同时预测未来多个位置。
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', fontSize: '0.78rem', color: '#f472b6' }}>
              连接方式: Final RMSNorm ──► Softmax 采样 ──► Context
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REPEATING CYCLE BLOCKS GRID & SELECTOR (清晰展示哪些是重复模块与周期数) */}
      {/* ========================================================================= */}
      <div className="card" style={{ background: '#0e1421', border: `1px solid ${model.accent}40`, borderRadius: '16px', padding: '22px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🔁</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                骨干网周期大模块 ({model.cycleCount} 个完全相同的 4 层重复模块)
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              模型由 <b>{model.cycleCount} 个结构完全一致的 4 层周期大模块</b> 顺序级联构成。点击下方任意周期模块，就地展开其内部 4 个具体物理层。
            </p>
          </div>
          <span style={{ background: `${model.accent}20`, color: model.accent, padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
            当前选中: Cycle {selectedCycleId} (Layer {(selectedCycleId - 1) * 4 + 1} ~ {selectedCycleId * 4})
          </span>
        </div>

        {/* Responsive Grid of Cycle Cards (Zero Scrollbars, clean auto-fill) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
          {Array.from({ length: model.cycleCount }).map((_, idx) => {
            const cycleId = idx + 1;
            const isSelected = selectedCycleId === cycleId;
            return (
              <button
                key={`cycle-block-${cycleId}`}
                type="button"
                onClick={() => {
                  setSelectedCycleId(cycleId);
                  setSelectedMacroSection('cycle');
                }}
                style={{
                  padding: '10px 6px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${model.accent}` : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? `${model.accent}25` : '#070a12',
                  color: isSelected ? '#FFF' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '0.92rem', color: isSelected ? model.accent : '#CBD5E1' }}>
                  Cycle {cycleId}
                </span>
                <small style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                  L{(cycleId - 1) * 4 + 1}-{cycleId * 4}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DYNAMICALLY EXPANDED 4-LAYER IN-CYCLE PIPELINE (内部 4 层连接方式与规律展开) */}
      {/* ========================================================================= */}
      <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🔬</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                Cycle {selectedCycleId} 内部 4 层物理连接与算子细节 (3:1 重复规律展开)
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              展示 Cycle {selectedCycleId} 内部 4 个具体物理层的串联残差流动。点击下方任意单层卡片，可在最下方聚焦其<b>微观数据流电路与实时交互仿真</b>。
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            聚焦层：<b>Layer {currentLayerNum}</b> (Slot {selectedLayerSlot}/4 · {isCurrentLayerAttention ? model.cycleAttention : 'GDN'})
          </span>
        </div>

        {/* 4 Layer In-Cycle Pipeline Cards (100% Responsive Grid of 4 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {[1, 2, 3, 4].map((slot) => {
            const layerId = (selectedCycleId - 1) * 4 + slot;
            const isAttn = slot === 4;
            const isSelected = selectedLayerSlot === slot;
            const cardColor = isAttn ? (model.cycleAttention === 'QSA' ? '#fbbf24' : '#c4b5fd') : '#67e8f9';

            return (
              <div
                key={`slot-${slot}`}
                onClick={() => {
                  setSelectedLayerSlot(slot);
                  setSelectedMacroSection('layer');
                }}
                style={{
                  background: isSelected ? `${cardColor}20` : '#070a12',
                  border: isSelected ? `2px solid ${cardColor}` : `1px solid ${cardColor}40`,
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: cardColor, fontFamily: 'monospace' }}>
                    Layer {layerId} (Slot {slot}/4)
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: `${cardColor}25`, color: cardColor, fontWeight: 'bold' }}>
                    {isAttn ? '25% 全局锚点' : '75% O(1) 线性'}
                  </span>
                </div>

                <strong style={{ fontSize: '1rem', color: '#FFF' }}>
                  {isAttn ? model.cycleAttention : 'Gated DeltaNet (GDN)'}
                </strong>

                <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                  {isAttn
                    ? (model.cycleAttention === 'QSA' ? 'QSA 块稀疏检索 (512 块预算)' : 'GQA 4:1 全域多头注意力')
                    : 'Delta 规则状态矩阵 S_t 增量更新 (O(1) 显存)'}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', fontSize: '0.78rem', color: '#fbbf24' }}>
                  通道前馈: {model.isMoe ? '512 专家 MoE (10 路由+1 共享)' : 'Dense SwiGLU (17,408)'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. IN-PLACE MICRO OPERATOR CIRCUIT & LIVE INTERACTIVE SIMULATOR */}
      {/* ========================================================================= */}
      <div className="card" style={{ background: '#0e1421', border: `1px solid ${model.accent}40`, borderRadius: '16px', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>⚡</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                Layer {currentLayerNum} 微观电路拓扑与算子实时仿真
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              点击下方微观流水线中的各个节点，在当前页面直接调节参数并观察<b>数学公式、张量形状与状态演化</b>。
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedOperatorNode('seq')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: selectedOperatorNode === 'seq' ? `1px solid ${model.accent}` : '1px solid rgba(255,255,255,0.1)', background: selectedOperatorNode === 'seq' ? `${model.accent}20` : '#070a12', color: selectedOperatorNode === 'seq' ? '#FFF' : '#94A3B8', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              1. 序列混合 ({isCurrentLayerAttention ? model.cycleAttention : 'GDN'})
            </button>
            <button
              onClick={() => setSelectedOperatorNode('ffn')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: selectedOperatorNode === 'ffn' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)', background: selectedOperatorNode === 'ffn' ? 'rgba(251,191,36,0.2)' : '#070a12', color: selectedOperatorNode === 'ffn' ? '#fbbf24' : '#94A3B8', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              2. 通道混合 ({model.isMoe ? 'MoE' : 'SwiGLU'})
            </button>
            <button
              onClick={() => setSelectedOperatorNode('residual')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: selectedOperatorNode === 'residual' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', background: selectedOperatorNode === 'residual' ? 'rgba(16,185,129,0.2)' : '#070a12', color: selectedOperatorNode === 'residual' ? '#10b981' : '#94A3B8', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              3. 残差流连接
            </button>
          </div>
        </div>

        {/* Micro Flowchart SVG (100% width, viewBox 0 0 900 90, ZERO SCROLLBAR) */}
        <div style={{ marginTop: '16px', background: '#070a12', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <svg width="100%" height="auto" viewBox="0 0 900 90" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxWidth: '100%' }}>
            <defs>
              <marker id="topo-flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
            </defs>

            <line x1="140" y1="45" x2="170" y2="45" stroke="#64748b" strokeWidth="2" markerEnd="url(#topo-flow-arrow)" />
            <line x1="360" y1="45" x2="390" y2="45" stroke="#64748b" strokeWidth="2" markerEnd="url(#topo-flow-arrow)" />
            <line x1="600" y1="45" x2="630" y2="45" stroke="#64748b" strokeWidth="2" markerEnd="url(#topo-flow-arrow)" />
            <line x1="810" y1="45" x2="835" y2="45" stroke="#64748b" strokeWidth="2" markerEnd="url(#topo-flow-arrow)" />

            {/* Residual skip curve */}
            <path d="M 70 20 C 70 6, 720 6, 720 20" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="400" y="12" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">Pre-LN 残差恒等跳跃连接</text>

            {/* Node 1: Layer Input */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedOperatorNode('norm')}>
              <rect x="10" y="20" width="130" height="50" rx="6" fill="#0e1421" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="75" y="42" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">层级输入 h_l</text>
              <text x="75" y="58" fill="#67e8f9" fontSize="9.5" fontFamily="monospace" textAnchor="middle">d = {model.hidden}</text>
            </g>

            {/* Node 2: Sequence Mixer */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedOperatorNode('seq')}>
              <rect
                x="170"
                y="20"
                width="190"
                height="50"
                rx="6"
                fill={selectedOperatorNode === 'seq' ? (isCurrentLayerAttention ? 'rgba(196,181,253,0.25)' : 'rgba(103,232,249,0.25)') : '#0e1421'}
                stroke={isCurrentLayerAttention ? '#c4b5fd' : '#67e8f9'}
                strokeWidth={selectedOperatorNode === 'seq' ? '2' : '1'}
              />
              <text x="265" y="42" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                1. 序列混合: {isCurrentLayerAttention ? model.cycleAttention : 'GDN'}
              </text>
              <text x="265" y="58" fill={isCurrentLayerAttention ? '#c4b5fd' : '#67e8f9'} fontSize="9.5" textAnchor="middle">
                {isCurrentLayerAttention ? '全局检索锚点 (25%)' : 'O(1) 状态更新 (75%)'}
              </text>
            </g>

            {/* Node 3: Channel Mixer */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedOperatorNode('ffn')}>
              <rect
                x="390"
                y="20"
                width="210"
                height="50"
                rx="6"
                fill={selectedOperatorNode === 'ffn' ? 'rgba(251,191,36,0.25)' : '#0e1421'}
                stroke="#fbbf24"
                strokeWidth={selectedOperatorNode === 'ffn' ? '2' : '1'}
              />
              <text x="495" y="42" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                2. 通道混合: {model.isMoe ? 'Sparse MoE' : 'Dense SwiGLU'}
              </text>
              <text x="495" y="58" fill="#fbbf24" fontSize="9.5" textAnchor="middle">
                {model.isMoe ? '10 路由+1 共享专家 (512E)' : 'd_ffn = 17,408'}
              </text>
            </g>

            {/* Node 4: Residual Integration */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedOperatorNode('residual')}>
              <rect
                x="630"
                y="20"
                width="180"
                height="50"
                rx="6"
                fill={selectedOperatorNode === 'residual' ? 'rgba(16,185,129,0.25)' : '#0e1421'}
                stroke="#10b981"
                strokeWidth={selectedOperatorNode === 'residual' ? '2' : '1'}
              />
              <text x="720" y="42" fill="#FFF" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                3. 残差融合更新
              </text>
              <text x="720" y="58" fill="#10b981" fontSize="9.5" textAnchor="middle">
                {model.id === 'flash' ? '4-Way Gated (Rank 320)' : 'Pre-LN 恒等累加'}
              </text>
            </g>

            {/* Node 5: Output */}
            <rect x="835" y="20" width="55" height="50" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text x="862" y="42" fill="#FFF" fontSize="10.5" fontWeight="bold" textAnchor="middle">输出</text>
            <text x="862" y="58" fill="#94A3B8" fontSize="9.5" fontFamily="monospace" textAnchor="middle">h_l+1</text>
          </svg>
        </div>

        {/* INLINE SIMULATOR CONTENT */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SIMULATOR: GDN (when slot 1..3) - K3-style animated SVG data flow */}
          {!isCurrentLayerAttention && selectedOperatorNode === 'seq' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(103,232,249,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: '#67e8f9', fontSize: '1rem' }}>
                  🛰️ GDN Delta Rule 数据流动画拓扑
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>* 悬停下方步骤卡片高亮对应数据路径</span>
              </div>

              {/* Animated SVG Data Flow Diagram */}
              <div style={{ background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', marginBottom: '14px' }}>
                <svg viewBox="0 0 880 260" width="100%" style={{ display: 'block', overflow: 'visible' }}>
                  <defs>
                    <marker id="gdn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                    </marker>
                    <marker id="gdn-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#67e8f9" />
                    </marker>
                    <style>{`
                      @keyframes gdn-dash { to { stroke-dashoffset: -20; } }
                      .gdn-flow { stroke-dasharray: 5 4; animation: gdn-dash 1.2s linear infinite; }
                    `}</style>
                  </defs>
                  {/* Connection Lines */}
                  <line x1="115" y1="130" x2="145" y2="130" stroke={gdnStep === 0 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 0 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 0 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <path d="M 230 130 L 255 130 C 265 130, 265 70, 275 70" fill="none" stroke={gdnStep === 0 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 0 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 0 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <path d="M 230 130 L 255 130 C 265 130, 265 200, 275 200" fill="none" stroke={gdnStep === 1 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 1 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 1 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <path d="M 405 70 L 430 70 C 445 70, 445 115, 455 115" fill="none" stroke={gdnStep === 1 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 1 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 1 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <path d="M 405 200 L 430 200 C 445 200, 445 150, 455 150" fill="none" stroke={gdnStep === 1 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 1 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 1 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <line x1="625" y1="130" x2="655" y2="130" stroke={gdnStep === 2 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 2 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 2 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <line x1="715" y1="130" x2="745" y2="130" stroke={gdnStep === 2 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 2 ? 2 : 1.2} markerEnd={`url(#${gdnStep === 2 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  {/* Bypass gating line */}
                  <path d="M 230 110 C 230 25, 660 25, 680 110" fill="none" stroke={gdnStep === 2 ? '#67e8f9' : '#475569'} strokeWidth={gdnStep === 2 ? 2 : 1.2} strokeDasharray="5 4" markerEnd={`url(#${gdnStep === 2 ? 'gdn-arrow-active' : 'gdn-arrow'})`} />
                  <text x="450" y="30" fill="#94A3B8" fontSize="10" textAnchor="middle">Output Gate Bypass (W_g · x'_t)</text>
                  {/* Node Boxes */}
                  <rect x="15" y="100" width="100" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="65" y="126" fill="#94A3B8" fontSize="13" textAnchor="middle" fontWeight="bold">Input x_t</text>
                  <text x="65" y="146" fill="#64748B" fontSize="11" textAnchor="middle">d = {model.hidden}</text>
                  <rect x="145" y="100" width="85" height="60" rx="6" fill={gdnStep === 0 ? 'rgba(103,232,249,0.15)' : '#0F172A'} stroke={gdnStep === 0 ? '#67e8f9' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="187" y="135" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">RMSNorm</text>
                  <rect x="275" y="40" width="130" height="60" rx="6" fill={gdnStep === 0 ? 'rgba(103,232,249,0.15)' : '#0F172A'} stroke={gdnStep === 0 ? '#67e8f9' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="340" y="65" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">Q/K/V 投影</text>
                  <text x="340" y="85" fill="#64748B" fontSize="10" textAnchor="middle">Conv1D + Swish + L2Norm</text>
                  <rect x="275" y="170" width="130" height="60" rx="6" fill={gdnStep === 1 ? 'rgba(251,191,36,0.15)' : '#0F172A'} stroke={gdnStep === 1 ? '#fbbf24' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="340" y="196" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">α_t / β_t 门控</text>
                  <text x="340" y="216" fill="#64748B" fontSize="10" textAnchor="middle">低秩衰减 + 写入强度</text>
                  <rect x="455" y="85" width="170" height="90" rx="8" fill={gdnStep === 1 ? 'rgba(16,185,129,0.15)' : '#090D16'} stroke={gdnStep === 1 ? '#10B981' : '#475569'} strokeWidth="2" />
                  <text x="540" y="118" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">递归状态 S_t</text>
                  <text x="540" y="138" fill="#10B981" fontSize="11" textAnchor="middle" fontFamily="monospace">S_t = αS_t-1 + βkδᵀ</text>
                  <text x="540" y="158" fill="#64748B" fontSize="10" textAnchor="middle">[H, d_k=128, d_v=128]</text>
                  <circle cx="685" cy="130" r="28" fill={gdnStep === 2 ? 'rgba(103,232,249,0.15)' : '#0F172A'} stroke={gdnStep === 2 ? '#67e8f9' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
                  <text x="685" y="132" fill="#FFF" fontSize="18" textAnchor="middle" fontWeight="bold">⊙</text>
                  <text x="685" y="148" fill="#64748B" fontSize="9" textAnchor="middle">Output Gate</text>
                  <rect x="745" y="100" width="90" height="60" rx="6" fill={gdnStep === 2 ? 'rgba(103,232,249,0.15)' : '#0F172A'} stroke={gdnStep === 2 ? '#67e8f9' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="790" y="135" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">W_o 输出</text>
                  {/* Moving particle */}
                  <circle r="4" fill="#67e8f9" style={{ filter: 'drop-shadow(0 0 6px #67e8f9)' }}>
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 65 130 L 145 130 L 340 70 L 540 130 L 685 130 L 790 130" />
                  </circle>
                </svg>
              </div>

              {/* Interactive Step Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                {[
                  { title: 'RMSNorm + Q/K/V 提取', formula: "q,k = L2(Swish(Conv(W·x')))", desc: 'RMS归一化 → 1D卷积捕获局部上下文 → Swish激活 → L2Norm 归一化', step: 0 },
                  { title: '衰减/写入门 + 状态更新', formula: 'S_t = Diag(α)·S_(t-1) + β·k·δᵀ', desc: 'α 通道衰减遗忘旧信息，β 写入强度控制新信息量，δ=v-Sᵀk 仅写入残差', step: 1 },
                  { title: '状态读取 + 门控输出', formula: 'y = W_o·[σ(W_g·x) ⊙ Norm(Sᵀq)]', desc: 'Query 检索状态矩阵，Sigmoid 门控过滤无关通道后经 W_o 投影输出', step: 2 }
                ].map((s) => (
                  <div
                    key={s.step}
                    onMouseEnter={() => { setGdnPlaying(false); setGdnStep(s.step); }}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: gdnStep === s.step ? '1px solid #67e8f9' : '1px solid rgba(255,255,255,0.06)',
                      background: gdnStep === s.step ? 'rgba(103,232,249,0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', color: '#67e8f9', fontWeight: 'bold', marginBottom: '4px' }}>Step 0{s.step + 1}</div>
                    <strong style={{ fontSize: '0.92rem', color: gdnStep === s.step ? '#FFF' : '#E2E8F0', display: 'block', marginBottom: '4px' }}>{s.title}</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#38BDF8', background: 'rgba(0,0,0,0.3)', padding: '4px 6px', borderRadius: '4px', marginBottom: '6px', overflowX: 'auto' }}>{s.formula}</div>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Slider */}
              <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>动态衰减门 α_t: <b style={{ color: '#67e8f9' }}>{gdnAlpha.toFixed(2)}</b></span>
                  <button onClick={() => setGdnPlaying(!gdnPlaying)} style={{ padding: '4px 12px', borderRadius: '6px', background: gdnPlaying ? '#EF4444' : '#10b981', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.78rem' }}>
                    {gdnPlaying ? '暂停' : '▶ 自动步进'}
                  </button>
                </div>
                <input type="range" min="0.3" max="0.99" step="0.05" value={gdnAlpha} onChange={(e) => setGdnAlpha(Number(e.target.value))} style={{ width: '100%' }} />
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  <b>设计目的：</b>Delta 规则只计算与当前记忆不一致的残差向量 δ_t = v_t - S_(t-1)ᵀ k_t，避免线性注意力盲目累加覆盖；α_t 控制历史衰减，保证长达 1M 上下文下解码显存保持 O(1) 恒定。
                </p>
              </div>
            </div>
          )}

          {/* SIMULATOR: ATTENTION / QSA (when slot 4) - K3-style animated SVG */}
          {isCurrentLayerAttention && selectedOperatorNode === 'seq' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(196,181,253,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: '#c4b5fd', fontSize: '1rem' }}>
                  🛰️ {model.cycleAttention} 锚点注意力数据流拓扑
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>* 悬停步骤卡片高亮路径</span>
              </div>

              {/* Animated SVG */}
              <div style={{ background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', marginBottom: '14px' }}>
                <svg viewBox="0 0 880 240" width="100%" style={{ display: 'block', overflow: 'visible' }}>
                  <defs>
                    <marker id="attn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                    </marker>
                    <marker id="attn-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#c4b5fd" />
                    </marker>
                    <style>{`
                      @keyframes attn-dash { to { stroke-dashoffset: -20; } }
                      .attn-flow { stroke-dasharray: 5 4; animation: attn-dash 1.2s linear infinite; }
                    `}</style>
                  </defs>
                  {/* Connections */}
                  <line x1="115" y1="120" x2="145" y2="120" stroke={attnFocus === 0 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 0 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 0 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <path d="M 230 120 L 255 120 C 265 120, 265 60, 275 60" fill="none" stroke={attnFocus === 1 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 1 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 1 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <path d="M 230 120 L 255 120 C 265 120, 265 180, 275 180" fill="none" stroke={attnFocus === 1 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 1 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 1 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <path d="M 415 60 L 435 60 C 450 60, 450 105, 460 105" fill="none" stroke={attnFocus === 2 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 2 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 2 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <path d="M 415 180 L 435 180 C 450 180, 450 135, 460 135" fill="none" stroke={attnFocus === 2 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 2 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 2 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <line x1="620" y1="120" x2="650" y2="120" stroke={attnFocus === 3 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 3 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 3 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  <line x1="710" y1="120" x2="740" y2="120" stroke={attnFocus === 3 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 3 ? 2 : 1.2} markerEnd={`url(#${attnFocus === 3 ? 'attn-arrow-active' : 'attn-arrow'})`} />
                  {/* Gate bypass */}
                  <path d="M 230 100 C 230 20, 660 20, 680 100" fill="none" stroke={attnFocus === 3 ? '#c4b5fd' : '#475569'} strokeWidth={attnFocus === 3 ? 2 : 1.2} strokeDasharray="5 4" />
                  <text x="450" y="25" fill="#94A3B8" fontSize="10" textAnchor="middle">Output Gate (W_g · x_t)</text>
                  {/* Nodes */}
                  <rect x="15" y="90" width="100" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="65" y="116" fill="#94A3B8" fontSize="13" textAnchor="middle" fontWeight="bold">Input x_t</text>
                  <text x="65" y="136" fill="#64748B" fontSize="11" textAnchor="middle">d = {model.hidden}</text>

                  <rect x="145" y="90" width="85" height="60" rx="6" fill={attnFocus === 0 ? 'rgba(196,181,253,0.15)' : '#0F172A'} stroke={attnFocus === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="187" y="125" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">RMSNorm</text>

                  <rect x="275" y="30" width="140" height="60" rx="6" fill={attnFocus === 1 ? 'rgba(196,181,253,0.15)' : '#0F172A'} stroke={attnFocus === 1 ? '#c4b5fd' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="345" y="55" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">Q 投影</text>
                  <text x="345" y="75" fill="#64748B" fontSize="10" textAnchor="middle">RoPE(W_q · x'_t)</text>

                  <rect x="275" y="150" width="140" height="60" rx="6" fill={attnFocus === 1 ? 'rgba(196,181,253,0.15)' : '#0F172A'} stroke={attnFocus === 1 ? '#c4b5fd' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="345" y="175" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">K/V 投影</text>
                  <text x="345" y="195" fill="#64748B" fontSize="10" textAnchor="middle">{model.blockAttention}</text>

                  <rect x="460" y="80" width="160" height="80" rx="8" fill={attnFocus === 2 ? 'rgba(196,181,253,0.15)' : '#090D16'} stroke={attnFocus === 2 ? '#c4b5fd' : '#475569'} strokeWidth="2" />
                  <text x="540" y="110" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">{model.cycleAttention === 'QSA' ? 'QSA 稀疏注意力' : 'Softmax 注意力'}</text>
                  <text x="540" y="130" fill="#c4b5fd" fontSize="11" textAnchor="middle" fontFamily="monospace">Softmax(QKᵀ/√d)·V</text>
                  <text x="540" y="148" fill="#64748B" fontSize="10" textAnchor="middle">{model.cycleAttention === 'QSA' ? 'TopK 512 微块稀疏' : '全域因果注意力'}</text>

                  <circle cx="680" cy="120" r="28" fill={attnFocus === 3 ? 'rgba(196,181,253,0.15)' : '#0F172A'} stroke={attnFocus === 3 ? '#c4b5fd' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
                  <text x="680" y="122" fill="#FFF" fontSize="18" textAnchor="middle" fontWeight="bold">⊙</text>
                  <text x="680" y="138" fill="#64748B" fontSize="9" textAnchor="middle">Gate</text>

                  <rect x="740" y="90" width="90" height="60" rx="6" fill={attnFocus === 3 ? 'rgba(196,181,253,0.15)' : '#0F172A'} stroke={attnFocus === 3 ? '#c4b5fd' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
                  <text x="785" y="125" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">W_o 输出</text>
                  {/* Moving particle */}
                  <circle r="4" fill="#c4b5fd" style={{ filter: 'drop-shadow(0 0 6px #c4b5fd)' }}>
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 65 120 L 145 120 L 345 60 L 540 120 L 680 120 L 785 120" />
                  </circle>
                </svg>
              </div>

              {/* Interactive Step Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {[
                  { title: 'RMSNorm 归一化', formula: "x'_t = RMSNorm(x_t)", desc: '输入归一化稳定梯度流', step: 0 },
                  { title: 'Q/K/V 投影 + RoPE', formula: 'Q = RoPE(W_q·x\')', desc: model.cycleAttention === 'QSA' ? 'QSA 分块稀疏投影' : 'GQA 4:1 分组查询', step: 1 },
                  { title: `${model.cycleAttention} 注意力核`, formula: 'Softmax(QKᵀ/√d)·V', desc: '全域因果注意力精准检索长距离依赖', step: 2 },
                  { title: '门控输出投影', formula: 'y = W_o·[σ(W_g·x) ⊙ Attn]', desc: 'Sigmoid 门控 + W_o 线性投影', step: 3 }
                ].map((s) => (
                  <div key={s.step} onMouseEnter={() => setAttnFocus(s.step)} style={{
                    padding: '12px', borderRadius: '6px',
                    border: attnFocus === s.step ? '1px solid #c4b5fd' : '1px solid rgba(255,255,255,0.06)',
                    background: attnFocus === s.step ? 'rgba(196,181,253,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: '0.82rem', color: '#c4b5fd', fontWeight: 'bold', marginBottom: '4px' }}>Step 0{s.step + 1}</div>
                    <strong style={{ fontSize: '0.9rem', color: attnFocus === s.step ? '#FFF' : '#E2E8F0', display: 'block', marginBottom: '4px' }}>{s.title}</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#a78bfa', background: 'rgba(0,0,0,0.3)', padding: '3px 6px', borderRadius: '4px', marginBottom: '4px' }}>{s.formula}</div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: '1.35' }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '10px', background: '#02040a', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
                  <b>设计目的：</b>线性注意力虽然显存低，但存在事实性检索精度瓶颈。每 4 层插入一层精确注意力锚点，以 25% 的参数代价补齐 100% 的精准长距离回溯能力。
                </p>
              </div>
            </div>
          )}

          {/* SIMULATOR: MOE / FFN */}
          {selectedOperatorNode === 'ffn' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>
                  🛰️ {model.isMoe ? 'Sparse MoE 动态专家路由数据流' : 'Dense SwiGLU 数据流'}
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>* 悬停查看计算路径</span>
              </div>

              {/* Animated SVG */}
              <div style={{ background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', marginBottom: '14px' }}>
                <svg viewBox="0 0 880 280" width="100%" style={{ display: 'block', overflow: 'visible' }}>
                  <defs>
                    <marker id="moe-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                    </marker>
                    <marker id="moe-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
                    </marker>
                    <style>{`
                      @keyframes moe-dash { to { stroke-dashoffset: -20; } }
                      .moe-flow { stroke-dasharray: 5 4; animation: moe-dash 1.2s linear infinite; }
                    `}</style>
                  </defs>
                  
                  {/* Common Input & RMSNorm */}
                  <line x1="95" y1="140" x2="125" y2="140" stroke="#475569" strokeWidth="1.2" markerEnd="url(#moe-arrow)" />
                  <line x1="215" y1="140" x2="245" y2="140" stroke="#475569" strokeWidth="1.2" markerEnd="url(#moe-arrow)" />
                  
                  <rect x="15" y="110" width="80" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="55" y="145" fill="#94A3B8" fontSize="13" textAnchor="middle" fontWeight="bold">Input x_t</text>
                  
                  <rect x="125" y="110" width="90" height="60" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                  <text x="170" y="145" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">RMSNorm</text>

                  {model.isMoe ? (
                    <g>
                      {/* Router Path */}
                      <path d="M 245 140 C 265 140, 265 60, 290 60" fill="none" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <rect x="290" y="30" width="130" height="60" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="355" y="55" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">Router 路由网络</text>
                      <text x="355" y="75" fill="#fbbf24" fontSize="10" textAnchor="middle">Top 10 / 512 Experts</text>

                      {/* Routed Experts Path */}
                      <path d="M 420 60 C 440 60, 440 90, 460 90" fill="none" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <rect x="460" y="60" width="160" height="60" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="540" y="85" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">10 激活路由专家</text>
                      <text x="540" y="105" fill="#64748B" fontSize="10" textAnchor="middle">SwiGLU (Dim 2,048)</text>

                      {/* Shared Expert Path */}
                      <path d="M 245 140 C 265 140, 265 200, 460 200" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <rect x="460" y="170" width="160" height="60" rx="6" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5" />
                      <text x="540" y="195" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">1 常驻共享专家</text>
                      <text x="540" y="215" fill="#64748B" fontSize="10" textAnchor="middle">捕获通用知识</text>

                      {/* Output Aggregation */}
                      <path d="M 620 90 C 640 90, 640 140, 660 140" fill="none" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <path d="M 620 200 C 640 200, 640 140, 660 140" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <circle cx="675" cy="140" r="25" fill="#0F172A" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="675" y="146" fill="#FFF" fontSize="18" textAnchor="middle" fontWeight="bold">Σ</text>
                      <text x="675" y="178" fill="#94A3B8" fontSize="10" textAnchor="middle">加权求和</text>
                      
                      <line x1="700" y1="140" x2="730" y2="140" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" />
                      <rect x="730" y="110" width="90" height="60" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="775" y="145" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">W_o 投影</text>
                      
                      {/* Particles */}
                      <circle r="4" fill="#fbbf24"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 125 140 L 245 140 C 265 140, 265 60, 290 60 L 420 60 C 440 60, 440 90, 460 90 L 620 90 C 640 90, 640 140, 660 140" /></circle>
                      <circle r="4" fill="#10b981"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 125 140 L 245 140 C 265 140, 265 200, 460 200 L 620 200 C 640 200, 640 140, 660 140" /></circle>
                    </g>
                  ) : (
                    <g>
                      <path d="M 245 140 L 300 140" fill="none" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" className="moe-flow" />
                      <rect x="300" y="90" width="180" height="100" rx="8" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="390" y="130" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Dense SwiGLU</text>
                      <text x="390" y="150" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace">SiLU(xW_gate) ⊙ xW_up</text>
                      <text x="390" y="170" fill="#64748B" fontSize="10" textAnchor="middle">中间维度: 17,408</text>
                      
                      <line x1="480" y1="140" x2="540" y2="140" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#moe-arrow-active)" />
                      <rect x="540" y="110" width="100" height="60" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="590" y="145" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">W_down 投影</text>
                      <circle r="4" fill="#fbbf24"><animateMotion dur="2s" repeatCount="indefinite" path="M 125 140 L 245 140 L 300 140 L 480 140 L 540 140" /></circle>
                    </g>
                  )}
                </svg>
              </div>

              {model.isMoe && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                    专家池监控 (模拟展示):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.from({ length: 20 }, (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMoeActiveExpert(idx)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '4px',
                          border: moeActiveExpert === idx ? '2px solid #FFF' : idx < 10 ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.06)',
                          background: idx < 10 ? 'rgba(251,191,36,0.25)' : '#0e1421',
                          color: idx < 10 ? '#fbbf24' : '#64748B',
                          fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer'
                        }}
                      >E{idx + 1}</button>
                    ))}
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold', fontSize: '0.75rem' }}>S</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIMULATOR: RESIDUAL */}
          {selectedOperatorNode === 'residual' && (
            <div style={{ background: '#070913', padding: '16px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: '#10b981', fontSize: '1rem' }}>
                  🛰️ {model.id === 'flash' ? '4-Way Gated Residual 门控融合拓扑' : '标准 Pre-LN 残差跳跃连接'}
                </strong>
              </div>

              {model.id === 'flash' ? (
                <>
                  <div style={{ background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', marginBottom: '14px' }}>
                    <svg viewBox="0 0 880 260" width="100%" style={{ display: 'block', overflow: 'visible' }}>
                      <defs>
                        <marker id="res-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                        </marker>
                      </defs>
                      
                      <rect x="15" y="100" width="90" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      <text x="60" y="135" fill="#FFF" fontSize="13" textAnchor="middle" fontWeight="bold">Input x_in</text>
                      
                      {/* 4 branches */}
                      {[
                        { y: 30, c: '#94A3B8', t: '直连流 x_in', g: residualGates[0] },
                        { y: 90, c: '#67e8f9', t: 'GDN 线性流', g: residualGates[1] },
                        { y: 150, c: '#c4b5fd', t: 'QSA 稀疏流', g: residualGates[2] },
                        { y: 210, c: '#fbbf24', t: 'N-gram 投机流', g: residualGates[3] },
                      ].map((branch, i) => (
                        <g key={i}>
                          <path d={`M 105 130 C 130 130, 130 ${branch.y+20}, 180 ${branch.y+20}`} fill="none" stroke={branch.c} strokeWidth={1 + branch.g * 3} opacity={0.4 + branch.g * 0.6} />
                          <rect x="180" y={branch.y} width="160" height="40" rx="6" fill={`${branch.c}15`} stroke={branch.c} strokeWidth="1.5" />
                          <text x="260" y={branch.y+25} fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">{branch.t}</text>
                          
                          <path d={`M 340 ${branch.y+20} L 400 ${branch.y+20}`} fill="none" stroke={branch.c} strokeWidth={1 + branch.g * 3} opacity={0.4 + branch.g * 0.6} />
                          
                          <circle cx="430" cy={branch.y+20} r="25" fill="#0F172A" stroke={branch.c} strokeWidth="1.5" />
                          <text x="430" y={branch.y+25} fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">× g_{i+1}</text>
                          
                          <path d={`M 455 ${branch.y+20} C 500 ${branch.y+20}, 500 130, 560 130`} fill="none" stroke={branch.c} strokeWidth={1 + branch.g * 3} opacity={0.4 + branch.g * 0.6} markerEnd="url(#res-arrow)" />
                        </g>
                      ))}

                      {/* Adder */}
                      <circle cx="585" cy="130" r="30" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
                      <text x="585" y="138" fill="#FFF" fontSize="24" textAnchor="middle" fontWeight="bold">+</text>

                      <line x1="615" y1="130" x2="675" y2="130" stroke="#10b981" strokeWidth="2" markerEnd="url(#res-arrow)" />
                      <rect x="675" y="100" width="110" height="60" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
                      <text x="730" y="135" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Output x_out</text>
                    </svg>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {['直连流 x_in', 'GDN 线性流', 'QSA 稀疏流', 'MoE/N-gram 流'].map((name, idx) => (
                      <div key={name} style={{ background: '#0e1421', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${['#94A3B8','#67e8f9','#c4b5fd','#fbbf24'][idx]}40` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#FFF' }}>
                          <span>{name}</span>
                          <span style={{ color: ['#94A3B8','#67e8f9','#c4b5fd','#fbbf24'][idx], fontFamily: 'monospace', fontWeight: 'bold' }}>g_{idx+1} = {residualGates[idx].toFixed(2)}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={residualGates[idx]} onChange={(e) => { const newG = [...residualGates]; newG[idx] = Number(e.target.value); setResidualGates(newG); }} style={{ width: '100%', marginTop: '6px' }} />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '12px 0 0 0', lineHeight: '1.4' }}>
                    <b>设计目的：</b>Flash-Next 的多流架构通过软门控机制动态决定当前层应该相信局部线性记忆 (GDN)、全局检索 (QSA) 还是经验投机 (N-gram)。
                  </p>
                </>
              ) : (
                <div style={{ background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '16px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#CBD5E1', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    经典 Pre-LN 双残差跳跃连接保证了深达 {model.layers} 层的梯度能够无损反向传播。每一层的子模块（Attention/GDN 和 FFN）通过恒等映射进行旁路连接。
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#10b981', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    h_mid = h_l + Sublayer_Seq(RMSNorm(h_l))<br/>
                    h_(l+1) = h_mid + Sublayer_FFN(RMSNorm(h_mid))
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mathematical Formulations */}
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold', marginBottom: '6px' }}>
              [ 核心数学公式与数据流计算 ]:
            </div>
            <MathRenderer
              formula={
                !isCurrentLayerAttention
                  ? `// Layer ${currentLayerNum} GDN Delta 递归更新与门控输出
δ_t = v_t - S_(t-1)ᵀ k_t              // 预测残差向量
S_t = S_(t-1) · Diag(α_t) + β_t · k_t · δ_tᵀ   // 状态矩阵更新 (O(1) 显存)
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ RMSNorm(S_tᵀ q_t)]`
                  : model.cycleAttention === 'QSA'
                  ? `// Layer ${currentLayerNum} QSA 稀疏微块注意力
score_b = Indexer(q_t, K_block_b),   B_sel = TopK({score_b}, K=512)
Attn = Softmax((q_t · K[B_sel]ᵀ) / √d_k) · V[B_sel]
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ Attn]`
                  : `// Layer ${currentLayerNum} GQA 4:1 全局注意力锚点计算
Attn = Softmax((RoPE(W_q x'_t) · RoPE(W_k x'_t)ᵀ) / √d_k + Mask) · (W_v x'_t)
y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ Attn]`
              }
              color={model.accent}
            />
          </div>

          {/* Exact Tensor Dimensions Table */}
          <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px' }}>
              [ 精确张量维度与硬件规格 (当前模型: {model.name}) ]:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 200px', gap: '8px 16px', fontSize: '0.88rem', background: '#0e1421', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>变量</div>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>物理作用</div>
              <div style={{ fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>精确张量形状</div>
              
              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>主干隐藏维度 d</div>
              <div style={{ color: '#CBD5E1' }}>层间传递的残差向量维度</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>d = {model.hidden}</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>GDN 状态 S_t</div>
              <div style={{ color: '#CBD5E1' }}>O(1) 紧凑历史状态矩阵 (75% 的层)</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>[H_heads, d_k=128, d_v=128]</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>{model.cycleAttention}</div>
              <div style={{ color: '#CBD5E1' }}>全局注意力锚点 (25% 的层)</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{model.blockAttention}</div>

              <div style={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 'bold' }}>通道前馈 / MoE</div>
              <div style={{ color: '#CBD5E1' }}>非线性特征变换容量</div>
              <div style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{model.feedForward}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
