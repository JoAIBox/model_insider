import React, { useState } from 'react';

export const MLAOperatorDeepDive: React.FC = () => {
  const [compressDim, setCompressDim] = useState<number>(512); // Low rank KV compression dimension d_c
  const [ropeDim] = useState<number>(64); // Decoupled RoPE dimension d_r
  const [contextLength, setContextLength] = useState<number>(128000); // 128K context length
  const [batchSize, setBatchSize] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'matrixAbsorption' | 'memoryCalculator' | 'ropeDecouple'>('pipeline');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Architecture constants (Kimi K3 / DeepSeek-V3 specifications)
  const numHeads = 96;
  const headDim = 128; // d_h

  // Memory Calculations
  // Standard MHA per token: 2 * numHeads * headDim = 2 * 96 * 128 = 24,576 floats (49,152 bytes in FP16)
  const mhaFloatsPerToken = 2 * numHeads * headDim;
  // MLA per token: d_c (512) + d_r (64) = 576 floats (1,152 bytes in FP16)
  const mlaFloatsPerToken = compressDim + ropeDim;
  const savingsRatio = (mhaFloatsPerToken / mlaFloatsPerToken).toFixed(1);

  // Total KV Cache Memory in GB (FP16: 2 bytes per float)
  const mhaMemoryGB = ((batchSize * contextLength * mhaFloatsPerToken * 2) / (1024 * 1024 * 1024)).toFixed(2);
  const mlaMemoryGB = ((batchSize * contextLength * mlaFloatsPerToken * 2) / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              MLA (Multi-Head Latent Attention) 低秩隐空间注意力原理与图形化推导
            </h2>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid #A78BFA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Gated Low-Rank KV Compression (24 Periodic Layers)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            彻底图解 Kimi K3 / DeepSeek MLA 算子：如何通过<b>低秩压缩 (d_c=512)</b>、<b>矩阵吸收 (Matrix Absorption)</b> 与 <b>RoPE 解耦</b>实现 KV Cache 显存暴降 42 倍！
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'pipeline' ? '#A78BFA' : 'transparent',
              color: activeTab === 'pipeline' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 全流程 Tensor 维度数据流图
          </button>
          <button
            onClick={() => setActiveTab('matrixAbsorption')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'matrixAbsorption' ? '#38BDF8' : 'transparent',
              color: activeTab === 'matrixAbsorption' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 矩阵吸收原理 (推理无需解压)
          </button>
          <button
            onClick={() => setActiveTab('ropeDecouple')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'ropeDecouple' ? '#F59E0B' : 'transparent',
              color: activeTab === 'ropeDecouple' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. RoPE 位置编码解耦机制
          </button>
          <button
            onClick={() => setActiveTab('memoryCalculator')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'memoryCalculator' ? '#10B981' : 'transparent',
              color: activeTab === 'memoryCalculator' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            4. 显存暴降计算器
          </button>
        </div>
      </div>

      {/* TAB 1: FULL PIPELINE SVG WITH DETAILED TENSOR DIMENSIONS */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Explanation Banner */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
              📐 MLA 各阶段 Tensor 维度转换全景图 (Multi-Head Latent Attention Tensor Flow)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', margin: 0, lineHeight: '1.5' }}>
              传统的 MHA 需要为 96 个头分别存储 Key 和 Value（多达 24,576 维）。而 MLA 将 Key/Value 压缩为一个 <b>512 维的隐空间向量 c_t^{`{KV}`}</b>，另附一个 <b>64 维的 RoPE 位置 Key k_t^{`{R}`}</b>。悬停节点可高亮数据路径！
            </p>
          </div>

          {/* SVG Pipeline Diagram */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 940 480" width="100%" height="480" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-mla-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
                <marker id="arrow-mla-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
                <marker id="arrow-mla-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
                <marker id="arrow-mla-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* SECTION BACKGROUND CONTAINERS */}
              {/* KV Latent Cache Area (The Highlight!) */}
              <rect x="250" y="20" width="220" height="280" rx="10" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="6,4" />
              <text x="360" y="42" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">💾 实际存入 KV Cache 的数据 (仅 576 维!)</text>

              {/* 1. INPUT TENSOR NODE */}
              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('input')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="20" y="200" width="160" height="80" rx="8" fill="#0F172A" stroke={hoveredNode === 'input' ? '#38BDF8' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
                <text x="100" y="232" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">输入向量 x_t</text>
                <text x="100" y="258" fill="#38BDF8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Tensor: [d = 7,168]</text>
              </g>

              {/* 2. BRANCH 1: KV COMPRESSION MATRIX W_dkv */}
              <path d="M 180 220 L 260 110" stroke="#A78BFA" strokeWidth="2" fill="none" markerEnd="url(#arrow-mla-purple)" />
              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('kv_comp')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="260" y="70" width="200" height="75" rx="8" fill="rgba(167, 139, 250, 0.12)" stroke={hoveredNode === 'kv_comp' ? '#A78BFA' : 'rgba(167, 139, 250, 0.4)'} strokeWidth="2" />
                <text x="360" y="98" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">1. KV 语义低秩压缩向量 c_t</text>
                <text x="360" y="120" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">c_t^KV = W_dkv · x_t  ∈ ℝ^512</text>
                <text x="360" y="136" fill="#94A3B8" fontSize="11" textAnchor="middle">W_dkv 权重: [512 × 7,168]</text>
              </g>

              {/* 3. BRANCH 2: RoPE KEY PROJECTION W_kr */}
              <path d="M 180 240 L 260 210" stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#arrow-mla-amber)" />
              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('rope_k')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="260" y="180" width="200" height="75" rx="8" fill="rgba(245, 158, 11, 0.12)" stroke={hoveredNode === 'rope_k' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'} strokeWidth="2" />
                <text x="360" y="208" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">2. RoPE 位置 Key 向量 k_t^R</text>
                <text x="360" y="230" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">k_t^R = RoPE(W_kr · x_t) ∈ ℝ^64</text>
                <text x="360" y="246" fill="#94A3B8" fontSize="11" textAnchor="middle">W_kr 权重: [64 × 7,168]</text>
              </g>

              {/* 4. BRANCH 3: QUERY PROJECTION W_dq & W_uq */}
              <path d="M 180 260 L 260 360" stroke="#38BDF8" strokeWidth="2" fill="none" markerEnd="url(#arrow-mla-blue)" />
              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('query')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="260" y="320" width="200" height="85" rx="8" fill="rgba(56, 189, 248, 0.12)" stroke={hoveredNode === 'query' ? '#38BDF8' : 'rgba(56, 189, 248, 0.4)'} strokeWidth="2" />
                <text x="360" y="348" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">3. Query 投影 (q_t^C & q_t^R)</text>
                <text x="360" y="370" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">q_t^C ∈ ℝ^[96×128], q_t^R ∈ ℝ^[96×64]</text>
                <text x="360" y="390" fill="#94A3B8" fontSize="11" textAnchor="middle">低秩压缩 c_t^Q ∈ ℝ^1536 降维</text>
              </g>

              {/* 5. UP-PROJECTION DECODER (W_uk & W_uv) - ONLY FOR MHA COMPARISON OR TRAINING */}
              <path d="M 460 107 L 540 107" stroke="#A78BFA" strokeWidth="2" fill="none" markerEnd="url(#arrow-mla-purple)" />
              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('unproject')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="540" y="70" width="210" height="75" rx="8" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
                <text x="645" y="98" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">解压重构 Key 与 Value</text>
                <text x="645" y="120" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">K_t = W_uk c_t,  V_t = W_uv c_t</text>
                <text x="645" y="136" fill="#94A3B8" fontSize="11" textAnchor="middle">Tensor 展开为: [96 头 × 128 维]</text>
              </g>

              {/* 6. CONCATENATION & ATTENTION SCORE CALCULATION */}
              <path d="M 750 107 L 800 210" stroke="#A78BFA" strokeWidth="1.5" />
              <path d="M 460 217 L 800 230" stroke="#F59E0B" strokeWidth="1.5" />
              <path d="M 460 360 L 800 250" stroke="#38BDF8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-mla-green)" />

              <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('attn_score')} onMouseLeave={() => setHoveredNode(null)}>
                <rect x="800" y="195" width="125" height="90" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
                <text x="862" y="228" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">Softmax 点积</text>
                <text x="862" y="250" fill="#10B981" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Q K^T / √d_h</text>
                <text x="862" y="270" fill="#94A3B8" fontSize="11" textAnchor="middle">输出 y_t ∈ ℝ^7168</text>
              </g>
            </svg>
          </div>

          {/* Dimension Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>输入隐藏状态 x_t</span>
              <div style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '1.1rem', marginTop: '4px' }}>[7,168 维]</div>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>主干网络单 Token 特征向量</p>
            </div>

            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid #10B981' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>KV Cache 低秩压缩向量 c_t^KV</span>
              <div style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '1.1rem', marginTop: '4px' }}>[512 维]</div>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>无位置编码的纯语义 Key/Value 缓存</p>
            </div>

            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid #F59E0B' }}>
              <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>RoPE 位置 Key 向量 k_t^R</span>
              <div style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '1.1rem', marginTop: '4px' }}>[64 维]</div>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>解耦出来的 2D 旋转位置编码向量</p>
            </div>

            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid #A78BFA' }}>
              <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>解压多头 Key/Value (MHA equivalent)</span>
              <div style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '1.1rem', marginTop: '4px' }}>[96 头 × 128 维]</div>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>逻辑上的 96 头全尺寸 Key/Value 矩阵</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIX ABSORPTION TRICK (THE INFERENCE MAGIC!) */}
      {activeTab === 'matrixAbsorption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              ⚡ 矩阵吸收原理 (Matrix Absorption Trick) —— 推理阶段完全不需要解压！
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', margin: 0, lineHeight: '1.6' }}>
              为什么 MLA 在推理自回归生成时速度极快？因为根据矩阵结合律，<b>重构解压矩阵 W_uk 可以被提前“吸收”合并到 Query 的投影矩阵中</b>！模型在 GPU 中直接拿 512 维向量算点积，根本不需要展开成 96 个头！
            </p>
          </div>

          {/* Step-by-step Math Derivation Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Step 1 */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1.05rem' }}>步骤 1：原始解压后的 Attention 点积公式</span>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', marginTop: '8px' }}>
                Score = Q_t · K_j^T = ( q_t^C · W_uq^T ) · ( W_uk · c_j^KV )^T
              </div>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '6px 0 0 0' }}>
                按照标准逻辑，需要先用 W_uk 把 512 维的 c_j^KV 恢复为 12,288 维的 Key，然后再与 Query 做点积。
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.05rem' }}>步骤 2：利用转置矩阵结合律进行“矩阵吸收” (Matrix Absorption)</span>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem', color: '#38BDF8', marginTop: '8px' }}>
                Score = q_t^C · ( W_uq^T · W_uk^T ) · (c_j^KV)^T = q_t^C · W_QK · (c_j^KV)^T
              </div>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '6px 0 0 0' }}>
                💡 <b>核心魔术：</b> 把静态权重 W_uq^T 与 W_uk^T 在模型加载阶段预先相乘，合并为一个融合矩阵 W_QK ∈ ℝ^(128 × 512)！
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem' }}>步骤 3：推理阶段终极加速（极速 Latent 点积）</span>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem', color: '#10B981', marginTop: '8px' }}>
                q'_t = q_t^C · W_QK  ⇒  Score = q'_t · (c_j^KV)^T
              </div>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '6px 0 0 0' }}>
                GPU 只需要用压缩 Query向量 q'_t 直接与显存里的 512 维 c_j^KV 做点积！<b>全程 0 次解压，显存读取量减少 97.6%！</b>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ROPE DECOUPLING MECHANISM */}
      {activeTab === 'ropeDecouple' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 为什么需要 RoPE 位置编码解耦？(Decoupled RoPE Key)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', margin: 0, lineHeight: '1.6' }}>
              如果把带有旋转位置编码（RoPE）的 Key 压缩进低秩向量 c_t^KV，因为位置变换是动态的（包含位置 t 的正弦余弦旋转），矩阵吸收 W_QK 就会失效。MLA 巧夺天工的解法是：<b>将“语义”与“位置”拆成两条并行路径！</b>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1.1rem' }}>路径 A：纯语义低秩向量 c_t^KV</span>
              <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#FFF' }}>
                [d_c = 512 维] 不施加任何 RoPE
              </div>
              <ul style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                <li>只包含文本/图像的特征内容；</li>
                <li>位置无关，因此完美支持 **矩阵吸收加速**；</li>
                <li>所有 96 个注意力头共享这同一个 512 维向量。</li>
              </ul>
            </div>

            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #F59E0B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '1.1rem' }}>路径 B：解耦位置向量 k_t^R</span>
              <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#FFF' }}>
                [d_r = 64 维] 专门施加 2D RoPE 旋转
              </div>
              <ul style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                <li>专门携带 Token 在序列中的绝对/相对位置信息；</li>
                <li>所有注意力头共享这 64 维位置 Key；</li>
                <li>最终 Attention Score = 语义点积 + 位置点积。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MEMORY CALCULATOR & INTERACTIVE COMPARISON */}
      {activeTab === 'memoryCalculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧮 交互式 KV Cache 显存暴降真实计算器
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', margin: 0, lineHeight: '1.5' }}>
              调整上下文长度与 Batch Size，直观对比传统 96 头 MHA 与 Kimi K3 MLA 在推理阶段的实际显存占用。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left Controls */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>参数调节 (Context Sliders)</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>上下文长度 Context:</span>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontFamily: 'monospace' }}>{(contextLength / 1024).toFixed(0)}K Tokens</span>
                </div>
                <input
                  type="range"
                  min="8192"
                  max="1024000"
                  step="8192"
                  value={contextLength}
                  onChange={(e) => setContextLength(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>并发 Batch Size:</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontFamily: 'monospace' }}>{batchSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  step="1"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>低秩压缩维度 d_c:</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{compressDim}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="1024"
                  step="128"
                  value={compressDim}
                  onChange={(e) => setCompressDim(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Right Comparison Box */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>单层 KV Cache 显存占用计算结果 (FP16 精度)</span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <div style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1rem' }}>❌ 传统 96 头 MHA</div>
                  <div style={{ fontSize: '2rem', color: '#FFF', fontWeight: 'bold', margin: '8px 0', fontFamily: 'monospace' }}>
                    {mhaMemoryGB} GB
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
                    单 Token 需存 24,576 个 Float，长上下文时显存迅速爆满崩溃。
                  </p>
                </div>

                <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
                  <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>✅ Kimi K3 Gated MLA</div>
                  <div style={{ fontSize: '2rem', color: '#10B981', fontWeight: 'bold', margin: '8px 0', fontFamily: 'monospace' }}>
                    {mlaMemoryGB} GB
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
                    单 Token 仅需存 {mlaFloatsPerToken} 个 Float（{compressDim} 维语义 + 64 维 RoPE），显存节省 <b>{savingsRatio} 倍</b>！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
