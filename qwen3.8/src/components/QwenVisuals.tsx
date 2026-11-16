import React, { useEffect, useState, type ReactNode } from 'react';
import { MathView } from './MathView';

export type QwenVisualModel = {
  id: '27b' | 'a95b' | 'flash';
  name: string;
  cycleAttention: 'Gated Attention' | 'QSA';
  isMoe: boolean;
  layers: number;
  cycleCount: number;
  feedForward: string;
  hidden: string;
  modality: string;
};

const Arrow = ({ id, color = '#67e8f9' }: { id: string; color?: string }) => (
  <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 1 L 9 5 L 0 9 z" fill={color} />
  </marker>
);

const SvgNode = ({ x, y, width, title, detail, color = '#67e8f9', active = false }: { x: number; y: number; width: number; title: string; detail?: string; color?: string; active?: boolean }) => (
  <g className={active ? 'qwen-svg-node active' : 'qwen-svg-node'}>
    <rect x={x} y={y} width={width} height="70" rx="9" fill={active ? `${color}30` : '#0e1421'} stroke={active ? color : `${color}66`} strokeWidth={active ? 2.5 : 1.4} />
    <text x={x + width / 2} y={y + 30} textAnchor="middle" fill={active ? '#ffffff' : '#f1f5f9'} fontSize="14.5" fontWeight="700">{title}</text>
    {detail && <text x={x + width / 2} y={y + 52} textAnchor="middle" fill={color} fontSize="12" fontWeight="600" fontFamily="monospace">{detail}</text>}
  </g>
);

const FlowArrow = ({ x1, y1, x2, y2, color = '#67e8f9', marker = 'qwen-arrow' }: { x1: number; y1: number; x2: number; y2: number; color?: string; marker?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray="7 5" markerEnd={`url(#${marker})`} className="qwen-svg-flow" />
);

/* ================= HARDCORE MODEL ARCHITECTURE VISUAL (MODEL SIGNATURE) ================= */

export type ArchNode = {
  id: string;
  name: string;
  subType: string;
  category: 'embedding' | 'gdn' | 'attn' | 'ffn' | 'head';
  formula: string;
  tensorShape: string;
  detail: string;
  color: string;
};

export function ModelSignatureVisual({ model }: { model: QwenVisualModel; parameterLine?: string; activeLine?: string }) {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(0); // 0-indexed block cycle
  const [selectedNodeId, setSelectedNodeId] = useState<string>('gdn-1');
  const [hoveredNode, setHoveredNode] = useState<ArchNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isFlash = model.id === 'flash';
  const isA95B = model.id === 'a95b';

  const accentColor = isFlash ? '#fbbf24' : isA95B ? '#c4b5fd' : '#67e8f9';

  // Calculate actual global layer numbers for current selected Block
  const baseLayer = selectedBlockIndex * 4;
  const l1Num = baseLayer + 1;
  const l2Num = baseLayer + 2;
  const l3Num = baseLayer + 3;
  const l4Num = baseLayer + 4;

  // Reset selected block index when switching models if out of bounds
  useEffect(() => {
    if (selectedBlockIndex >= model.cycleCount) {
      setSelectedBlockIndex(0);
    }
  }, [model.id, model.cycleCount, selectedBlockIndex]);

  // Define nodes for this specific model's architecture
  const nodes: ArchNode[] = [
    {
      id: 'emb',
      name: isFlash ? 'N-gram + Base Embedding' : 'Token & Vision Embedding',
      subType: isFlash ? '20M Entries + 151.9K Vocab' : '151.9K Vocab Matrix',
      category: 'embedding',
      formula: 'x_t = W_{emb}[id_t] + NgramLookup(id_t)',
      tensorShape: `[B, T, D=${model.hidden}]`,
      detail: isFlash
        ? '包含了 2000 万个 Bigram/Trigram 词对组合嵌入表与 151,936 基础词表，通过快速索引直接在最底层补充多词语义。'
        : '将文本 Token ID 与 14×14 Vision Patch 特征映射为统一的 5,120 维连续特征向量流。',
      color: '#67e8f9',
    },
    {
      id: 'gdn-1',
      name: `Layer ${l1Num}: GDN (Gated DeltaNet)`,
      subType: 'Recurrent State Memory',
      category: 'gdn',
      formula: 'S_t = \\alpha_t \\odot S_{t-1} + \\beta_t (v_t - S_{t-1}k_t) k_t^T, \\quad y_t = S_t q_t',
      tensorShape: `S \\in \\mathbb{R}^{d_k \\times d_v}, \\quad [B, T, D=${model.hidden}]`,
      detail: `Block #${selectedBlockIndex + 1} 第 1 层（全局第 ${l1Num} 层）：基于数据依赖的 Sigmoid 门控衰减 rate 与 Delta 规则，更新 O(1) 恒定内存状态矩阵 S_t，不占用显存 KV Cache。`,
      color: '#67e8f9',
    },
    {
      id: 'gdn-2',
      name: `Layer ${l2Num}: GDN (Gated DeltaNet)`,
      subType: 'Recurrent State Memory',
      category: 'gdn',
      formula: 'S_t = \\alpha_t \\odot S_{t-1} + \\beta_t (v_t - S_{t-1}k_t) k_t^T',
      tensorShape: `[B, T, D=${model.hidden}]`,
      detail: `Block #${selectedBlockIndex + 1} 第 2 层（全局第 ${l2Num} 层）：深化局部与中程语义记忆状态的连续演化。`,
      color: '#67e8f9',
    },
    {
      id: 'gdn-3',
      name: `Layer ${l3Num}: GDN (Gated DeltaNet)`,
      subType: 'Recurrent State Memory',
      category: 'gdn',
      formula: 'S_t = \\alpha_t \\odot S_{t-1} + \\beta_t (v_t - S_{t-1}k_t) k_t^T',
      tensorShape: `[B, T, D=${model.hidden}]`,
      detail: `Block #${selectedBlockIndex + 1} 第 3 层（全局第 ${l3Num} 层）：积累 3 层 GDN 的局部上下文，准备进入第 4 层全局注意力锚点。`,
      color: '#67e8f9',
    },
    {
      id: 'attn-4',
      name: `Layer ${l4Num}: ${model.cycleAttention}`,
      subType: isFlash ? 'QSA Block-Sparse Indexing' : 'Global Anchor Attention',
      category: 'attn',
      formula: isFlash
        ? 'B_{sel} = \\text{TopK}(f_{index}(Q, K_{block})), \\quad \\text{Attn}(Q, K_{B_{sel}}, V_{B_{sel}})'
        : '\\text{Attn} = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V, \\quad y = W_o(\\sigma(W_g x) \\odot \\text{Attn})',
      tensorShape: `[B, T, H=${model.id === '27b' ? 24 : model.id === 'a95b' ? 64 : 24}, d_k=256]`,
      detail: isFlash
        ? `Block #${selectedBlockIndex + 1} 第 4 层（全局第 ${l4Num} 层）：Indexer 以 512 Block 为单位扫描匹配，挑选 Top-K 块计算注意力，复杂度从 O(N²) 降低至 O(N·B)。`
        : `Block #${selectedBlockIndex + 1} 第 4 层（全局第 ${l4Num} 层）：全局注意力锚点，精准扫描所有历史 KV Cache 补全长距离逻辑依赖。`,
      color: '#c4b5fd',
    },
    {
      id: 'ffn',
      name: model.isMoe ? 'MoE 专家层 (512 Experts)' : 'Dense FFN (SwiGLU)',
      subType: model.isMoe ? '10 Routed + 1 Shared Expert' : 'Intermediate Dim = 17,408',
      category: 'ffn',
      formula: model.isMoe
        ? 'y = \\text{SharedExp}(h) + \\sum_{i \\in \\text{Top10}} G(h)_i \\cdot \\text{Expert}_i(h)'
        : 'y = \\left(x W_g \\cdot \\text{sigmoid}(x W_g)\\right) \\odot (x W_u) \\cdot W_d',
      tensorShape: model.isMoe ? `[B, T, ${model.hidden}] → [B, T, 512 × 2048]` : `[B, T, 17408] → [B, T, ${model.hidden}]`,
      detail: model.isMoe
        ? '每层经过序列算子后执行：每个 Token 由 Router 分发给 512 个专家中得分最高的前 10 个专家，同时叠加 1 个全时在线的共享专家。'
        : '每层经过序列算子后执行：全量 Dense SwiGLU 升维与降维通道特征变换。',
      color: '#fbbf24',
    },
    {
      id: 'head',
      name: 'Unembed LM Head & Logits',
      subType: '151.9K Vocab Softmax',
      category: 'head',
      formula: 'P(w_{t+1}) = \\text{Softmax}(W_{lm} \\cdot \\text{RMSNorm}(h_L))',
      tensorShape: '[B, T, 151936]',
      detail: `穿越 ${model.layers} 层骨干网（${model.cycleCount} 个周期 Block 循环）后，最终末位向量通过 LM Head 映射为 151,936 词表概率，采样预测下一个 Token。`,
      color: '#fbbf24',
    },
  ];

  const currentNode = nodes.find((n) => n.id === selectedNodeId) || nodes[1];

  const handleMouseEnter = (node: ArchNode, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredNode(node);
    setHoverPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#0a0f1d',
        border: `1px solid ${accentColor}35`,
        borderRadius: '14px',
        padding: '20px',
        boxSizing: 'border-box',
        color: '#e2e8f0',
        fontFamily: 'Manrope, sans-serif',
        position: 'relative',
        marginBottom: '24px',
      }}
    >
      {/* 头部标题与模型参数标识 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>
            OFFICIAL NEURAL ARCHITECTURE PIPELINE
          </div>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{model.name} 全网 {model.layers} 层微观解剖图解</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
              全网总计 {model.layers} 层 · {model.cycleCount} 个 4 层 Block 串联
            </span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
          <div>骨干总参数: <strong style={{ color: '#fff' }}>{model.id === '27b' ? '27B' : model.id === 'a95b' ? '2.4T' : '125B'}</strong></div>
          <div>激活参数/Token: <strong style={{ color: accentColor }}>{model.id === '27b' ? '27B / token' : model.id === 'a95b' ? '95B / token' : '6B / token'}</strong></div>
          <div>隐藏层维度 d: <strong style={{ color: '#fff' }}>{model.hidden}</strong></div>
        </div>
      </div>

      {/* 神经网络全景拓扑图 (全网 Block 视角 + 下钻微观电路图) */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#070a12', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 12px', marginBottom: '16px' }}>
        {/* 宏观视角标题 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', fontFamily: 'monospace' }}>
            🌐 全网 {model.layers} 层宏观拓扑流 (点击任意 Block 图形节点即可选择下钻):
          </span>
          <span style={{ fontSize: '13px', color: accentColor, fontFamily: 'monospace' }}>
            当前下钻: <strong>Block #{selectedBlockIndex + 1} (Layer {l1Num} ~ Layer {l4Num})</strong>
          </span>
        </div>

        {/* 全网 Block 宏观矢量流 SVG (全图形化展现，非纯文本) */}
        <svg viewBox={`0 0 ${Math.max(1150, model.cycleCount * 78 + 200)} 110`} width="100%" height="110" style={{ display: 'block' }}>
          <defs>
            <marker id="macro-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* 全网残差长河绿色背景高亮通道 (Global Residual Stream Highway) */}
          {(() => {
            const totalW = 105 + model.cycleCount * 78 + 80;
            return (
              <g>
                <path d={`M 50 49 L ${totalW - 40} 49`} stroke="#10b981" strokeWidth="4" opacity="0.3" strokeDasharray="8 4" />
                <text x={totalW / 2} y="98" fill="#10b981" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  🟢 贯穿全网 64 层的全量残差长河 (Global Continuous Residual Highway): h_0 → h_1 → ... → h_64
                </text>
              </g>
            );
          })()}

          {/* 输入 Embedding 节点 */}
          <g style={{ cursor: 'pointer' }} onClick={() => setSelectedNodeId('emb')}>
            <rect x="10" y="20" width="80" height="58" rx="6" fill="#0e1421" stroke="#67e8f9" strokeWidth="1.2" />
            <text x="50" y="44" fill="#67e8f9" fontSize="11" fontWeight="bold" textAnchor="middle">Embedding</text>
            <text x="50" y="60" fill="#94a3b8" fontSize="9" textAnchor="middle">d={model.hidden}</text>
          </g>

          <line x1="90" y1="49" x2="105" y2="49" stroke="#10b981" strokeWidth="2.2" markerEnd="url(#macro-arrow)" />

          {/* 所有 Block 图形节点 (Block 1 至 Block N) */}
          {Array.from({ length: model.cycleCount }, (_, idx) => {
            const isSelected = selectedBlockIndex === idx;
            const x = 105 + idx * 78;
            const startL = idx * 4 + 1;
            const endL = idx * 4 + 4;
            return (
              <g key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedBlockIndex(idx)}>
                {/* Block 外框卡片 */}
                <rect x={x} y="15" width="68" height="68" rx="7"
                  fill={isSelected ? `${accentColor}35` : '#0e1421'}
                  stroke={isSelected ? accentColor : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isSelected ? 2.5 : 1} />

                {/* Block 内部 4 层颜色点柱标示 */}
                <rect x={x + 6} y="22" width="11" height="22" rx="2" fill="#67e8f9" opacity={isSelected ? 1 : 0.65} />
                <rect x={x + 20} y="22" width="11" height="22" rx="2" fill="#67e8f9" opacity={isSelected ? 1 : 0.65} />
                <rect x={x + 34} y="22" width="11" height="22" rx="2" fill="#67e8f9" opacity={isSelected ? 1 : 0.65} />
                <rect x={x + 48} y="22" width="11" height="22" rx="2" fill="#c4b5fd" opacity={isSelected ? 1 : 0.65} />

                <text x={x + 34} y="55" fill={isSelected ? '#ffffff' : '#cbd5e1'} fontSize="10" fontWeight="bold" textAnchor="middle">
                  B#{idx + 1}
                </text>
                <text x={x + 34} y="71" fill={isSelected ? accentColor : '#94a3b8'} fontSize="9" textAnchor="middle">
                  L{startL}-{endL}
                </text>

                {/* 残差长河直接穿透连接下一个 Block 的箭头 */}
                <line x1={x + 68} y1="49" x2={x + 78} y2="49" stroke="#10b981" strokeWidth="2" markerEnd="url(#macro-arrow)" />
              </g>
            );
          })}

          {/* 输出 LM Head 节点 */}
          {(() => {
            const headX = 105 + model.cycleCount * 78;
            return (
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedNodeId('head')}>
                <rect x={headX} y="20" width="80" height="58" rx="6" fill="#0e1421" stroke="#fbbf24" strokeWidth="1.2" />
                <text x={headX + 40} y="44" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">LM Head</text>
                <text x={headX + 40} y="60" fill="#94a3b8" fontSize="9" textAnchor="middle">151.9K Logits</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* 神经网络架构下钻解剖图 (适配宽度的 SVG) */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#070a12', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 8px' }}>
        <svg viewBox="0 0 1150 260" width="100%" height="260" style={{ display: 'block' }}>
          <defs>
            <marker id="arch-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accentColor} />
            </marker>
            <marker id="skip-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* 输入 Embedding */}
          <g style={{ cursor: 'pointer' }}
            onClick={() => setSelectedNodeId('emb')}
            onMouseEnter={(e) => handleMouseEnter(nodes[0], e)}
            onMouseLeave={handleMouseLeave}>
            <rect x="15" y="65" width="130" height="105" rx="8"
              fill={selectedNodeId === 'emb' ? 'rgba(103,232,249,0.25)' : '#0e1421'}
              stroke="#67e8f9" strokeWidth={selectedNodeId === 'emb' ? 2.5 : 1.2} />
            <text x="80" y="90" fill="#67e8f9" fontSize="12" fontWeight="bold" textAnchor="middle">输入嵌入 (Embedding)</text>
            <text x="80" y="110" fill="#cbd5e1" fontSize="10" textAnchor="middle">{isFlash ? 'N-gram + Base' : 'Token + Vision'}</text>
            {/* 维度标注 */}
            <rect x="22" y="123" width="116" height="28" rx="4" fill="#070a12" stroke="rgba(103,232,249,0.4)" />
            <text x="80" y="141" fill="#67e8f9" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              In:[B,T] → Out:[B,T,D]
            </text>
          </g>

          <line x1="145" y1="115" x2="170" y2="115" stroke={accentColor} strokeWidth="2" markerEnd="url(#arch-arrow)" />

          {/* 所选 Block (包含动态 4 层算子) */}
          <rect x="170" y="20" width="795" height="205" rx="12"
            fill="rgba(255,255,255,0.02)" stroke={`${accentColor}55`} strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="185" y="44" fill={accentColor} fontSize="12" fontWeight="bold" fontFamily="monospace">
            当前下钻周期: Block #{selectedBlockIndex + 1} / {model.cycleCount}（包含 Layer {l1Num} ~ Layer {l4Num}）
          </text>

          {/* 周期内部 4 个动态算子层及每个子层的独立残差连接 */}
          {[
            { node: nodes[1], label: 'GDN #1', color: '#67e8f9', x: 180, type: 'gdn-1', layerNum: l1Num },
            { node: nodes[2], label: 'GDN #2', color: '#67e8f9', x: 315, type: 'gdn-2', layerNum: l2Num },
            { node: nodes[3], label: 'GDN #3', color: '#67e8f9', x: 450, type: 'gdn-3', layerNum: l3Num },
            { node: nodes[4], label: model.cycleAttention, color: '#c4b5fd', x: 585, type: 'attn-4', layerNum: l4Num },
          ].map((item, idx) => {
            const isSel = selectedNodeId === item.type;
            const subX = item.x;
            return (
              <g key={idx}>
                {/* 算子层主体卡片 */}
                <g style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNodeId(item.type)}
                  onMouseEnter={(e) => handleMouseEnter(item.node, e)}
                  onMouseLeave={handleMouseLeave}>
                  <rect x={subX} y="62" width="120" height="110" rx="8"
                    fill={isSel ? `${item.color}30` : '#0e1421'}
                    stroke={item.color} strokeWidth={isSel ? 2.5 : 1.2} />
                  <text x={subX + 60} y={85} fill={item.color} fontSize="12" fontWeight="bold" textAnchor="middle">
                    Layer {item.layerNum}
                  </text>
                  <text x={subX + 60} y={105} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {item.label}
                  </text>
                  <text x={subX + 60} y={123} fill="#cbd5e1" fontSize="9.5" textAnchor="middle">
                    {idx < 3 ? 'O(1) 状态矩阵' : (isFlash ? 'QSA 块稀疏' : '全局 KV 锚点')}
                  </text>

                  {/* 维度标注 */}
                  <rect x={subX + 6} y="133" width="108" height="26" rx="4" fill="#070a12" stroke={`${item.color}50`} />
                  <text x={subX + 60} y={150} fill={item.color} fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    [B,T,D] → [B,T,D]
                  </text>
                </g>

                {/* 该子层的独立 Pre-LN 残差跳跃弧线 (SubLayer Skip Arc) */}
                <path d={`M ${subX - 10} 115 C ${subX - 5} 190, ${subX + 125} 190, ${subX + 127} 122`}
                  fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 3" />
                <circle cx={subX + 127} cy="115" r="7" fill="#070a12" stroke="#10b981" strokeWidth="1.8" />
                <text x={subX + 127} y="119" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>

                {/* 连线箭头到下一个节点 */}
                {idx < 3 && (
                  <line x1={subX + 134} y1="115" x2={subX + 135} y2="115" stroke={accentColor} strokeWidth="2" markerEnd="url(#arch-arrow)" />
                )}
              </g>
            );
          })}

          <line x1="719" y1="115" x2="730" y2="115" stroke={accentColor} strokeWidth="2" markerEnd="url(#arch-arrow)" />

          {/* FFN / MoE 层 */}
          <g style={{ cursor: 'pointer' }}
            onClick={() => setSelectedNodeId('ffn')}
            onMouseEnter={(e) => handleMouseEnter(nodes[5], e)}
            onMouseLeave={handleMouseLeave}>
            <rect x="730" y="58" width="215" height="115" rx="10"
              fill={selectedNodeId === 'ffn' ? 'rgba(251,191,36,0.25)' : '#0e1421'}
              stroke="#fbbf24" strokeWidth={selectedNodeId === 'ffn' ? 2.5 : 1.4} />
            <text x="837" y="83" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
              {model.isMoe ? 'MoE 前馈神经网络' : 'Dense SwiGLU FFN'}
            </text>
            <text x="837" y="103" fill="#fff" fontSize="11" textAnchor="middle">
              {model.isMoe ? '512 专家 Pool (10+1 激活)' : '中间通道 17,408'}
            </text>
            <text x="837" y="121" fill="#cbd5e1" fontSize="9.5" textAnchor="middle">
              {model.isMoe ? '通道特征分发与融合' : '每层独立前向通道思考'}
            </text>

            {/* 维度标注 */}
            <rect x="740" y="133" width="195" height="26" rx="4" fill="#070a12" stroke="rgba(251,191,36,0.5)" />
            <text x="837" y="150" fill="#fbbf24" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {model.isMoe ? `In:[B,T,D] → 10×2K → Out:[B,T,D]` : `In:[B,T,D] → [B,T,17.4K] → Out:[B,T,D]`}
            </text>
          </g>

          {/* FFN 子层的 Pre-LN 残差跳跃弧线 */}
          <path d="M 720 115 C 725 190, 945 190, 947 122" fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 3" />
          <circle cx="947" cy="115" r="7" fill="#070a12" stroke="#10b981" strokeWidth="1.8" />
          <text x="947" y="119" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>

          {/* 残差说明底标 */}
          <text x="565" y="214" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {'🟢 绿虚线标示：每个子层 (SubLayer) 均拥有独立的 Pre-LN 残差连接加和节点: h_out = h_in + SubLayer(RMSNorm(h_in))'}
          </text>

          <line x1="954" y1="115" x2="975" y2="115" stroke={accentColor} strokeWidth="2" markerEnd="url(#arch-arrow)" />

          {/* 输出 LM Head */}
          <g style={{ cursor: 'pointer' }}
            onClick={() => setSelectedNodeId('head')}
            onMouseEnter={(e) => handleMouseEnter(nodes[6], e)}
            onMouseLeave={handleMouseLeave}>
            <rect x="980" y="65" width="150" height="105" rx="8"
              fill={selectedNodeId === 'head' ? 'rgba(251,191,36,0.25)' : '#0e1421'}
              stroke="#fbbf24" strokeWidth={selectedNodeId === 'head' ? 2.5 : 1.2} />
            <text x="1055" y="90" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">LM Head</text>
            <text x="1055" y="110" fill="#cbd5e1" fontSize="10" textAnchor="middle">151.9K 词表 Softmax</text>
            {/* 维度标注 */}
            <rect x="988" y="123" width="134" height="28" rx="4" fill="#070a12" stroke="rgba(251,191,36,0.5)" />
            <text x="1055" y="141" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              In:[B,T,D] → Out:[B,T,V=151.9K]
            </text>
          </g>
        </svg>
      </div>

      {/* 📐 维度符号含义全解与参数映射对照卡片 */}
      <div style={{ marginTop: '14px', backgroundColor: '#070a12', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#67e8f9', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📐 张量维度符号含义与模型实际数值对照 (Tensor Dimensions Legend)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '11px', color: '#cbd5e1' }}>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#67e8f9', fontWeight: 'bold', fontFamily: 'monospace' }}>B (Batch Size)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>输入批次大小（推理阶段通常 $B = 1$）。</div>
          </div>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#67e8f9', fontWeight: 'bold', fontFamily: 'monospace' }}>T (Sequence Length)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>输入/生成序列的 Token 数量（长文本最高 1M）。</div>
          </div>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#c4b5fd', fontWeight: 'bold', fontFamily: 'monospace' }}>D (Hidden Dim)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>
              骨干网主干隐藏层维度：<strong>d = {model.hidden}</strong>。
            </div>
          </div>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#67e8f9', fontWeight: 'bold', fontFamily: 'monospace' }}>S ∈ ℝ¹²⁸ˣ¹²⁸ (GDN State)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>GDN 递归记忆矩阵，保持 O(1) 不随 T 增长。</div>
          </div>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontFamily: 'monospace' }}>d_ffn (FFN Intermediate)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>
              {model.isMoe ? 'MoE 专家激活: 10 路由 (2K) + 1 共享 (2K)' : 'SwiGLU 中间升维维度: 17,408'}。
            </div>
          </div>
          <div style={{ backgroundColor: '#0e1421', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontFamily: 'monospace' }}>V (Vocab Size)</span>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>词表 Logits 输出维度：<strong>V = 151,936</strong>。</div>
          </div>
        </div>
      </div>

      {/* 悬浮提示框 (Tooltip) */}
      {hoveredNode && (
        <div
          style={{
            position: 'fixed',
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#0e1421',
            border: `1px solid ${hoveredNode.color}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '280px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: hoveredNode.color, marginBottom: '4px' }}>
            {hoveredNode.name}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '6px' }}>
            {hoveredNode.subType} · <MathView math={hoveredNode.tensorShape} />
          </div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: '1.4' }}>
            点击可在图下方展开完整算子公式与详细解析
          </div>
        </div>
      )}

      {/* 点击层/Block 后图下方展开的详细解释面板 */}
      <div
        style={{
          marginTop: '16px',
          backgroundColor: '#0e1421',
          borderRadius: '10px',
          border: `1px solid ${currentNode.color}40`,
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentNode.color }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>{currentNode.name}</h4>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              {currentNode.subType}
            </span>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
            {currentNode.detail}
          </p>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            💡 提示：在图上方点击任意层块可自由切换查看其算子原理与公式。
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: currentNode.color, marginBottom: '6px', fontFamily: 'monospace' }}>
            🧮 算子核心公式 (Operator Math)
          </div>
          <div style={{ backgroundColor: '#070a12', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#fff', marginBottom: '10px', overflowX: 'auto' }}>
            <MathView math={currentNode.formula} display />
          </div>

          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px', fontFamily: 'monospace' }}>
            📐 张量维度 (Tensor Shapes)
          </div>
          <div style={{ backgroundColor: '#070a12', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#67e8f9', overflowX: 'auto' }}>
            <MathView math={currentNode.tensorShape} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TokenJourneyVisual() {
  return <div className="qwen-visual-frame token-journey-visual" role="region" tabIndex={0} aria-label="Token journey diagram; horizontal scroll available"><div className="visual-kicker">LIVE TOKEN JOURNEY</div><svg viewBox="0 0 980 170" role="img" aria-label="Animated teaching path from the question 2 plus 2 to a selected answer token"><defs><Arrow id="qwen-arrow" /><path id="qwen-token-path" d="M 87 84 H 880" /></defs><path d="M 87 84 H 880" stroke="#263a55" strokeWidth="3" fill="none" /><FlowArrow x1={160} y1={84} x2={205} y2={84} /><FlowArrow x1={360} y1={84} x2={405} y2={84} /><FlowArrow x1={560} y1={84} x2={605} y2={84} /><FlowArrow x1={760} y1={84} x2={805} y2={84} /><SvgNode x={12} y={53} width={148} title="Input" detail="2 + 2 = ?" color="#67e8f9" active /><SvgNode x={205} y={53} width={155} title="Token sequence" detail="2 · + · 2 · = · ?" color="#67e8f9" /><SvgNode x={405} y={53} width={155} title="Hidden representation" detail="continuous vector" color="#c4b5fd" /><SvgNode x={605} y={53} width={155} title="GDN state path" detail="history carried forward" color="#67e8f9" /><SvgNode x={805} y={53} width={160} title="LM Output" detail="logits → answer Token" color="#fbbf24" /><circle className="qwen-moving-token" r="7" fill="#ffffff"><animateMotion dur="8s" repeatCount="indefinite"><mpath href="#qwen-token-path" /></animateMotion></circle></svg><div className="visual-caption"><span><i className="legend-dot cyan" /> The moving dot is a teaching signal, not a runtime tensor.</span><span>Decoder strategy selects the answer Token from candidates.</span></div></div>;
}

export function TokenGenerationFlowVisual({ model }: { model: QwenVisualModel }) {
  const embedding = model.id === 'flash' ? 'N-gram + base embedding' : 'Token embedding';
  const attention = model.cycleAttention === 'QSA' ? 'QSA' : 'Gated Attention';
  const feedForward = model.isMoe ? 'MoE · routed + shared' : 'Dense FFN';
  const color = model.id === 'flash' ? '#fbbf24' : model.id === 'a95b' ? '#c4b5fd' : '#67e8f9';
  return <div className="qwen-token-generation" role="region" tabIndex={0} aria-label={`Complete Token generation flow for ${model.name}; horizontal scroll available`}><div className="qwen-token-generation-heading"><div><span className="visual-kicker">MACRO → MICRO → GENERATION LOOP</span><h3>How one new Token is processed</h3></div><span>{model.name} · teaching view</span></div><svg viewBox="0 0 1240 340" role="img" aria-label={`Complete ${model.name} Token generation flow from prompt to selected next Token`}><defs><Arrow id="qwen-generation-arrow" color={color} /><path id="qwen-generation-path" d="M 72 95 H 1150" /></defs><text x="18" y="24" fill="#71839d" fontSize="10" fontFamily="monospace" letterSpacing="1.4">MACRO DATA PATH · PREFILL OR ONE DECODE STEP</text><path d="M 72 95 H 1150" stroke="#263a55" strokeWidth="3" fill="none" /><FlowArrow x1={160} y1={95} x2={205} y2={95} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={360} y1={95} x2={405} y2={95} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={560} y1={95} x2={605} y2={95} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={760} y1={95} x2={805} y2={95} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={960} y1={95} x2={1005} y2={95} color={color} marker="qwen-generation-arrow" /><SvgNode x={10} y={64} width={150} title="Prompt" detail="text / visual input" color="#67e8f9" active /><SvgNode x={205} y={64} width={155} title="Tokenizer" detail="Token IDs / reps" color="#67e8f9" /><SvgNode x={405} y={64} width={155} title="Hidden input" detail="continuous vector" color="#c4b5fd" /><SvgNode x={605} y={64} width={155} title="Backbone loop" detail={`${model.layers} layers`} color={color} active /><SvgNode x={805} y={64} width={155} title="LM Output" detail="next-token logits" color="#fbbf24" /><SvgNode x={1005} y={64} width={190} title="Decode + append" detail="select Token → repeat" color="#fbbf24" active /><circle className="qwen-moving-token" r="7" fill="#ffffff"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#qwen-generation-path" /></animateMotion></circle><text x="18" y="162" fill="#71839d" fontSize="10" fontFamily="monospace" letterSpacing="1.4">MICRO VIEW · ONE BACKBONE LAYER</text><rect x="18" y="180" width="1185" height="96" rx="12" fill="#0a101d" stroke={`${color}55`} /><path d="M 60 228 H 1160" stroke="#263a55" strokeWidth="2" strokeDasharray="7 5" /><FlowArrow x1={183} y1={228} x2={220} y2={228} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={395} y1={228} x2={432} y2={228} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={607} y1={228} x2={644} y2={228} color={color} marker="qwen-generation-arrow" /><FlowArrow x1={819} y1={228} x2={856} y2={228} color={color} marker="qwen-generation-arrow" /><SvgNode x={32} y={197} width={150} title={embedding} detail="current Token" color="#67e8f9" /><SvgNode x={220} y={197} width={175} title="Gated DeltaNet × 3" detail="history / state path" color="#67e8f9" /><SvgNode x={432} y={197} width={175} title={attention} detail={model.cycleAttention === 'QSA' ? 'sparse micro-blocks' : 'global content'} color="#c4b5fd" /><SvgNode x={644} y={197} width={175} title={feedForward} detail={model.isMoe ? '10 routed + 1 shared' : 'shared capacity'} color="#fbbf24" /><SvgNode x={856} y={197} width={175} title="Next hidden state" detail="residual stream" color="#fbbf24" /><text x="620" y="304" textAnchor="middle" fill="#94a4ba" fontSize="11">The updated state reaches LM Output; a decoder strategy chooses one candidate Token, appends it, and repeats the path.</text><text x="620" y="326" textAnchor="middle" fill="#71839d" fontSize="10">MTP is a separate training mechanism; this diagram does not invent fixed future-token branches.</text></svg><div className="qwen-token-generation-caption"><span><b>Input:</b> tokenize the prompt, then build a hidden representation.</span><span><b>Process:</b> repeat the model-specific backbone layers.</span><span><b>Output:</b> logits → decoding strategy → selected Token → next step.</span></div></div>;
}

export function ModelComparisonVisual({ selected }: { selected: QwenVisualModel }) {
  const lanes: Array<{ label: string; color: string; id: QwenVisualModel['id']; nodes: string[] }> = [
    { id: '27b', label: '27B · Dense', color: '#67e8f9', nodes: ['Input', 'GDN × 3', 'Gated Attention', 'Dense FFN', 'Output'] },
    { id: 'a95b', label: '2.4T-A95B · MoE', color: '#c4b5fd', nodes: ['Input', 'GDN × 3', 'Gated Attention', '10 routed + 1 shared', 'Output'] },
    { id: 'flash', label: 'Flash-Next · MoE', color: '#fbbf24', nodes: ['Input', 'N-gram + GDN', 'QSA', '10 routed + 1 shared', 'Output'] },
  ];
  return <div className="qwen-visual-frame comparison-visual" role="region" tabIndex={0} aria-label="Three-model comparison diagram; horizontal scroll available"><div className="visual-kicker">THREE PATHS THROUGH THE FAMILY</div><svg viewBox="0 0 980 255" role="img" aria-label="Animated comparison of the Dense, MoE, and Flash-Next model paths"><defs><Arrow id="qwen-compare-cyan" color="#67e8f9" /><Arrow id="qwen-compare-purple" color="#c4b5fd" /><Arrow id="qwen-compare-amber" color="#fbbf24" /></defs>{lanes.map((lane, laneIndex) => { const y = 34 + laneIndex * 74; const active = selected.id === lane.id; const marker = lane.id === '27b' ? 'qwen-compare-cyan' : lane.id === 'a95b' ? 'qwen-compare-purple' : 'qwen-compare-amber'; return <g key={lane.id} className={active ? 'comparison-lane selected' : 'comparison-lane'} opacity={active ? 1 : .62}><text x="10" y={y + 8} fill={lane.color} fontSize="11" fontFamily="monospace" fontWeight="700">{lane.label}</text>{lane.nodes.map((node, index) => { const x = 150 + index * 165; return <g key={node}><rect x={x} y={y - 15} width="130" height="39" rx="7" fill={active ? `${lane.color}18` : '#0e1421'} stroke={lane.color} strokeOpacity={active ? .8 : .35} /><text x={x + 65} y={y + 9} textAnchor="middle" fill="#e6edf7" fontSize="10" fontWeight="700">{node}</text>{index < lane.nodes.length - 1 && <line x1={x + 130} y1={y + 4} x2={x + 160} y2={y + 4} stroke={lane.color} strokeWidth="1.8" strokeDasharray="6 4" markerEnd={`url(#${marker})`} className="qwen-svg-flow" />}</g>; })}<circle className="qwen-lane-packet" r="5" fill={lane.color}><animateMotion dur="5.5s" begin={`${laneIndex * .6}s`} repeatCount="indefinite" path={`M 150 ${y + 4} H 935`} /></circle></g>; })}</svg><div className="visual-caption"><span>Animated lanes share the same teaching scale; the labels carry the published model-specific differences.</span><span>Selected: <b>{selected.name}</b></span></div></div>;
}

export function BackboneStructureVisual({ model, layer }: { model: QwenVisualModel; layer: number }) {
  const currentPosition = ((layer - 1) % 4) + 1;
  const feedForward = model.isMoe ? 'MoE' : 'Dense FFN';
  const nodes = ['Gated DeltaNet', 'Gated DeltaNet', 'Gated DeltaNet', model.cycleAttention];
  return <div className="qwen-visual-frame backbone-visual" role="region" tabIndex={0} aria-label="Qwen backbone structure diagram; horizontal scroll available"><div className="visual-kicker">BACKBONE DATA FLOW · {model.name}</div><svg viewBox="0 0 1260 230" role="img" aria-label={`${model.name} repeating four-layer backbone structure with an animated hidden-state signal`}><defs><Arrow id="qwen-backbone-arrow" /><path id="qwen-backbone-path" d="M 78 106 H 1230" /></defs><path d="M 78 106 H 1230" stroke="#263a55" strokeWidth="4" fill="none" /><FlowArrow x1={152} y1={106} x2={180} y2={106} marker="qwen-backbone-arrow" />{[0, 1, 2, 3].map((index) => <FlowArrow key={index} x1={400 + index * 240} y1={106} x2={420 + index * 240} y2={106} marker="qwen-backbone-arrow" />)}{nodes.map((node, index) => <SvgNode key={node + index} x={180 + index * 240} y={75} width={220} title={`${index + 1}. ${node}`} detail={`then ${feedForward}`} color={index === 3 ? '#c4b5fd' : '#67e8f9'} active={currentPosition === index + 1} />)}<SvgNode x={6} y={75} width={145} title="Input h₀" detail={`d = ${model.hidden}`} color="#67e8f9" /><SvgNode x={1140} y={75} width={100} title="Output" detail="hₗ" color="#fbbf24" /><circle className="qwen-moving-token" r="7" fill="#ffffff"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#qwen-backbone-path" /></animateMotion></circle><text x="630" y="36" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontFamily="monospace">4 layers × {model.cycleCount} cycles = {model.layers} backbone layers</text><path d="M 180 184 H 1120" stroke="#334b68" strokeWidth="1" strokeDasharray="4 4" /><text x="630" y="209" textAnchor="middle" fill="#8190a8" fontSize="11">The highlighted position is Layer {layer}; the signal repeats through the same 4-layer pattern.</text></svg><div className="visual-caption"><span>Each sequence operator is followed by {feedForward}; it is part of each layer, not a later branch.</span><span>Layer {layer} · cycle {Math.floor((layer - 1) / 4) + 1}</span></div></div>;
}

export function GdnFlowVisual({ step }: { step: number }) {
  const labels = ['Read Token', 'Delta update', 'Carry state'];
  return <div className="qwen-visual-frame operator-flow-visual" role="region" tabIndex={0} aria-label="Operator data-flow diagram; horizontal scroll available"><div className="visual-kicker">GDN STATE TRANSITION</div><svg viewBox="0 0 920 190" role="img" aria-label={`Gated DeltaNet visual step ${step + 1}: ${labels[step]}`}><defs><Arrow id="qwen-gdn-arrow" /><path id="qwen-gdn-path" d="M 75 96 H 840" /></defs><FlowArrow x1={130} y1={96} x2={260} y2={96} marker="qwen-gdn-arrow" /><FlowArrow x1={390} y1={96} x2={520} y2={96} marker="qwen-gdn-arrow" /><FlowArrow x1={650} y1={96} x2={780} y2={96} marker="qwen-gdn-arrow" /><SvgNode x={10} y={65} width={120} title="Token t" detail="current input" color="#67e8f9" active={step === 0} /><SvgNode x={260} y={65} width={130} title="Delta + gate" detail="update rule" color="#fbbf24" active={step === 1} /><SvgNode x={520} y={65} width={130} title="State Sₜ₋₁" detail="history" color="#c4b5fd" /><SvgNode x={780} y={65} width={130} title="State Sₜ" detail="compressed state" color="#67e8f9" active={step === 2} /><circle className="qwen-moving-token" r="7" fill="#ffffff"><animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#qwen-gdn-path" /></animateMotion></circle><text x="460" y="29" textAnchor="middle" fill="#94a4ba" fontSize="12">{labels[step]} · history moves through a recurrent state path</text></svg><div className="visual-caption"><span>GDN keeps a compact history path; this is a teaching abstraction, not an undisclosed state tensor.</span></div></div>;
}

export function AttentionFlowVisual({ model, step, focus }: { model: QwenVisualModel; step: number; focus: number }) {
  const qsa = model.cycleAttention === 'QSA';
  const labels = qsa ? ['Read query', 'Score micro-blocks', 'Select context', 'Sparse merge'] : ['Read query', 'Compare content', 'Select context', 'Content merge'];
  const contextLabels = ['A', 'B', 'C', 'current'];
  return <div className="qwen-visual-frame operator-flow-visual" role="region" tabIndex={0} aria-label="Operator data-flow diagram; horizontal scroll available"><div className="visual-kicker">{qsa ? 'QSA SPARSE ATTENTION FLOW' : 'GATED ATTENTION FLOW'}</div><svg viewBox="0 0 930 250" role="img" aria-label={`${model.cycleAttention} visual step ${step + 1}: ${labels[step]}`}><defs><Arrow id="qwen-attn-arrow" color="#c4b5fd" /><path id="qwen-attn-path" d="M 90 116 H 250 H 420 H 690 H 855" /></defs><SvgNode x={15} y={85} width={145} title="Query" detail="current Token" color="#67e8f9" active={step === 0} /><FlowArrow x1={160} y1={116} x2={250} y2={116} color="#c4b5fd" marker="qwen-attn-arrow" /><SvgNode x={250} y={85} width={150} title={qsa ? 'Indexer' : 'Content compare'} detail={qsa ? 'micro-block scores' : 'global interaction'} color="#c4b5fd" active={step === 1} /><FlowArrow x1={400} y1={116} x2={455} y2={116} color="#c4b5fd" marker="qwen-attn-arrow" />{contextLabels.map((label, index) => { const y = 35 + index * 55; const selected = step >= 2 && index === focus; return <g key={label}><rect x="455" y={y} width="145" height="38" rx="7" fill={selected ? '#c4b5fd28' : '#0e1421'} stroke={selected ? '#c4b5fd' : '#52617a'} strokeWidth={selected ? 2 : 1} /><text x="527" y={y + 24} textAnchor="middle" fill={selected ? '#ffffff' : '#9aa8bb'} fontSize="11" fontWeight="700">Context {label}</text><line x1="600" y1={y + 19} x2="690" y2="116" stroke={selected ? '#c4b5fd' : '#3a4a63'} strokeWidth={selected ? 2.2 : 1} strokeDasharray="5 4" className={selected ? 'qwen-svg-flow' : undefined} /></g>; })}<SvgNode x={690} y={85} width={150} title="Attention merge" detail={qsa ? 'sparse context' : 'content mix'} color="#c4b5fd" active={step === 3} /><FlowArrow x1={840} y1={116} x2={900} y2={116} color="#c4b5fd" marker="qwen-attn-arrow" /><circle className="qwen-moving-token" r="6" fill="#ffffff"><animateMotion dur="5s" repeatCount="indefinite"><mpath href="#qwen-attn-path" /></animateMotion></circle><text x="465" y="235" textAnchor="middle" fill="#94a4ba" fontSize="12">{labels[step]} · selected context is highlighted without claiming a real heatmap</text></svg><div className="visual-caption"><span>{qsa ? 'QSA selects sparse micro-blocks before attention.' : 'Gated Attention provides global content interaction.'}</span></div></div>;
}

export function MoeFlowVisual({ model, step, selected }: { model: QwenVisualModel; step: number; selected: number }) {
  const labels = ['Receive Token', 'Score experts', 'Route selected experts', 'Weighted merge'];
  return <div className="qwen-visual-frame operator-flow-visual" role="region" tabIndex={0} aria-label="Operator data-flow diagram; horizontal scroll available"><div className="visual-kicker">MoE ROUTING AND MERGE · {model.name}</div><svg viewBox="0 0 960 285" role="img" aria-label={`MoE visual step ${step + 1}: ${labels[step]}`}><defs><Arrow id="qwen-moe-arrow" color="#fbbf24" /><path id="qwen-moe-path" d="M 80 140 H 235 H 395 H 745 H 900" /></defs><SvgNode x={10} y={110} width={135} title="Token hₜ" detail="hidden state" color="#67e8f9" active={step === 0} /><FlowArrow x1={145} y1={141} x2={235} y2={141} color="#fbbf24" marker="qwen-moe-arrow" /><SvgNode x={235} y={110} width={150} title="Router" detail="scores candidates" color="#fbbf24" active={step === 1} /><line x1="385" y1="130" x2="480" y2="70" stroke="#fbbf24" strokeWidth="2" strokeDasharray="7 5" markerEnd="url(#qwen-moe-arrow)" /><line x1="385" y1="152" x2="480" y2="211" stroke="#fbbf24" strokeWidth="2" strokeDasharray="7 5" markerEnd="url(#qwen-moe-arrow)" /><SvgNode x={480} y={39} width={185} title="Shared expert" detail="always active" color="#c4b5fd" active={step >= 2} /><SvgNode x={480} y={180} width={185} title="Routed experts" detail="10 + 1 · of 512" color="#fbbf24" active={step === 2} />{Array.from({ length: 5 }, (_, index) => <circle key={index} cx={505 + index * 30} cy="235" r="8" fill={step >= 2 && index === selected % 5 ? '#ffffff' : step >= 2 ? '#fbbf24' : '#3f506b'} className={step >= 2 ? 'qwen-expert-pulse' : undefined} />)}<line x1="665" y1="70" x2="755" y2="141" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="7 5" markerEnd="url(#qwen-moe-arrow)" /><line x1="665" y1="211" x2="755" y2="141" stroke="#fbbf24" strokeWidth="2" strokeDasharray="7 5" markerEnd="url(#qwen-moe-arrow)" /><SvgNode x={755} y={110} width={145} title="Weighted merge" detail="routed outputs" color="#fbbf24" active={step === 3} /><circle className="qwen-moving-token" r="6" fill="#ffffff"><animateMotion dur="5.5s" repeatCount="indefinite"><mpath href="#qwen-moe-path" /></animateMotion></circle><text x="480" y="274" textAnchor="middle" fill="#94a4ba" fontSize="12">{labels[step]} · one Token uses a small subset, not every expert</text></svg><div className="visual-caption"><span>Shared and routed paths visibly converge at the weighted merge.</span><span>Teaching thumbnail: 5 circles stand in for the published 512-expert pool.</span></div></div>;
}

export function TrainingCausalityVisual({ model, effort, thinkingMode, preserveThinking }: { model: QwenVisualModel; effort: string; thinkingMode: string; preserveThinking: boolean }) {
  const routerTitle = model.isMoe ? 'Router learns' : 'Dense path learns';
  const routerDetail = model.isMoe ? 'training loss updates routing' : 'shared weights update';
  return <div className="qwen-visual-frame training-causality-visual" role="region" tabIndex={0} aria-label="Training and inference causality diagram; horizontal scroll available"><div className="visual-kicker">TRAINING → INFERENCE → RESPONSE</div><svg viewBox="0 0 980 210" role="img" aria-label="Causal flow from training updates to inference behavior and response controls"><defs><Arrow id="qwen-training-arrow" color="#fbbf24" /><path id="qwen-training-path" d="M 90 108 H 870" /></defs><FlowArrow x1={170} y1={108} x2={230} y2={108} color="#fbbf24" marker="qwen-training-arrow" /><FlowArrow x1={410} y1={108} x2={470} y2={108} color="#fbbf24" marker="qwen-training-arrow" /><FlowArrow x1={650} y1={108} x2={710} y2={108} color="#fbbf24" marker="qwen-training-arrow" /><SvgNode x={10} y={77} width={160} title="Training signal" detail="model loss" color="#c4b5fd" active /><SvgNode x={230} y={77} width={180} title={routerTitle} detail={routerDetail} color="#fbbf24" active={model.isMoe} /><SvgNode x={470} y={77} width={180} title="Inference" detail={model.isMoe ? 'score → select → merge' : 'dense computation'} color="#67e8f9" /><SvgNode x={710} y={77} width={180} title="Response control" detail={`${effort} · ${thinkingMode}`} color="#67e8f9" active={preserveThinking} /><circle className="qwen-moving-token" r="7" fill="#ffffff"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#qwen-training-path" /></animateMotion></circle><text x="490" y="39" textAnchor="middle" fill="#94a4ba" fontSize="12">Training changes parameters; inference uses the learned path; controls shape the response behavior.</text><text x="490" y="183" textAnchor="middle" fill="#8190a8" fontSize="11">{model.isMoe ? 'MoE note: Router learning and expert routing are connected stages, not the same event.' : '27B note: no Router is present because this model uses a Dense FFN.'}</text></svg></div>;
}

export function VisualLegend({ children }: { children: ReactNode }) { return <div className="visual-disclaimer"><span aria-hidden="true">ⓘ</span>{children}</div>; }
