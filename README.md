# Model Insider (模型内幕) 🌟

[![GitHub Repo](https://img.shields.io/badge/GitHub-JoAIBox%2Fmodel__insider-blue?logo=github)](https://github.com/JoAIBox/model_insider)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb?logo=react)](https://reactjs.org/)

**Model Insider** 是一个前沿大语言模型（LLM）与原生多模态模型（VLM）架构机制的开源**交互式可视化深度探秘平台**。通过高度精细的参数拓扑图、动态算子数据流动画、高维潜空间数学模拟器与全流程交互控制台，让复杂的大模型神经网络机制直观易懂。

---

## 🎯 项目目标 (Project Goals)

1. **破译前沿大模型黑盒**：将论文与技术报告中复杂的数学公式（如 Delta Attention、Attention Residuals、Pixel Shuffle 空间下采样、MoE 专家路由等）转化为可手操控制的动态交互模拟器。
2. **多模型通用架构平台**：采用模块化子项目架构，支持对比与探索不同前沿模型（Kimi K3、DeepSeek R1/V3、Claude Fable、GPT Sol 等）的底层实现异同。
3. **教学与研究级可视化**：为 AI 研究员、算法工程师与深度学习爱好者提供从“输入 Token 映射”到“底层 GPU 集群并行基建”的全栈可视化指南。

---

## 🗺️ 目录结构与支持模型 (Directory & Models)

```
model_insider/
├── kimi_k3/                  🌟 [已完成] Kimi K3 (2.78T MoE + 27层 MoonViT 原生多模态)
│   ├── src/
│   │   ├── components/       包含 21 个交互式算子与架构演示组件
│   │   │   ├── MultimodalTokenSimulator.tsx  (§2.6 Layer 0 多模态 Tokenizer)
│   │   │   ├── KDASimulator.tsx               (§2.1 Delta Attention 增量注意力)
│   │   │   ├── AttnResSimulator.tsx           (§2.2 Attention Residuals 残差)
│   │   │   ├── MoESimulator.tsx               (§2.3 Stable LatentMoE 路由)
│   │   │   ├── MoonViTSimulator.tsx           (§2.4 Native Vision 视觉编码)
│   │   │   ├── PerHeadMuonSimulator.tsx       (§2.5 Per-Head Muon 优化器)
│   │   │   └── ...
│   │   └── App.tsx
│   └── package.json
├── deepseek_r1/              🚀 [规划中] DeepSeek R1/V3 (MLA + GRPO 强化学习)
└── gpt_sol/                  🚀 [规划中] Frontier 架构对比与基准流
```

---

## 🌟 当前状态：Kimi K3 模块特性 (Current Status: Kimi K3)

目前项目已完整实现 **Kimi K3（2.78 万亿参数 MoE 混合专家模型）** 的全套架构解密与 7 大章节交互演示：

* **第 1 章：系统宏观概览**：93 层 Hybrid Backbone + 27 层 MoonViT 90 秒互动引导导览。
* **第 2 章：模型架构探秘**：
  * **§2.1 Delta Attention (KDA)**：S_t 循环状态更新矩阵与动态 Key/Value 衰减门控；
  * **§2.2 Attention Residuals (AttnRes)**：跨层隐藏状态召回与层深度信号衰减曲线；
  * **§2.3 Stable LatentMoE**：16/896 路由专家 + 2 共享专家与隐空间压强平衡；
  * **§2.4 Native Vision**：MoonViT-V2 切片编码与 Factorized 空间+时间注意力；
  * **§2.5 Per-Head Muon**：Newton-Schulz 正交迭代正交化矩阵更新模拟；
  * **§2.6 Multimodal Tokenizer (最新上线)**：
    * 离散文本 BPE 查表 ($W_{\text{emb}}$) vs 连续图像神经网络矩阵乘法 ($W_{\text{proj}}$) 对比；
    * 14×14×3 (588d 像素) $\rightarrow$ 512d ViT 向量 $\rightarrow$ 2×2 Pixel Shuffle (2,048d) $\rightarrow$ 7,168d 对齐全流程；
    * 7,168 维高维潜空间向量点积注意力相关度计算模拟；
    * 2,048d 单 Token 逆向重构还原 $28 \times 28$ 像素画面验证器。
* **第 3 章：预训练**：20T+ 混合数据桶权重与学习率 Schedule 曲线。
* **第 4 章：后训练与推理**：Async RL 异步强化学习轨迹与 EAGLE-3 投机解码推断沙盒。
* **第 5 章：硬件基建**：Multi-GPU 流水线并行与 Memory Budget 计算器。
* **第 6 章：评测与安全**：6.1 交互式能力雷达图、6.2 动态柱状图与 6.3 成本/性能散点图。
* **第 7 章：工程案例**：编译器与芯片项目算子图。

---

## 🚀 快速开始 (Quick Start)

### 1. 克隆项目与运行 Kimi K3 演示

```bash
git clone git@github.com:JoAIBox/model_insider.git
cd model_insider/kimi_k3

# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173/)
npm run dev
```

### 2. 生产构建与 Lint 检查

```bash
npm run lint
npm run build
```

---

## 🤝 贡献与开源许可

欢迎提交 Issue 或 PR 为 Model Insider 补充更多模型的架构可视化模块！
本项目基于 [MIT License](LICENSE) 开源。
