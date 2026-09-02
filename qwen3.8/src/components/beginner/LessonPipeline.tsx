import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine } from './BeginnerAcademy';

/* ============ Lesson 6: 推理流水线 (Qwen 3.8 适配) ============ */

/* ---------- Scene 1: 多模态输入对齐 ---------- */
const Scene1: React.FC = () => {
  return (
    <svg viewBox="0 0 760 260" width="100%" height="260">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">第 1 阶段：多模态输入对齐</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">无论输入是文本还是图像，最终都投影到统一的 5,120 维向量空间：</text>

      <g transform="translate(20,80)">
        {/* 文本分词 */}
        <rect x="0" y="0" width="160" height="50" rx="8" fill="rgba(56,189,248,0.1)" stroke="#38BDF8" strokeWidth="1.2" />
        <text x="80" y="22" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">文本 Tokenizer</text>
        <text x="80" y="38" fill="#94A3B8" fontSize="10" textAnchor="middle">151,936 词表查表</text>

        {/* 图像编码 */}
        <rect x="0" y="70" width="160" height="50" rx="8" fill="rgba(167,139,250,0.1)" stroke="#A78BFA" strokeWidth="1.2" />
        <text x="80" y="92" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">ViT 视觉编码器</text>
        <text x="80" y="108" fill="#94A3B8" fontSize="10" textAnchor="middle">14×14 Patch + 2×2 Shuffle</text>

        <FlowLine x1={170} y1={25} x2={250} y2={60} color="#38BDF8" />
        <FlowLine x1={170} y1={95} x2={250} y2={60} color="#A78BFA" />

        {/* 统一向量流 */}
        <rect x="260" y="35" width="220" height="50" rx="8" fill="rgba(0,242,254,0.12)" stroke="#00F2FE" strokeWidth="1.5" />
        <text x="370" y="58" fill="#00F2FE" fontSize="13" fontWeight="bold" textAnchor="middle">统一 5,120 维 Token 序列</text>
        <text x="370" y="74" fill="#94A3B8" fontSize="10" textAnchor="middle">[x_1, x_2, x_3, ..., x_T]</text>

        <FlowLine x1={490} y1={60} x2={560} y2={60} color="#00F2FE" />
        <rect x="570" y="35" width="130" height="50" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="1.2" />
        <text x="635" y="65" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">进入 64 层骨干</text>
      </g>

      <text x="20" y="230" fill="#94A3B8" fontSize="12.5">
        对骨干网络而言，没有「文本」或「图像」的区别，只有同一空间中的 5,120 维特征向量。
      </text>
    </svg>
  );
};

/* ---------- Scene 2: 64层骨干处理 ---------- */
const Scene2: React.FC = () => {
  return (
    <svg viewBox="0 0 760 250" width="100%" height="250">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">第 2 阶段：64 层深度思考</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">向量流连续穿越 16 个 3:1 周期（48 门控 GDN + 16 全局注意力）：</text>

      <g transform="translate(20,80)">
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={i * 88} y={0} width={76} height={60} rx={8}
              fill={i === 7 ? 'rgba(196,181,253,0.2)' : 'rgba(103,232,249,0.08)'}
              stroke={i === 7 ? '#c4b5fd' : '#67e8f9'} strokeWidth="1.2" />
            <text x={i * 88 + 38} y={26} fill={i === 7 ? '#c4b5fd' : '#67e8f9'} fontSize="11" fontWeight="bold" textAnchor="middle">
              Cycle {i + 1}
            </text>
            <text x={i * 88 + 38} y={44} fill="#94A3B8" fontSize="9" textAnchor="middle">
              L{i * 4 + 1}-L{i * 4 + 4}
            </text>
            {i < 7 && <FlowLine x1={i * 88 + 78} y1={30} x2={i * 88 + 86} y2={30} color="#67e8f9" />}
          </g>
        ))}
      </g>

      <text x="20" y="180" fill="#94A3B8" fontSize="12.5">
        在穿越过程中，每个 Token 的向量不断吸收前面上下文的语义，从简单的物理符号演变为深刻的抽象概念。
      </text>
    </svg>
  );
};

/* ---------- Scene 3: LM Head 选词预测 ---------- */
const Scene3: React.FC = () => {
  const topTokens = [
    { word: '模型', prob: '84.2%', active: true },
    { word: '系统', prob: '11.5%' },
    { word: '架构', prob: '3.1%' },
    { word: '网络', prob: '0.8%' },
  ];

  return (
    <svg viewBox="0 0 760 260" width="100%" height="260">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">第 3 阶段：LM Head 生成下一个 Token</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">最后一个 Token 的向量被映射回 151,936 个词表概率分布，选出最可能的词：</text>

      <g transform="translate(20,74)">
        {/* 向量 */}
        <rect x="0" y="20" width="120" height="40" rx="6" fill="rgba(103,232,249,0.1)" stroke="#67e8f9" strokeWidth="1.2" />
        <text x="60" y="44" fill="#67e8f9" fontSize="12" fontWeight="bold" textAnchor="middle">末位向量 5,120d</text>

        <FlowLine x1={125} y1={40} x2={195} y2={40} color="#67e8f9" />

        {/* LM Head */}
        <rect x="200" y="10" width="130" height="60" rx="8" fill="#0A0F1D" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="265" y="34" fill="#c4b5fd" fontSize="13" fontWeight="bold" textAnchor="middle">LM Head 矩阵</text>
        <text x="265" y="52" fill="#94A3B8" fontSize="10" textAnchor="middle">5,120 → 151,936</text>

        <FlowLine x1={335} y1={40} x2={405} y2={40} color="#c4b5fd" />

        {/* Top-K 词列表 */}
        <g transform="translate(415,-10)">
          {topTokens.map((tk, i) => (
            <g key={i}>
              <rect x={0} y={i * 26} width={280} height={22} rx={4}
                fill={tk.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)'}
                stroke={tk.active ? '#10b981' : 'rgba(255,255,255,0.08)'} />
              <text x={12} y={i * 26 + 15} fill={tk.active ? '#10b981' : '#E2E8F0'} fontSize="11" fontWeight={tk.active ? 'bold' : 'normal'}>
                「{tk.word}」
              </text>
              <text x={268} y={i * 26 + 15} fill={tk.active ? '#10b981' : '#94A3B8'} fontSize="10" fontFamily="monospace" textAnchor="end">
                {tk.prob}
              </text>
            </g>
          ))}
        </g>
      </g>

      <text x="20" y="225" fill="#94A3B8" fontSize="12.5">
        生成出来的词「模型」又会被追加到句子末尾，作为下一步的输入——这就是自回归（Autoregressive）生成。
      </text>
    </svg>
  );
};

export const LessonPipeline: BeginnerLesson = {
  id: 'pipeline',
  label: '完整推理流水线',
  emoji: '⚙️',
  title: '第 6 课 · 完整推理流水线',
  subtitle: '从用户输入到生成回答的完整生命周期。',
  scenes: [
    {
      title: '第 1 阶段：多模态输入对齐',
      analogy: '像把不同语言的文档都翻译成统一的内部工作语言。',
      explain: <>文本和图像首先通过对应的编码器转化为统一的 <b>5,120 维向量序列</b>。</>,
      visual: <Scene1 />,
      keypoint: '多模态 Token 在 5,120 维空间完美统一。',
    },
    {
      title: '第 2 阶段：64 层深度思考',
      analogy: '64 个连续专家评审团逐轮讨论、深化理解。',
      explain: <>向量流连续穿越 16 个 3:1 周期（GDN + 注意力），完成深度推理与上下文融合。</>,
      visual: <Scene2 />,
      keypoint: 'GDN 快速记忆 + 注意力精准检索协同工作。',
    },
    {
      title: '第 3 阶段：LM Head 生成下一个 Token',
      analogy: '最终投票选出最适合的下一个词，并追加到末尾。',
      explain: <>末位向量通过 LM Head 投影到 151,936 个词表上，按 Softmax 概率选词自回归生成。</>,
      visual: <Scene3 />,
      keypoint: '一步一词，自回归循环输出。',
    },
  ],
};
