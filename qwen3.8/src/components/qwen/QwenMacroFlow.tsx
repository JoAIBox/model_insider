import React, { useState } from 'react';
import { type ModelProfile } from './QwenTopology';

interface QwenMacroFlowProps {
  model: ModelProfile;
  onNavigateTab?: (tab: string) => void;
}

const stepTabMapping: Record<string, string> = {
  step1: 'architecture',
  step2: 'op_gdn',
  step3: 'op_moe',
  step4: 'op_gated_res',
  step5: 'op_unembed',
};

export const QwenMacroFlow: React.FC<QwenMacroFlowProps> = ({ model, onNavigateTab }) => {
  const [selectedStep, setSelectedStep] = useState<string>('step2');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const steps = [
    {
      id: 'step1',
      number: '01',
      title: '多模态输入与嵌入对齐',
      subtitle: 'Input & Alignment',
      badge: 'Layer 0',
      color: '#67e8f9',
      summary: '离散 Token 与视觉 Patch 被映射为统一维度的连续向量流。',
      details: '通过 151,936 超大词表的 BPE 分词器对文本进行 Embedding 查找；若为多模态输入，图像经过视觉编码器与 2×2 Pixel Shuffle 空间降采样后，由轻量 MLP 投影至相同的骨干隐藏维度。',
      params: '151,936 词表 · 图像 Patch 14×14',
      dataFlow: '输入 (文本/图像) → 分词/ViT → 投影映射 → 统一向量序列 X ∈ ℝ^(T × d)',
      operators: [
        { name: 'BPE Tokenizer', desc: '支持 119 种语言的高压缩率分词' },
        { name: 'Embedding Lookup', desc: `将 Token ID 映射为 d = ${model.hidden} 稠密向量` },
        { name: 'Pixel Shuffle & Proj', desc: '将视觉特征无缝拼接进语言 Token 序列' }
      ]
    },
    {
      id: 'step2',
      number: '02',
      title: '3:1 混合注意力骨干',
      subtitle: 'Hybrid Attention Backbone',
      badge: '核心创新',
      color: '#c4b5fd',
      summary: `3 层 GDN (O(1) 线性注意力) + 1 层 ${model.cycleAttention} (全局锚点) 循环堆叠。`,
      details: `全模型由 ${model.cycleCount} 个周期循环组成。GDN 通过 Delta 规则在长序列上维持 O(1) 解码显存；每 4 层的 ${model.cycleAttention} 充当全局检索锚点，提供精确的跨上下文注意力和事实回溯能力。`,
      params: `${model.layers} 层骨干 · ${model.cycleCount} 个 4 层周期`,
      dataFlow: `h_l → Pre-RMSNorm → 3×GDN (递归状态 S_t) → 1×${model.cycleAttention} → 输出门控 ⊙ → h_mid`,
      operators: [
        { name: 'Gated DeltaNet (75%)', desc: 'Delta Rule 选择性递归更新，解码显存 O(1)' },
        { name: `${model.cycleAttention} (25%)`, desc: model.cycleAttention === 'QSA' ? 'Indexer 扫描 Top-512 微块，亚二次方长文本检索' : 'GQA 4:1 全局精确上下文注意力检索' },
        { name: 'Output Gating', desc: '通道级动态自适应门控 σ(W_g · x)' }
      ]
    },
    {
      id: 'step3',
      number: '03',
      title: '通道混合与知识抽取',
      subtitle: 'Feed-Forward / MoE',
      badge: model.isMoe ? 'Sparse MoE' : 'Dense SwiGLU',
      color: '#fbbf24',
      summary: model.isMoe ? '512 个专家中路由激活 10 个专家 + 1 个共享专家。' : 'Dense SwiGLU 前馈网络进行全连接非线性特征变换。',
      details: model.isMoe
        ? `知识容量大幅扩展至 ${model.parameters.backbone}，但单 Token 仅激活 ${model.parameters.active}。Router 通过 Sigmoid 打分分发 Token，共享专家负责通用常识，路由专家专攻细分领域知识。`
        : `采用标准的 Dense SwiGLU 结构，中间隐藏层扩展至 ${model.feedForward}，为多任务推理提供充沛的非线性映射容量。`,
      params: model.isMoe ? '512 总专家 · 10 路由 + 1 共享' : '中间维度 17,408 (3.4×d)',
      dataFlow: model.isMoe
        ? 'h_mid → Pre-RMSNorm → Router 打分 → Top-10 专家并行计算 + 共享专家 → 加权聚合'
        : 'h_mid → Pre-RMSNorm → (SiLU(xW_gate) ⊙ xW_up) · W_down → y_channel',
      operators: [
        { name: model.isMoe ? 'Router 负载均衡' : 'SwiGLU 门控激活', desc: model.isMoe ? '无辅助损失动态打分与分发' : 'SiLU 激活非线性通道变换' },
        { name: model.isMoe ? 'Shared Expert' : 'Up-projection', desc: model.isMoe ? '100% 激活常驻通用知识' : '升维至宽隐藏空间' },
        { name: model.isMoe ? 'Routed Experts' : 'Down-projection', desc: model.isMoe ? '10 个专属领域专家计算' : '降维回主干维度 d' }
      ]
    },
    {
      id: 'step4',
      number: '04',
      title: '残差融合与跨层连接',
      subtitle: 'Residual Stream',
      badge: model.id === 'flash' ? '4-Way Gated' : 'Pre-LN Residual',
      color: '#10b981',
      summary: model.id === 'flash' ? '四路门控残差将输入、GDN、QSA、FFN 动态加权融合。' : '双子层 Pre-LN 恒等残差流无损传递深度信息。',
      details: model.id === 'flash'
        ? 'Flash-Next 创新引入 4-Way Gated Residual，各子层输出经由 Rank 320 瓶颈网络学习门控权重，智能平衡不同算子的信息流。'
        : '经典的 Pre-LayerNorm 残差连接，保证了信息流直接贯穿所有层级，有效抑制极深网络的梯度弥散。',
      params: model.id === 'flash' ? '4 路可学习门控 · Rank 320 瓶颈' : '恒等跳跃连接 · RMSNorm 预归一化',
      dataFlow: model.id === 'flash'
        ? 'h_(l+1) = g_1 · h_in + g_2 · y_gdn + g_3 · y_qsa + g_4 · y_ffn'
        : 'h_(l+1) = h_l + Sublayer_Seq(RMSNorm(h_l)) + Sublayer_FFN(RMSNorm(h_mid))',
      operators: [
        { name: 'Identity Stream', desc: '主干特征恒等传递' },
        { name: 'Bottleneck Projection', desc: model.id === 'flash' ? 'Rank 320 门控系数生成' : 'RMSNorm 尺度控制' },
        { name: 'State Carry', desc: '传递至下一层 h_(l+1)' }
      ]
    },
    {
      id: 'step5',
      number: '05',
      title: '输出预测与多 Token 生成',
      subtitle: 'LM Head & MTP',
      badge: model.mtp ? 'MTP 多位置预测' : 'Next-Token Head',
      color: '#f472b6',
      summary: '最终表示投影至 151,936 词表分布，MTP 模块加速训练与投机解码。',
      details: `最终层经过 Final RMSNorm 后由 LM Head 输出词表 Logits。多 Token 预测 (MTP) 在训练期同时监督未来多个位置的预测，强化模型的前瞻规划能力；在推理期可作为投机解码验证分支。`,
      params: '151,936 词表维度 · MTP 训练辅助',
      dataFlow: 'h_final → Final RMSNorm → LM Head (W_unembed) → Softmax → 下一个 Token 采样',
      operators: [
        { name: 'Final RMSNorm', desc: '输出前全局尺度校准' },
        { name: 'LM Head', desc: `[d = ${model.hidden} → 151,936] 词表 Logits 生成` },
        { name: 'MTP 投机层', desc: '未来 Token 辅助预测与解码加速' }
      ]
    }
  ];

  const current = steps.find((s) => s.id === selectedStep) || steps[1];

  return (
    <div className="card" style={{ background: '#0e1421', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <div>
          <span style={{ color: model.accent, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            宏观数据流 · 5-STEP TOKEN LIFECYCLE
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFF', margin: '4px 0 0 0' }}>
            单个 Token 从输入到生成的全生命周期
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ padding: '6px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {isExpanded ? '▼ 收起步骤详情' : '▶ 展开步骤详情'}
        </button>
      </div>

      {/* Animated SVG Data Flow Diagram */}
      <div style={{ background: '#070a12', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
        <svg width="100%" height="auto" viewBox="0 0 960 100" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxWidth: '100%' }}>
          <defs>
            <marker id="macro-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
            <style>{`
              @keyframes macro-dash { to { stroke-dashoffset: -20; } }
              @keyframes macro-particle { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
              .macro-flow-line { stroke-dasharray: 5 4; animation: macro-dash 1.2s linear infinite; }
            `}</style>
          </defs>
          {/* Flow arrows between nodes */}
          <line x1="170" y1="50" x2="200" y2="50" stroke="#475569" strokeWidth="1.5" markerEnd="url(#macro-arrow)" className="macro-flow-line" />
          <line x1="370" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="1.5" markerEnd="url(#macro-arrow)" className="macro-flow-line" />
          <line x1="590" y1="50" x2="620" y2="50" stroke="#475569" strokeWidth="1.5" markerEnd="url(#macro-arrow)" className="macro-flow-line" />
          <line x1="790" y1="50" x2="820" y2="50" stroke="#475569" strokeWidth="1.5" markerEnd="url(#macro-arrow)" className="macro-flow-line" />
          {/* Residual skip connection curve */}
          <path d="M 85 20 C 85 5, 870 5, 870 20" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x="480" y="13" fill="#10b981" fontSize="9" textAnchor="middle" opacity="0.7">残差恒等流 (Residual Stream)</text>
          {/* Node boxes */}
          {[{x:10,w:160,c:'#67e8f9',t:'01 输入与嵌入',s:'step1'},{x:200,w:170,c:'#c4b5fd',t:'02 3:1 混合骨干',s:'step2'},{x:400,w:190,c:'#fbbf24',t:'03 通道混合/MoE',s:'step3'},{x:620,w:170,c:'#10b981',t:'04 残差融合',s:'step4'},{x:820,w:130,c:'#f472b6',t:'05 LM Head/MTP',s:'step5'}].map((n) => {
            const isActive = selectedStep === n.s || hoveredStep === n.s;
            return (
              <g key={n.s} style={{ cursor: 'pointer' }} onClick={() => { setSelectedStep(n.s); setIsExpanded(true); }} onMouseEnter={() => setHoveredStep(n.s)} onMouseLeave={() => setHoveredStep(null)}>
                <rect x={n.x} y="22" width={n.w} height="56" rx="6" fill={isActive ? `${n.c}20` : '#0e1421'} stroke={isActive ? n.c : `${n.c}40`} strokeWidth={isActive ? 2 : 1} />
                <text x={n.x + n.w/2} y="48" fill={isActive ? '#FFF' : '#CBD5E1'} fontSize="12" fontWeight="bold" textAnchor="middle">{n.t}</text>
                <text x={n.x + n.w/2} y="66" fill={n.c} fontSize="9.5" textAnchor="middle" fontFamily="monospace">{n.s === 'step2' ? `${model.layers}L · ${model.cycleCount}C` : n.s === 'step3' ? (model.isMoe ? '512E · 10+1' : 'SwiGLU') : n.s === 'step1' ? '151,936 词表' : n.s === 'step4' ? (model.id === 'flash' ? '4-Way Gate' : 'Pre-LN') : 'MTP 投机'}</text>
              </g>
            );
          })}
          {/* Moving particle along the main flow */}
          <circle r="4" fill="#67e8f9" style={{ filter: 'drop-shadow(0 0 6px #67e8f9)' }}>
            <animateMotion dur="4s" repeatCount="indefinite" path="M 85 50 L 200 50 L 400 50 L 620 50 L 820 50 L 885 50" />
          </circle>
        </svg>
      </div>

      {/* 5-Step Horizontal Flow Track */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: isExpanded ? '20px' : '0' }}>
        {steps.map((step) => {
          const isSelected = step.id === selectedStep;
          const isHovered = hoveredStep === step.id;
          return (
            <div
              key={step.id}
              onClick={() => { setSelectedStep(step.id); setIsExpanded(true); }}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                background: isSelected || isHovered ? `${step.color}15` : '#070a12',
                border: isSelected ? `2px solid ${step.color}` : isHovered ? `1px solid ${step.color}80` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: step.color, fontFamily: 'monospace' }}>
                  STEP {step.number}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: `${step.color}25`, color: step.color, fontWeight: 'bold' }}>
                  {step.badge}
                </span>
              </div>
              <strong style={{ fontSize: '0.95rem', color: isSelected ? '#FFF' : '#CBD5E1' }}>
                {step.title}
              </strong>
              <small style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.3' }}>
                {step.summary}
              </small>
            </div>
          );
        })}
      </div>

      {/* Selected Step Detail Panel (Expanded Inline on the Current Page) */}
      {isExpanded && (
        <div style={{ background: '#070a12', border: `1px solid ${current.color}40`, borderRadius: '12px', padding: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <span style={{ color: current.color, fontSize: '0.85rem', fontWeight: 'bold' }}>
                STEP {current.number} · {current.subtitle}
              </span>
              <h4 style={{ fontSize: '1.25rem', color: '#FFF', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                {current.title}
              </h4>
            </div>
            <span style={{ fontFamily: 'monospace', color: current.color, fontSize: '0.85rem', background: `${current.color}15`, padding: '4px 10px', borderRadius: '4px' }}>
              {current.params}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '16px' }}>
            {current.details}
          </p>

          {/* Data flow path representation */}
          <div style={{ background: '#0e1421', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' }}>
              阶段内数据流转链路:
            </span>
            <div style={{ fontFamily: 'monospace', color: current.color, fontSize: '0.92rem', marginTop: '4px' }}>
              {current.dataFlow}
            </div>
          </div>

          {/* Included operators cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {current.operators.map((op) => (
              <div key={op.name} style={{ background: '#0e1421', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <strong style={{ color: '#FFF', fontSize: '0.9rem' }}>{op.name}</strong>
                <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  {op.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Deep Dive Navigation Button */}
          {onNavigateTab && stepTabMapping[current.id] && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => onNavigateTab(stepTabMapping[current.id])}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${current.color}60`,
                  background: `${current.color}15`,
                  color: current.color,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                打开算子深度解析 →
              </button>
              <button
                onClick={() => onNavigateTab('architecture')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(196, 181, 253, 0.4)',
                  background: 'rgba(196, 181, 253, 0.08)',
                  color: '#c4b5fd',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                查看层级拓扑 →
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
