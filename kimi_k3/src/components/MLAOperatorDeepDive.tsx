import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';

export const MLAOperatorDeepDive: React.FC = () => {
  const [compressDim, setCompressDim] = useState<number>(512); // Low rank KV compression dimension d_c
  const [ropeDim] = useState<number>(64); // Decoupled RoPE dimension d_r
  const [contextLength, setContextLength] = useState<number>(128000); // 128K context length
  const [batchSize, setBatchSize] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'pipeline' | 'matrixAbsorption' | 'ropeDecouple' | 'memoryCalculator'>('philosophy');
  const [selectedStage, setSelectedStage] = useState<'input' | 'compress' | 'rope' | 'absorption' | 'unproject'>('compress');
  const [isAbsorbed, setIsAbsorbed] = useState<boolean>(true); // Matrix absorption toggle animation state

  // Architecture constants (Kimi K3 / DeepSeek-V3 specifications)
  const numHeads = 96;
  const headDim = 128; // d_h

  // Memory Calculations
  const mhaFloatsPerToken = 2 * numHeads * headDim; // 24,576 floats
  const mlaFloatsPerToken = compressDim + ropeDim; // 576 floats
  const savingsRatio = (mhaFloatsPerToken / mlaFloatsPerToken).toFixed(1);

  // Memory in GB (FP16)
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
              MLA (Multi-Head Latent Attention) 隐空间多头注意力——全图形解密
            </h2>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid #A78BFA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Low-Rank Latent Compression & Matrix Absorption
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            用<b>图形与几何结构</b>拆解核心哲学：<b>主干残差直通 (7,168 维无损)</b> vs <b>旁路低秩压缩 (512 维低显存)</b>！
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('philosophy')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'philosophy' ? 'linear-gradient(135deg, #38BDF8 0%, #00F2FE 100%)' : 'transparent',
              color: activeTab === 'philosophy' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            0. 🛣️ 残差公路 vs 旁路压缩 (核心解密)
          </button>
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
            1. 🖼️ 矩阵图形化压缩管道
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
            2. ⚡ 矩阵吸收动画 (零解压推理)
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
            3. 🧩 语义 vs 位置解耦双路图
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
            4. 📊 显存体积直观柱状图
          </button>
        </div>
      </div>

      {/* TAB 0: RESIDUAL HIGHWAY VS LATENT SUBPATH PHILOSOPHY (NEW KEY FEATURE!) */}
      {activeTab === 'philosophy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>💡</span>
              <h3 style={{ fontSize: '1.3rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
                核心架构解密：主干残差公路 (7,168 维直通) vs 旁路低维压缩工坊 (512 维降维)
              </h3>
            </div>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>
              <b>回答核心困惑：MLA 的输出不是 576 维，而是恢复为完整的 7,168 维！</b><br />
              主干残差通道（Residual Highway）就像一条<b>不缩小的 7,168 维超大高速公路</b>，全过程 100% 保留模型完整信息与记忆；MLA 算子仅仅是在旁路“偷瞄”一眼，拉出 <b>512 维低隐向量做低显存 KV 检索</b>，算出增量更新后再<b>升维映射回 7,168 维叠加回主干公路</b>！
            </p>
          </div>

          {/* SVG Diagram showing Main Highway vs Side Branch Bottleneck */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            
            <svg viewBox="0 0 940 380" width="100%" height="380" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient-highway" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
                <marker id="arrow-blue-philosophy" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00F2FE" />
                </marker>
              </defs>

              {/* 1. INPUT NODE (7,168-d) */}
              <rect x="20" y="140" width="120" height="70" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
              <text x="80" y="170" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">输入 x_t</text>
              <text x="80" y="192" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

              {/* 2. MAIN RESIDUAL HIGHWAY (TOP PATH - UNTOUCHED 7,168-D STRAIGHT THROUGH) */}
              <path d="M 140 160 L 800 160" stroke="url(#gradient-highway)" strokeWidth="6" fill="none" markerEnd="url(#arrow-blue-philosophy)" />
              <rect x="300" y="125" width="280" height="28" rx="14" fill="#070913" stroke="#00F2FE" strokeWidth="1.5" />
              <text x="440" y="144" fill="#00F2FE" fontSize="12" fontWeight="bold" textAnchor="middle">
                🛣️ 7,168 维主干残差高速公路 (无损直通，一维不少!)
              </text>

              {/* 3. SIDE-BRANCH PROJECTION (BOTTOM PATH - MLA BOTTLENECK) */}
              <path d="M 140 185 C 190 280, 200 280, 250 280" stroke="#A78BFA" strokeWidth="2.5" fill="none" />
              
              {/* Bottleneck Node 1: Compression */}
              <g>
                <rect x="250" y="245" width="150" height="70" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
                <text x="325" y="272" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">1. 旁路低秩降维 W_dkv</text>
                <text x="325" y="295" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">c_t^KV ∈ ℝ^512</text>
                <text x="325" y="308" fill="#94A3B8" fontSize="10" textAnchor="middle">(省显存的 KV 检索档案)</text>
              </g>

              <line x1="400" y1="280" x2="440" y2="280" stroke="#A78BFA" strokeWidth="2" />

              {/* Bottleneck Node 2: Attention Computation */}
              <g>
                <rect x="440" y="245" width="160" height="70" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
                <text x="520" y="272" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">2. 注意力低显存点积</text>
                <text x="520" y="295" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">o_t ∈ ℝ^12,288</text>
                <text x="520" y="308" fill="#94A3B8" fontSize="10" textAnchor="middle">(96 头 × 128 维)</text>
              </g>

              <line x1="600" y1="280" x2="640" y2="280" stroke="#10B981" strokeWidth="2" />

              {/* Bottleneck Node 3: Up-projection */}
              <g>
                <rect x="640" y="245" width="160" height="70" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
                <text x="720" y="272" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">3. 输出升维映射 W_o</text>
                <text x="720" y="295" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Δy ∈ ℝ^7,168</text>
                <text x="720" y="308" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">(成功恢复为 7,168 维!)</text>
              </g>

              {/* RE-CONVERGENCE UP TO HIGHWAY */}
              <path d="M 800 280 C 825 280, 830 200, 830 185" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
              
              {/* SUMMATION CIRCLE */}
              <circle cx="830" cy="160" r="16" fill="#10B981" stroke="#FFF" strokeWidth="2" />
              <text x="830" y="166" fill="#000" fontSize="20" fontWeight="bold" textAnchor="middle">+</text>
              <text x="830" y="132" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">残差加回 (Addition)</text>

              {/* 4. OUTPUT NODE (7,168-d) */}
              <line x1="846" y1="160" x2="890" y2="160" stroke="#10B981" strokeWidth="3" />
              <rect x="890" y="135" width="45" height="50" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
              <text x="912.5" y="160" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">h_l+1</text>
              <text x="912.5" y="175" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">7168d</text>

            </svg>

            {/* Stage Dimension Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%' }}>
              
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>① 主干输入维度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>x_t ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>无损通过残差公路直通下一层</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>② 旁路压缩瓶颈维度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>c_t^KV ∈ ℝ^512</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>仅在旁路用于超低显存 KV 检索</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #10B981' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>③ 旁路升维更新量</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>Δy ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>通过 W_o 成功还原恢复为 7,168 维</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #00F2FE' }}>
                <span style={{ color: '#00F2FE', fontWeight: 'bold', fontSize: '0.95rem' }}>④ 最终残差输出维度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>h_l+1 ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>x_t + Δy 融合，维度一维不少！</p>
              </div>

            </div>

          </div>

          {/* Theoretical Summary Box */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#FFF', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              总结：为什么不在 Tokenizer 入口直接用 512 维？
            </h4>
            <ul style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
              <li><b>词表空间容积 (Vocabulary Capacity)</b>：Kimi K3 词表有 160,000 个 Token。在 512 维空间里装 16 万个词向量会导致严重拥挤混淆，只有在 7,168 维的高维正交空间里才能保持清晰的线性可分性。</li>
              <li><b>全局知识库 vs 局部检索便签</b>：7,168 维主干负责承载 2.78 万亿参数巨量知识与多模态表征；512 维只是查阅历史资料时临时抽出的关键词便签。</li>
              <li><b>高低维相间动态呼吸</b>：通过“高维主干直通 + 旁路低维降维算子”，大模型在保持极致表征力的同时，成功将 KV Cache 显存体积降低了 42.6 倍！</li>
            </ul>
          </div>

        </div>
      )}

      {/* TAB 1: GRAPHIC TENSOR COMPRESSION PIPELINE */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
                🖼️ 图形化：7,168 维特征如何被挤压为 512 维隐空间向量？
              </h3>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>💡 点击图中的不同节点框查看对应的几何挤压过程</span>
            </div>
          </div>

          {/* Interactive SVG Diagram displaying visual shapes of matrices & tensors */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <svg viewBox="0 0 940 380" width="100%" height="380" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient-input" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="gradient-latent" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="gradient-rope" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>

              {/* SECTION 1: INPUT VECTOR (7168 dimensional tall bar) */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('input')}>
                <rect x="20" y="40" width="40" height="280" rx="6" fill="url(#gradient-input)" stroke={selectedStage === 'input' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="40" y="30" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_t</text>
                <text x="40" y="340" fill="#94A3B8" fontSize="12" textAnchor="middle">7,168 维</text>
                <text x="40" y="180" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90 40 180)">高维输入特征向量</text>
              </g>

              {/* CONNECTOR ARROW 1: TO COMPRESSION MATRIX */}
              <line x1="70" y1="120" x2="140" y2="120" stroke="#A78BFA" strokeWidth="2" />
              <line x1="70" y1="240" x2="140" y2="240" stroke="#F59E0B" strokeWidth="2" />

              {/* SECTION 2: COMPRESSION MATRIX BLOCKS */}
              {/* Top: W_dkv Matrix Funnel */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('compress')}>
                <path d="M 140 60 L 260 90 L 260 150 L 140 180 Z" fill="rgba(167, 139, 250, 0.15)" stroke={selectedStage === 'compress' ? '#A78BFA' : 'rgba(167, 139, 250, 0.4)'} strokeWidth="2" />
                <text x="200" y="125" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">W_dkv (矩阵漏斗)</text>
                <text x="200" y="142" fill="#94A3B8" fontSize="11" textAnchor="middle">[512 × 7168]</text>
              </g>

              {/* Bottom: W_kr Matrix Funnel */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <path d="M 140 200 L 260 220 L 260 260 L 140 280 Z" fill="rgba(245, 158, 11, 0.15)" stroke={selectedStage === 'rope' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'} strokeWidth="2" />
                <text x="200" y="245" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">W_kr (位置投影)</text>
                <text x="200" y="260" fill="#94A3B8" fontSize="11" textAnchor="middle">[64 × 7168]</text>
              </g>

              {/* CONNECTOR ARROW 2: TO LATENT VECTORS */}
              <line x1="260" y1="120" x2="330" y2="120" stroke="#A78BFA" strokeWidth="2" />
              <line x1="260" y1="240" x2="330" y2="240" stroke="#F59E0B" strokeWidth="2" />

              {/* SECTION 3: COMPACT LATENT VECTORS (THE KV CACHE DATA!) */}
              {/* Compressed Latent KV Cache c_t^KV */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('compress')}>
                <rect x="330" y="105" width="160" height="30" rx="4" fill="url(#gradient-latent)" stroke={selectedStage === 'compress' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="410" y="125" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">c_t^KV (语义 Latent)</text>
                <text x="410" y="95" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">仅 512 维</text>
              </g>

              {/* Decoupled RoPE Key k_t^R */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <rect x="330" y="225" width="80" height="30" rx="4" fill="url(#gradient-rope)" stroke={selectedStage === 'rope' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="370" y="245" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">k_t^R (位置)</text>
                <text x="370" y="215" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">64 维</text>
              </g>

              {/* HIGHLIGHT BOX AROUND KV CACHE (576 dims total) */}
              <rect x="315" y="70" width="190" height="210" rx="8" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6,4" />
              <text x="410" y="295" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">💾 KV Cache 实际存储体积</text>
              <text x="410" y="312" fill="#10B981" fontSize="11" textAnchor="middle">(512 + 64 = 576 维)</text>

              {/* CONNECTOR ARROW 3: TO UNPROJECTED MULTI-HEAD MATRIX */}
              <line x1="490" y1="120" x2="580" y2="120" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4,2" />
              
              {/* SECTION 4: UNPROJECTED MULTI-HEAD MATRIX (LOGICAL VIEW FOR TRAINING/MHA COMPARISON) */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('unproject')}>
                <rect x="580" y="40" width="220" height="160" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={selectedStage === 'unproject' ? '#A78BFA' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
                <text x="690" y="65" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">解压展开后的 96 头全尺寸 Key/Value</text>
                
                {/* 96 Multi-head column grid visualization */}
                <g opacity="0.7">
                  <rect x="595" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="615" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="635" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <text x="665" y="120" fill="#94A3B8" fontSize="16" fontWeight="bold">...</text>
                  <rect x="685" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="705" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="770" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                </g>
                <text x="690" y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">[96 个注意力头 × 128 维 = 12,288 维]</text>
                <text x="690" y="190" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">❌ 传统 MHA 需要在显存中存这一庞大矩阵！</text>
              </g>
            </svg>

            {/* Bottom Interactive Stage Explanation Card */}
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)', width: '100%' }}>
              {selectedStage === 'input' && (
                <div>
                  <h4 style={{ color: '#38BDF8', margin: '0 0 6px 0', fontSize: '1.1rem' }}>1. 高维输入向量 x_t (7,168 维)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    代表当前 Token 在 Transformer 主干网络中的全维度语义表达。传统 MHA 会直接用 96 组不同的权重矩阵把这个 7,168 维向量投影成 96 头 Key 和 96 头 Value。
                  </p>
                </div>
              )}
              {selectedStage === 'compress' && (
                <div>
                  <h4 style={{ color: '#A78BFA', margin: '0 0 6px 0', fontSize: '1.1rem' }}>2. 隐空间漏斗压缩 W_dkv (7,168 维 ➔ 512 维)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    通过下投影矩阵 W_dkv，将 7,168 维输入压缩为一个极具概括力的 <b>512 维低秩隐向量 c_t^KV</b>。它不分注意力头，也不区分 Key 和 Value，以极致压缩形态存入显存，显存读取压强降低 97.6%！
                  </p>
                </div>
              )}
              {selectedStage === 'rope' && (
                <div>
                  <h4 style={{ color: '#F59E0B', margin: '0 0 6px 0', fontSize: '1.1rem' }}>3. 独立位置编码解耦分支 k_t^R (64 维)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    旋转位置编码（RoPE）带有依赖 Token 绝对位置的旋转矩阵。若将其强行压入隐向量，会导致后续的“矩阵吸收”失效。因此 MLA 单独开辟一条 64 维分支，专门处理 2D 空间/时间位置信息。
                  </p>
                </div>
              )}
              {selectedStage === 'unproject' && (
                <div>
                  <h4 style={{ color: '#EF4444', margin: '0 0 6px 0', fontSize: '1.1rem' }}>4. 传统 MHA 96 头解压展开 vs MLA 零解压</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    在逻辑上，512 维隐向量可以通过解压矩阵 W_uk 展开回 96 头 × 128 维（12,288 维）的完整 Key。<b>但真正的重点是：在推理阶段，模型通过矩阵吸收，根本不需要进行这一步解压！</b>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ANIMATED MATRIX ABSORPTION TRICK */}
      {activeTab === 'matrixAbsorption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                ⚡ 矩阵吸收 (Matrix Absorption) 动画演示——GPU 中发生了什么？
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
                点击下方按钮开/关“矩阵合并”，观察 GPU 是如何消除 96 头 Key 展开的！
              </p>
            </div>

            <button
              onClick={() => setIsAbsorbed(!isAbsorbed)}
              style={{
                background: isAbsorbed ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)'
              }}
            >
              {isAbsorbed ? '✅ 当前状态：已启用矩阵吸收 (零解压极速推理)' : '❌ 当前状态：传统按部就班解压 (未吸收)'}
            </button>
          </div>

          {/* Visual SVG Animation comparing Unabsorbed vs Absorbed State */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            <svg viewBox="0 0 900 320" width="100%" height="320" style={{ overflow: 'visible' }}>
              
              {!isAbsorbed ? (
                /* UNABSORBED STATE: Query -> W_uq -> (96 Head Q) * (96 Head K^T) <- W_uk <- Latent c_t */
                <g>
                  {/* Query latent */}
                  <rect x="40" y="130" width="100" height="40" rx="6" fill="#38BDF8" />
                  <text x="90" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Query q_t^C</text>
                  
                  {/* W_uq up projection */}
                  <rect x="180" y="110" width="110" height="80" rx="6" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="235" y="155" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">W_uq^T (Query 解压)</text>

                  {/* 96 Head Uncompressed Q */}
                  <rect x="340" y="80" width="80" height="140" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="380" y="145" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Q_t (96头)</text>

                  {/* Multiplication Dot */}
                  <circle cx="450" cy="150" r="14" fill="#FFB000" />
                  <text x="450" y="155" fill="#000" fontSize="16" fontWeight="bold" textAnchor="middle">×</text>

                  {/* 96 Head Uncompressed K^T */}
                  <rect x="480" y="80" width="80" height="140" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth="2" />
                  <text x="520" y="145" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">K_j^T (96头)</text>

                  {/* W_uk up projection */}
                  <rect x="610" y="110" width="110" height="80" rx="6" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="1.5" />
                  <text x="665" y="155" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">W_uk (Key 解压)</text>

                  {/* Latent c_j^KV */}
                  <rect x="760" y="130" width="100" height="40" rx="6" fill="#A78BFA" />
                  <text x="810" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Latent c_j^KV</text>

                  {/* Arrows */}
                  <line x1="140" y1="150" x2="180" y2="150" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="290" y1="150" x2="340" y2="150" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="760" y1="150" x2="720" y2="150" stroke="#A78BFA" strokeWidth="2" />
                  <line x1="610" y1="150" x2="560" y2="150" stroke="#A78BFA" strokeWidth="2" />

                  <text x="450" y="270" fill="#EF4444" fontSize="14" fontWeight="bold" textAnchor="middle">
                    ❌ 严重浪费！GPU 必须开辟巨大的中间显存，解压出 96 个头的 Q 和 K 再做矩阵乘法。
                  </text>
                </g>
              ) : (
                /* ABSORBED STATE: Query -> Absorbed W_QK -> Direct Dot with Latent c_t */
                <g>
                  {/* Query latent */}
                  <rect x="80" y="130" width="120" height="40" rx="6" fill="#38BDF8" />
                  <text x="140" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Query q_t^C</text>

                  <line x1="200" y1="150" x2="260" y2="150" stroke="#38BDF8" strokeWidth="2" />

                  {/* Combined W_QK Matrix */}
                  <g>
                    <rect x="260" y="90" width="220" height="120" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2.5" />
                    <text x="370" y="130" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">W_QK (吸收合并矩阵)</text>
                    <text x="370" y="155" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">W_QK = W_uq^T · W_uk^T</text>
                    <text x="370" y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">[模型加载时已预先相乘合并]</text>
                  </g>

                  <line x1="480" y1="150" x2="540" y2="150" stroke="#10B981" strokeWidth="2" />

                  {/* Multiplied Query q'_t */}
                  <rect x="540" y="130" width="130" height="40" rx="6" fill="#10B981" />
                  <text x="605" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">融合 Query q'_t</text>

                  <circle cx="710" cy="150" r="14" fill="#FFB000" />
                  <text x="710" y="155" fill="#000" fontSize="16" fontWeight="bold" textAnchor="middle">×</text>

                  <line x1="724" y1="150" x2="760" y2="150" stroke="#A78BFA" strokeWidth="2" />

                  {/* Latent c_j^KV */}
                  <rect x="760" y="130" width="120" height="40" rx="6" fill="#A78BFA" />
                  <text x="820" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Latent c_j^KV (512维)</text>

                  <text x="450" y="270" fill="#10B981" fontSize="14" fontWeight="bold" textAnchor="middle">
                    🚀 极致高效！96 个多头在 GPU 中被彻底“抹去”，直接在 512 维隐空间进行极速点积！
                  </text>
                </g>
              )}

            </svg>

            {/* Formula Math Box */}
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', width: '100%', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.05rem' }}>数学推导证明：矩阵结合律</span>
              <MathRenderer
                color="#10B981"
                formula={`// 1. 传统展开公式：先把隐向量解压为 96 头，再算点积
Score = Q_t · K_j^T = (q_t^C · W_{uq}^T) · (W_{uk} · c_j^{KV})^T

// 2. 矩阵结合律：将 W_{uq}^T 与 W_{uk}^T 提前相乘合并为 W_{QK}
Score = q_t^C · (W_{uq}^T · W_{uk}^T) · (c_j^{KV})^T = q_t^C · W_{QK} · (c_j^{KV})^T

// 3. 推理极速执行：只需一次矩阵乘法
q'_t = q_t^C · W_{QK} \quad \Rightarrow \quad Score = q'_t · (c_j^{KV})^T`}
              />
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ROPE DECOUPLING GRAPHIC */}
      {activeTab === 'ropeDecouple' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 语义与位置解耦双路图 (RoPE Decoupling Visual Architecture)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>
              为什么不能把旋转位置编码（RoPE）直接压缩进 512 维的隐向量中？下图展示了<b>语义独立与位置独立</b>的双路设计。
            </p>
          </div>

          {/* SVG Visual Graphic of RoPE Dual Path */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 880 280" width="100%" height="280" style={{ overflow: 'visible' }}>
              
              {/* Input Node */}
              <rect x="20" y="110" width="100" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
              <text x="70" y="145" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">输入 x_t</text>

              {/* Split Paths */}
              <path d="M 120 130 C 180 130, 180 60, 240 60" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 120 150 C 180 150, 180 220, 240 220" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* PATH A: SEMANTIC PATH */}
              <g>
                <rect x="240" y="30" width="340" height="60" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
                <text x="410" y="55" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">路径 A：纯语义 Latent 向量 c_t^KV (512 维)</text>
                <text x="410" y="75" fill="#94A3B8" fontSize="11" textAnchor="middle">无位置编码 · 静态权重矩阵 · 完美支持【矩阵吸收】</text>
              </g>

              {/* PATH B: ROPE POSITIONAL PATH */}
              <g>
                <rect x="240" y="190" width="340" height="60" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
                <text x="410" y="215" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">路径 B：独立位置 Key 向量 k_t^R (64 维)</text>
                <text x="410" y="235" fill="#94A3B8" fontSize="11" textAnchor="middle">专门施加 2D RoPE 旋转波形 (e^{`i m θ`}) · 所有多头共享</text>
              </g>

              {/* CONVERGENCE AT ATTENTION SCORE */}
              <path d="M 580 60 C 660 60, 660 130, 720 130" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 580 220 C 660 220, 660 150, 720 140" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* Final Score Node */}
              <rect x="720" y="110" width="140" height="60" rx="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
              <text x="790" y="135" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Attention Score</text>
              <text x="790" y="155" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">语义得分 + 位置得分</text>

            </svg>
          </div>

        </div>
      )}

      {/* TAB 4: MEMORY CALCULATOR & VISUAL VOLUMETRIC COMPARISON */}
      {activeTab === 'memoryCalculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📊 显存体积直观对比柱状图与实时计算器
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
              通过直观的柱状图体积对比，看懂为什么 Kimi K3 能够原生支持 100 万 Token 长上下文。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            
            {/* Controls */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>⚙️ 参数调节 (Context Sliders)</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>上下文长度:</span>
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
                  <span style={{ color: '#94A3B8' }}>低秩隐维度 d_c:</span>
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

            {/* Visual Bar Comparison Chart */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>单层 KV Cache 显存占用对比 (GB)</span>

              {/* Bar 1: Standard MHA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}>❌ 传统 96 头 MHA (Standard Multi-Head Attention)</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontFamily: 'monospace' }}>{mhaMemoryGB} GB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Bar 2: Kimi K3 MLA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✅ Kimi K3 Gated MLA (Multi-Head Latent Attention)</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{mlaMemoryGB} GB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (parseFloat(mlaMemoryGB) / parseFloat(mhaMemoryGB)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', borderRadius: '4px', transition: 'width 0.3s ease-in-out' }} />
                </div>
              </div>

              <div style={{ marginTop: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem', textAlign: 'center' }}>
                🎉 显存暴降 {savingsRatio} 倍！支持单卡加载超级超长上下文！
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
